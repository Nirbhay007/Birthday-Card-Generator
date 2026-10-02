import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Donation-funnel analytics (append-only, no PII — no cookies, no IP stored).
 * POST /api/support/track { event: 'modal_open' | 'pay_click' | 'copy_upi', amount?, path? }
 *
 * NOTE on UPI: a `upi://pay` link hands off to GPay/PhonePe with no callback,
 * so `pay_click` measures payment *intent*, never completed payments.
 *
 * Fail-open by design: tracking failures (including the SupportEvent table
 * not being migrated yet) never break the donate modal — they just log.
 */

const EVENTS = new Set(['modal_open', 'pay_click', 'copy_upi', 'paywall_open', 'checkout_start', 'premium_unlock']);

// Best-effort per-IP throttle, mirroring the birthday react route.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map();

function throttled(ip) {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    arr.push(now);
    hits.set(ip, arr);
    if (hits.size > 5000) hits.delete(hits.keys().next().value);
    return arr.length > MAX_PER_WINDOW;
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { event, amount, path } = body || {};

        if (!EVENTS.has(event)) {
            return NextResponse.json({ success: false, error: 'Unknown event' }, { status: 400 });
        }

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (throttled(ip)) {
            return NextResponse.json({ success: false, error: 'Slow down' }, { status: 429 });
        }

        const n = typeof amount === 'number' ? amount : parseInt(amount, 10);
        const validAmount = Number.isFinite(n) && n >= 1 && n <= 100000 ? Math.trunc(n) : null;
        const cleanPath = typeof path === 'string' && path.startsWith('/')
            ? path.slice(0, 200)
            : null;

        await prisma.supportEvent.create({
            data: {
                event,
                // Amount is only meaningful on pay clicks; ignore it otherwise
                // so amount breakdowns stay clean.
                amount: event === 'pay_click' ? validAmount : null,
                path: cleanPath,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        // Fail-open: never break the donate flow on tracking errors
        // (e.g. SupportEvent table not migrated yet).
        console.error('Support track error:', error?.message || error);
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
