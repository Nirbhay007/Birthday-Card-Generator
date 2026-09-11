import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

/**
 * POST /api/premium/verify — confirm a premium payment, unlock the universe.
 *
 * Live body: { provider: 'razorpay', orderId, paymentId, signature }
 *   1. HMAC-verifies the signature with RAZORPAY_KEY_SECRET.
 *   2. Marks the PremiumOrder row paid (idempotent — replays stay paid).
 *   3. Mints a magic-link `unlockKey` (stored on the order, returned once).
 * Key body: { provider: 'key', key: 'unlock_…' } — validates a magic link /
 *   remembered device. No signature needed: 192-bit random + DB lookup.
 * Test body: { provider: 'test' } → { success, testMode: true } (dev/unconfigured only).
 */

function bad(msg, status = 400) {
    return NextResponse.json({ success: false, error: msg }, { status });
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { provider, orderId, paymentId, signature } = body || {};

        if (provider === 'razorpay') {
            const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
            if (!secret) return bad('Card verification is not connected yet (missing RAZORPAY_KEY_SECRET).', 503);
            if (!orderId || !paymentId || !signature) return bad('Incomplete payment details.');

            const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
            const sig = String(signature);
            if (expected.length !== sig.length) return bad('Verification failed.', 402);
            let diff = 0;
            for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
            if (diff !== 0) return bad('Verification failed.', 402);

            // Mark paid (idempotent) + capture amount for the receipt.
            // CRITICAL: unlockKey is returned ONLY if it was actually persisted.
            // A key that never reaches the DB is a dead magic link — worse
            // than no key at all, because the payer trusts it.
            let amount = null;
            let currency = null;
            let unlockKey = null;
            try {
                const existing = await prisma.premiumOrder.findUnique({ where: { orderId }, select: { unlockToken: true } }).catch(() => null);
                const token = existing?.unlockToken || `unlock_${crypto.randomBytes(24).toString('hex')}`;
                const row = await prisma.premiumOrder.upsert({
                    where: { orderId },
                    update: { paymentId, status: 'paid', paidAt: new Date(), unlockToken: token },
                    create: { orderId, paymentId, amount: 0, currency: 'INR', status: 'paid', paidAt: new Date(), unlockToken: token },
                    select: { amount: true, currency: true },
                });
                unlockKey = token;
                amount = row.amount;
                currency = row.currency;
            } catch (dbError) {
                console.error('PremiumOrder mark-paid failed (pending migration?):', dbError?.message || dbError);
            }

            // Revenue event for /api/stats (isolated — never breaks verify).
            try {
                const rupees = currency === 'INR' ? Math.round((amount || 0) / 100) : null;
                await prisma.supportEvent.create({
                    data: { event: 'premium_paid', amount: rupees, path: `/premium (order ${String(orderId).slice(0, 24)})` },
                });
            } catch {}

            return NextResponse.json({
                success: true,
                testMode: false,
                // unlockKey present ⟺ receipt persisted. Absent ⟺ session-only
                // unlock; the client must say so honestly (see receiptKept).
                ...(unlockKey ? { unlockKey } : { receiptKept: false }),
            });
        }

        if (provider === 'key') {
            // Magic-link / remembered-device check. Key format is enforced
            // (unlock_ + 48 hex chars) before touching the DB.
            const key = String(body?.key || '');
            if (!/^unlock_[0-9a-f]{48}$/.test(key)) {
                return NextResponse.json({ success: false, error: 'This link doesn’t look right.' }, { status: 200 });
            }
            try {
                const row = await prisma.premiumOrder.findUnique({ where: { unlockToken: key }, select: { status: true } });
                // Tokens are minted only on successful payment, so a matching
                // row means paid. Status check keeps future states (refunded…)
                // honest without a second migration.
                if (row && row.status === 'paid') {
                    return NextResponse.json({ success: true, testMode: false });
                }
            } catch (dbError) {
                console.error('Premium key check failed (pending migration?):', dbError?.message || dbError);
            }
            return NextResponse.json({ success: false, error: 'This link is no longer valid.' }, { status: 200 });
        }

        if (provider === 'test') {
            const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
            if (secret && process.env.NODE_ENV === 'production') {
                return bad('Test mode is disabled.', 403);
            }
            return NextResponse.json({ success: true, testMode: true });
        }

        return bad('Unknown provider.');
    } catch (error) {
        console.error('Premium verify error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Verification unavailable.' }, { status: 200 });
    }
}
