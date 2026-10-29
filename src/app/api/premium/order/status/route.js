import { NextResponse, after } from 'next/server';
import prisma from '@/lib/prisma';
import { pollTokenFor, safeEqual } from '@/lib/premiumTokens';
import { sendReceiptForOrder } from '@/lib/email';

/**
 * GET /api/premium/order/status?orderId=order_...&token=<pollToken>
 *
 * Lightweight poller for UPI recovery: returns { paid, unlockKey } once the
 * webhook (or verify) has marked the order paid, or { paid: false } otherwise.
 *
 * Why this exists: on mobile, UPI payments require switching to another app
 * (PhonePe / GPay / Paytm) to enter the PIN. Mobile browsers frequently kill
 * the background tab, so the Razorpay JS callback never fires. This endpoint
 * lets the client poll until the server-side webhook confirms the payment.
 *
 * The unlockKey is a bearer credential, so the poller requires the per-order
 * `pollToken` issued with the order (HMAC of the order id, same derivation as
 * /api/premium/order). An order id alone is not enough to fetch it.
 */

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');
        const token = searchParams.get('token') || '';
        if (!orderId || typeof orderId !== 'string' || orderId.length < 10) {
            return NextResponse.json({ paid: false });
        }

        const expected = pollTokenFor(orderId);
        if (!safeEqual(expected, token)) {
            return NextResponse.json({ paid: false, error: 'Invalid poll token' }, { status: 403 });
        }

        const row = await prisma.premiumOrder.findUnique({
            where: { orderId },
            select: { status: true, unlockToken: true, pageId: true, receiptSentAt: true },
        });

        if (row?.status === 'paid' && row.unlockToken) {
            // UPI recovery path: the webhook may have marked this paid after
            // the browser was killed. Send the receipt here too, but only if
            // no trigger has claimed it yet.
            if (!row.receiptSentAt) {
                try {
                    after(() => sendReceiptForOrder(orderId).catch((err) => {
                        console.error('Receipt send failed (poll):', err?.message || err);
                    }));
                } catch (err) {
                    console.error('Receipt scheduling failed (poll):', err?.message || err);
                }
            }
            return NextResponse.json({
                paid: true,
                unlockKey: row.unlockToken,
                pageId: row.pageId || null,
            });
        }

        return NextResponse.json({ paid: false });
    } catch (e) {
        console.error('Order status poll error:', e?.message || e);
        return NextResponse.json({ paid: false });
    }
}
