import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

/**
 * POST /api/premium/webhook — Razorpay event webhook (reconciliation).
 *
 * Why this exists: if a payer completes UPI payment but closes the browser
 * before our verify call returns, the order would stay 'created' forever.
 * Razorpay retries this webhook until we acknowledge, closing that gap.
 *
 * Setup: Razorpay Dashboard → Settings → Webhooks → Add endpoint
 *   URL: https://birthday.nirbhay.online/api/premium/webhook
 *   Events: payment.captured
 *   Secret: any random string → set as RAZORPAY_WEBHOOK_SECRET.
 * Without the secret this endpoint acknowledges without acting (200).
 */

export async function POST(request) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    let payload = null;
    try {
        const raw = await request.text();
        if (!secret) return NextResponse.json({ ok: true, mode: 'unconfigured' });

        const signature = request.headers.get('x-razorpay-signature') || '';
        const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
        if (expected.length !== signature.length) {
            return NextResponse.json({ ok: false }, { status: 401 });
        }
        let diff = 0;
        for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
        if (diff !== 0) return NextResponse.json({ ok: false }, { status: 401 });

        payload = JSON.parse(raw);
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    try {
        if (payload?.event === 'payment.captured') {
            const payment = payload?.payload?.payment?.entity || {};
            const orderId = payment.order_id;
            const paymentId = payment.id;
            if (orderId && paymentId) {
                const existing = await prisma.premiumOrder
                    .findUnique({ where: { orderId }, select: { unlockToken: true, status: true } })
                    .catch(() => null);
                const unlockToken = existing?.unlockToken || `unlock_${crypto.randomBytes(24).toString('hex')}`;
                await prisma.premiumOrder.upsert({
                    where: { orderId },
                    update: { paymentId, status: 'paid', paidAt: new Date(), unlockToken },
                    create: {
                        orderId,
                        paymentId,
                        amount: payment.amount || 0,
                        currency: payment.currency || 'INR',
                        status: 'paid',
                        paidAt: new Date(),
                        unlockToken,
                    },
                });
            }
        }
    } catch (dbError) {
        // Acknowledge anyway (avoid retry storms); the gap is logged loudly.
        console.error('Premium webhook store failed:', dbError?.message || dbError);
    }
    return NextResponse.json({ ok: true });
}
