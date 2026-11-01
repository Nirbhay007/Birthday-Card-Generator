import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { pollTokenFor, safeEqual } from '@/lib/premiumTokens';
import { resolveRazorpayKeys } from '@/lib/razorpayKeys';

/**
 * GET /api/premium/order/resume?orderId=order_...&rt=<pollToken>
 *
 * Resolves a signed recovery link back to the exact checkout. The token is the
 * same per-order HMAC used by the status poller, so a bare order id cannot be
 * used to enumerate orders. Returns only what the checkout needs — never the
 * buyer's contact string, unlock token, or payment id.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = String(searchParams.get('orderId') || '').trim();
        const token = String(searchParams.get('rt') || '').trim();

        if (!orderId || orderId.length < 10) {
            return NextResponse.json({ success: false, error: 'Missing order.' }, { status: 400 });
        }

        const expected = pollTokenFor(orderId);
        if (!safeEqual(expected, token)) {
            return NextResponse.json({ success: false, error: 'This recovery link is invalid.' }, { status: 403 });
        }

        const order = await prisma.premiumOrder.findUnique({
            where: { orderId },
            select: {
                orderId: true,
                tier: true,
                pageId: true,
                amount: true,
                currency: true,
                status: true,
                createdAt: true,
                buyerContact: true,
            },
        });

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            paid: order.status === 'paid',
            keyId: resolveRazorpayKeys().keyId,
            order: {
                orderId: order.orderId,
                tier: order.tier || 'universe',
                pageId: order.pageId || null,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                createdAt: order.createdAt,
                hasEmail: /@/.test(String(order.buyerContact || '')),
            },
        });
    } catch (error) {
        console.error('Order resume error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Could not load this checkout.' }, { status: 500 });
    }
}
