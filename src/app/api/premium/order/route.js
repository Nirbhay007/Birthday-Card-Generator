import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import prisma from '@/lib/prisma';

/**
 * POST /api/premium/order { region: 'IN' | 'INTL' }
 *
 * Creates a Razorpay order server-side. The price is fixed HERE — the client
 * never decides the amount. Returns { orderId, amount, currency, keyId } for
 * Razorpay Checkout, or 503 { testMode: true } when keys are missing.
 */

const PRICES = {
    IN: { amount: 4900, currency: 'INR' }, // ₹49
    INTL: { amount: 100, currency: 'USD' }, // $1
};

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

function razorpayClient() {
    // Key ID is public by design — fall back to the NEXT_PUBLIC copy so a
    // missing server-only var can never silently force test mode.
    // .trim() because pasted secrets often carry invisible whitespace.
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!keyId || !secret) return null;
    return new Razorpay({ key_id: keyId, key_secret: secret });
}

export async function POST(request) {
    const rzp = razorpayClient();
    if (!rzp) {
        return NextResponse.json(
            { success: false, testMode: true, error: 'Live payments are not connected yet (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).' },
            { status: 503 }
        );
    }

    try {
        const body = await request.json().catch(() => ({}));
        const region = body?.region === 'INTL' ? 'INTL' : 'IN';
        const { amount, currency } = PRICES[region];

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (throttled(ip)) {
            return NextResponse.json({ success: false, error: 'Slow down' }, { status: 429 });
        }

        const order = await rzp.orders.create({
            amount,
            currency,
            receipt: `prem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
            notes: { product: 'birthday-premium-universe', region },
        });

        // Best-effort receipt (never blocks checkout if the table is missing)
        try {
            await prisma.premiumOrder.create({
                data: { orderId: order.id, amount, currency, status: 'created' },
            });
        } catch (dbError) {
            console.error('PremiumOrder create failed (pending migration?):', dbError?.message || dbError);
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount,
            currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        const desc = error?.error?.description || error?.message || error;
        console.error('Premium order error:', desc);
        // 401 from Razorpay = our key/secret pair is wrong (test/live mixed,
        // typo, or pasted with whitespace). Say so plainly — generic 502s
        // waste everyone's evening.
        const status = error?.statusCode || error?.error?.code;
        if (status === 401 || /authentication|unauthori[sz]ed/i.test(String(desc))) {
            return NextResponse.json(
                { success: false, error: 'Payment gateway rejected our keys. The owner has been notified — please try again in a bit.' },
                { status: 502 }
            );
        }
        return NextResponse.json({ success: false, error: 'Could not start checkout. Please try again.' }, { status: 502 });
    }
}
