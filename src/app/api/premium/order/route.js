import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/clientIp';
import prisma from '@/lib/prisma';
import { pollTokenFor } from '@/lib/premiumTokens';
import { resolveRazorpayKeys } from '@/lib/razorpayKeys';

/**
 * POST /api/premium/order { region: 'IN' | 'INTL' }
 *
 * Creates a Razorpay order server-side. The price is fixed HERE — the client
 * never decides the amount. Returns { orderId, amount, currency, keyId } for
 * Razorpay Checkout, or 503 { testMode: true } when keys are missing.
 */

const PRICES = {
    card_vip: {
        IN: { amount: 4900, currency: 'INR' }, // ₹49
        INTL: { amount: 100, currency: 'USD' }, // $1
    },
    universe: {
        IN: { amount: 9900, currency: 'INR' }, // ₹99
        INTL: { amount: 100, currency: 'USD' }, // $1
    },
    group_card: {
        IN: { amount: 9900, currency: 'INR' }, // ₹99
        INTL: { amount: 200, currency: 'USD' }, // $2
    },
};

const TIERS = new Set(['card_vip', 'universe', 'group_card']);

// Best-effort per-IP throttle (mirrors the other counter routes).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map();

function throttled(ip) {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    arr.push(now);
    hits.set(ip, arr);
    if (hits.size > 5000) hits.delete(hits.keys().next().value);
    return arr.length > MAX_PER_WINDOW;
}

/**
 * Buyer-supplied receipt contact (email and/or phone). Optional, never shown
 * on the card, and only used for support recovery. Control characters are
 * stripped so the value can never forge a second line in an admin view.
 */
function cleanBuyerContact(value) {
    if (typeof value !== 'string') return null;
    const clean = value
        .replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200);
    return clean || null;
}

/**
 * Call Razorpay's Orders API directly via native fetch instead of the axios-based
 * Node SDK (whose error normalizer throws TypeError on undefined err.response in
 * Cloudflare Workers). Retries once on transient network or 5xx errors.
 */
async function createRazorpayOrder({ keyId, secret, payload }) {
    const auth = Buffer.from(`${keyId}:${secret}`).toString('base64');
    let lastError;

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000),
            });

            const raw = await response.text();
            let data = null;
            try {
                data = raw ? JSON.parse(raw) : null;
            } catch {
                data = null;
            }

            if (response.ok && data?.id) {
                return data;
            }

            const err = new Error(data?.error?.description || raw.slice(0, 300) || `HTTP ${response.status}`);
            err.statusCode = response.status;
            err.code = data?.error?.code || null;

            if (response.status >= 500 && attempt < 2) {
                lastError = err;
                await new Promise((resolve) => setTimeout(resolve, 200));
                continue;
            }
            throw err;
        } catch (err) {
            lastError = err;
            const status = err?.statusCode;
            const retryable = !status || status >= 500;
            if (!retryable || attempt >= 2) {
                throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }

    throw lastError;
}

export async function POST(request) {
    const { keyId, secret } = resolveRazorpayKeys();
    if (!keyId || !secret) {
        return NextResponse.json(
            { success: false, testMode: true, error: 'Live payments are not connected yet (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).' },
            { status: 503 }
        );
    }

    try {
        const body = await request.json().catch(() => ({}));
        const region = body?.region === 'INTL' ? 'INTL' : 'IN';
        const tier = TIERS.has(body?.tier) ? body.tier : 'universe';
        const pageId = typeof body?.pageId === 'string' && body.pageId.trim() ? body.pageId.trim().slice(0, 60) : null;
        const snapshotUrl = typeof body?.snapshotUrl === 'string' && body.snapshotUrl.trim() ? body.snapshotUrl.trim().slice(0, 2000) : null;
        const buyerContact = cleanBuyerContact(body?.buyerContact);

        // A group card is always attached to a card; without one there is
        // nothing to share with contributors.
        if (tier === 'group_card' && !pageId) {
            return NextResponse.json({ success: false, error: 'Create the card first, then turn it into a group card.' }, { status: 400 });
        }

        const { amount, currency } = (PRICES[tier] || PRICES.universe)[region];

        const ip = getClientIp(request);
        if (ip && throttled(ip)) {
            return NextResponse.json({ success: false, error: 'Slow down' }, { status: 429 });
        }

        const order = await createRazorpayOrder({
            keyId,
            secret,
            payload: {
                amount,
                currency,
                receipt: `prem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
                notes: {
                    product: tier === 'card_vip'
                        ? 'birthday-vip-card'
                        : tier === 'group_card' ? 'birthday-group-card' : 'birthday-premium-universe',
                    region,
                    ...(pageId ? { pageId } : {}),
                },
            },
        });

        // Best-effort receipt (never blocks checkout if the table is missing)
        try {
            await prisma.premiumOrder.create({
                data: { orderId: order.id, amount, currency, status: 'created', pageId, tier, snapshotUrl, buyerContact },
            });
        } catch (dbError) {
            console.error('PremiumOrder create failed (pending migration?):', dbError?.message || dbError);
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount,
            currency,
            keyId: keyId,
            pollToken: pollTokenFor(order.id),
        });
    } catch (error) {
        const desc = error?.error?.description || error?.message || String(error);
        const status = error?.statusCode || error?.error?.code || 'unknown';
        const code = error?.code || error?.error?.code || 'none';
        console.error(`Premium order error (status=${status}, code=${code}): ${desc}`);
        // 401 from Razorpay = our key/secret pair is wrong (test/live mixed,
        // typo, or pasted with whitespace). Say so plainly — generic 502s
        // waste everyone's evening.
        if (status === 401 || /authentication|unauthori[sz]ed/i.test(String(desc))) {
            return NextResponse.json(
                { success: false, error: 'Payment gateway rejected our keys. The owner has been notified — please try again in a bit.' },
                { status: 502 }
            );
        }
        if (/currency.*not.*supported|international/i.test(String(desc))) {
            return NextResponse.json(
                { success: false, error: 'International card payments are currently undergoing routine verification with the bank (1 day). Please check back soon!' },
                { status: 502 }
            );
        }
        return NextResponse.json({ success: false, error: 'Could not start checkout. Please try again.' }, { status: 502 });
    }
}
