import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pollTokenFor, safeEqual } from '@/lib/premiumTokens';

/**
 * POST /api/premium/failure — record why a checkout did not complete.
 *
 * The browser calls this from Razorpay's `payment.failed` event (via
 * sendBeacon/keepalive) and again with `code: 'DISMISSED'` when the modal is
 * closed before any successful payment. The Razorpay webhook writes the same
 * fields server-side, so a killed tab still produces a trace.
 *
 * Body: { orderId, token, code?, reason?, method? }
 *   token = the per-order pollToken issued by /api/premium/order.
 *
 * Guardrails:
 *  - Only the browser holding that order's pollToken may write.
 *  - Paid orders are never downgraded: the update filters status != 'paid'.
 *  - A later DISMISSED never overwrites a concrete failure already recorded.
 *  - Fail-open if the additive columns have not been migrated yet, so the
 *    buyer's checkout is never blocked by analytics.
 */

/**
 * Flatten arbitrary input to a single printable line. Removes C0/C1 control
 * characters (not just newlines) so nothing can break log formatting or forge
 * an extra line in an admin view.
 */
function oneLine(value, max) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max);
}

/** Razorpay codes look like BAD_REQUEST_ERROR / CARD_DECLINED / DISMISSED. */
function cleanCode(value) {
    const code = oneLine(value, 60).toUpperCase();
    return /^[A-Z0-9_.:-]+$/.test(code) ? code : '';
}

/** Payment instruments are lowercase tokens: card, upi, netbanking, wallet. */
function cleanMethod(value) {
    const method = oneLine(value, 40).toLowerCase();
    return /^[a-z0-9_-]+$/.test(method) ? method : null;
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
        const token = typeof body?.token === 'string' ? body.token : '';

        if (!/^[A-Za-z0-9_-]{8,80}$/.test(orderId)) {
            return NextResponse.json({ success: false, error: 'Unknown order' }, { status: 400 });
        }

        const expected = pollTokenFor(orderId);
        if (!safeEqual(expected, token)) {
            return NextResponse.json({ success: false, error: 'Invalid order token' }, { status: 403 });
        }

        const code = cleanCode(body?.code) || 'PAYMENT_FAILED';
        const reason = oneLine(body?.reason, 300) || null;
        const method = cleanMethod(body?.method);

        // A dismissal is the weakest signal: only fill an empty slot. A real
        // decline that already landed for this order stays the story.
        const where = { orderId, status: { not: 'paid' } };
        if (code === 'DISMISSED') where.failureCode = null;

        let result;
        try {
            result = await prisma.premiumOrder.updateMany({
                where,
                data: {
                    status: 'failed',
                    failureCode: code,
                    failureReason: reason,
                    failureMethod: method,
                    failedAt: new Date(),
                },
            });
        } catch (dbError) {
            // Deployment-order safety: the additive columns may not be present
            // yet. Tracking must never break the checkout.
            if (dbError?.code === 'P2021' || dbError?.code === 'P2022') {
                return NextResponse.json({ success: true, stored: false });
            }
            throw dbError;
        }

        let paid = false;
        if (result.count === 0) {
            const row = await prisma.premiumOrder
                .findUnique({ where: { orderId }, select: { status: true } })
                .catch(() => null);
            paid = row?.status === 'paid';
        }

        return NextResponse.json({ success: true, stored: result.count > 0, paid });
    } catch (error) {
        console.error('Premium failure report error:', error?.message || error);
        // Fail-open: a lost diagnostic is better than a blocked checkout.
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
