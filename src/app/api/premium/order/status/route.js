import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/premium/order/status?orderId=order_...
 *
 * Lightweight poller for UPI recovery: returns { paid, unlockKey } once the
 * webhook (or verify) has marked the order paid, or { paid: false } otherwise.
 *
 * Why this exists: on mobile, UPI payments require switching to another app
 * (PhonePe / GPay / Paytm) to enter the PIN. Mobile browsers frequently kill
 * the background tab, so the Razorpay JS callback never fires. This endpoint
 * lets the client poll until the server-side webhook confirms the payment.
 */
export async function GET(request) {
    try {
        const orderId = new URL(request.url).searchParams.get('orderId');
        if (!orderId || typeof orderId !== 'string' || orderId.length < 10) {
            return NextResponse.json({ paid: false });
        }

        const row = await prisma.premiumOrder.findUnique({
            where: { orderId },
            select: { status: true, unlockToken: true, pageId: true },
        });

        if (row?.status === 'paid' && row.unlockToken) {
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
