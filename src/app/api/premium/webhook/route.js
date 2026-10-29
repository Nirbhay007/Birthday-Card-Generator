import { NextResponse, after } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { mergeBuyerContacts, sendReceiptForOrder } from '@/lib/email';

/**
 * POST /api/premium/webhook — Razorpay event webhook (reconciliation).
 *
 * Why this exists: if a payer completes UPI payment but closes the browser
 * before our verify call returns, the order would stay 'created' forever.
 * Razorpay retries this webhook until we acknowledge, closing that gap.
 *
 * Setup: Razorpay Dashboard → Settings → Webhooks → Add endpoint
 *   URL: https://birthday.nirbhay.online/api/premium/webhook
 *   Events: payment.captured, payment.failed
 *   Secret: any random string → set as RAZORPAY_WEBHOOK_SECRET.
 * Without the secret this endpoint acknowledges without acting (200).
 */

/** Flatten to one printable line (control characters removed). */
function oneLine(value, max) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max);
}

export async function POST(request) {
    const secret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
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
                    .findUnique({ where: { orderId }, select: { unlockToken: true, status: true, pageId: true, tier: true, buyerContact: true } })
                    .catch(() => null);
                const unlockToken = existing?.unlockToken || `unlock_${crypto.randomBytes(24).toString('hex')}`;
                // Razorpay often reports only a phone (or void@razorpay.com).
                // Keep the buyer-supplied email from checkout when we have one.
                const razorpayContact = [payment.contact, payment.email].filter((v) => v && v !== 'void@razorpay.com').join(' / ') || null;
                const buyerContact = mergeBuyerContacts(existing?.buyerContact, razorpayContact);
                // Razorpay notes carry the tier/page chosen at checkout. They
                // are the only recovery path when the local order row was
                // never written (e.g. the checkout-create DB write failed).
                const notePageId = typeof payment?.notes?.pageId === 'string' ? payment.notes.pageId.trim().slice(0, 60) : '';
                const noteProduct = typeof payment?.notes?.product === 'string' ? payment.notes.product : '';
                const noteTier = noteProduct === 'birthday-vip-card'
                    ? 'card_vip'
                    : noteProduct === 'birthday-premium-universe' ? 'universe' : null;
                const targetPageId = existing?.pageId || notePageId || null;
                await prisma.premiumOrder.upsert({
                    where: { orderId },
                    update: {
                        paymentId,
                        status: 'paid',
                        paidAt: new Date(),
                        unlockToken,
                        ...(buyerContact ? { buyerContact } : {}),
                        ...(targetPageId ? { pageId: targetPageId } : {}),
                        ...(noteTier && !existing?.tier ? { tier: noteTier } : {}),
                    },
                    create: {
                        orderId,
                        paymentId,
                        amount: payment.amount || 0,
                        currency: payment.currency || 'INR',
                        status: 'paid',
                        paidAt: new Date(),
                        unlockToken,
                        ...(targetPageId ? { pageId: targetPageId } : {}),
                        ...(noteTier ? { tier: noteTier } : {}),
                        ...(buyerContact ? { buyerContact } : {}),
                    },
                });

                // Receipt after the HTTP response; idempotent with /verify.
                try {
                    after(() => sendReceiptForOrder(orderId).catch((err) => {
                        console.error('Receipt send failed (webhook):', err?.message || err);
                    }));
                } catch (err) {
                    console.error('Receipt scheduling failed (webhook):', err?.message || err);
                }

                if (targetPageId) {
                    await prisma.birthdayPage.update({
                        where: { id: targetPageId },
                        data: { isVip: true, isVipPro: true },
                    }).catch((e) => console.error('Failed to mark page as VIP via webhook:', e?.message || e));
                    try { revalidatePath(`/b/${targetPageId}`); } catch {}
                }
            }
        }

        if (payload?.event === 'payment.failed') {
            const payment = payload?.payload?.payment?.entity || {};
            const orderId = payment.order_id;
            if (orderId) {
                const rawCode = oneLine(payment.error_code || payment.error?.code, 60).toUpperCase();
                const code = /^[A-Z0-9_.:-]+$/.test(rawCode) ? rawCode : 'PAYMENT_FAILED';
                const reason = oneLine(payment.error_description || payment.error?.description, 300) || null;
                const rawMethod = oneLine(payment.method, 40).toLowerCase();
                const method = /^[a-z0-9_-]+$/.test(rawMethod) ? rawMethod : null;
                try {
                    // Never downgrade a paid order, even if a late failed event
                    // arrives after capture (retries can overlap).
                    await prisma.premiumOrder.updateMany({
                        where: { orderId, status: { not: 'paid' } },
                        data: {
                            status: 'failed',
                            failureCode: code,
                            failureReason: reason,
                            failureMethod: method,
                            failedAt: new Date(),
                        },
                    });
                } catch (dbError) {
                    // Additive columns may not be deployed yet — keep the
                    // webhook acknowledging so Razorpay never retries a storm.
                    if (dbError?.code !== 'P2021' && dbError?.code !== 'P2022') throw dbError;
                    console.error('Premium failure columns missing:', dbError?.message || dbError);
                }
            }
        }
    } catch (dbError) {
        // Acknowledge anyway (avoid retry storms); the gap is logged loudly.
        console.error('Premium webhook store failed:', dbError?.message || dbError);
    }
    return NextResponse.json({ ok: true });
}
