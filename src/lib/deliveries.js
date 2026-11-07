/**
 * Scheduled card delivery.
 *
 * Delivery is date-based because the Vercel Hobby plan only allows one cron
 * run per day (with per-hour timing precision). Every card chosen for a
 * calendar day goes out in that day's single sweep (03:00 UTC / 08:30–09:30
 * IST).
 *
 * Two honest paths, because no WhatsApp Business provider is configured:
 *   1. We have the recipient's email → send the card automatically.
 *   2. We only have the creator's email → email the creator a ready-to-send
 *      WhatsApp link. They tap once; the recipient gets a normal WhatsApp
 *      message from a human they know.
 *
 * A due row is claimed by flipping `scheduled` → `sending`, so overlapping
 * cron runs cannot double-send. Transient failures get one immediate retry;
 * a row that still fails is retried by the next daily sweep once, then marked
 * failed so a late birthday card does not keep retrying for days.
 */

import prisma from '@/lib/prisma';
import { sendEmail, siteUrl, supportUrl, isEmailConfigured } from '@/lib/email';
import { renderDeliveryEmail, renderDeliveryAssistEmail } from '@/lib/emailTemplates';
import { formatDeliveryDate } from '@/lib/deliverySchedule';

/** A daily batch can be larger than the old high-frequency batches. */
export const MAX_DELIVERIES_PER_RUN = 60;
const MAX_ATTEMPTS = 2;
const SEND_GAP_MS = 550;
const RETRY_DELAY_MS = 1200;
/** Stop cleanly before the 60s function limit; the rest waits for tomorrow. */
const MAX_RUN_MS = 50_000;
/** A row stuck in `sending` after a killed function is safe to retry. */
const STALE_SENDING_MS = 10 * 60 * 1000;
const RETRYABLE_REASONS = new Set(['send_failed', 'provider_error']);
const PERMANENT_REASONS = new Set([
    'missing_page',
    'no_delivery_email',
    'invalid_recipient',
    'email_not_configured',
    'sender_not_configured',
]);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function cardUrlFor(pageId) {
    return `${siteUrl()}/b/${pageId}`;
}

export function whatsappShareUrl(page) {
    const url = cardUrlFor(page.id);
    const text = `Hey ${page.recipientName || 'there'}! 🎂 I made something special for your birthday. Open this on your phone: ${url} ✨`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

function scheduledLabel(delivery) {
    // The sweep is always in IST, so show the delivery date in IST rather
    // than the creator's timezone (which could display the previous day).
    return formatDeliveryDate(delivery.scheduledAt);
}

export async function findDueDeliveries(now = new Date()) {
    return prisma.cardDelivery.findMany({
        where: {
            status: 'scheduled',
            scheduledAt: { lte: now },
        },
        include: {
            page: {
                select: {
                    id: true,
                    recipientName: true,
                    senderName: true,
                },
            },
        },
        orderBy: { scheduledAt: 'asc' },
        take: MAX_DELIVERIES_PER_RUN * 2,
    });
}

/**
 * If Vercel kills the function mid-send, the claimed row stays in `sending`
 * forever. Release old claims so the card is retried by the next sweep. This
 * can rarely duplicate an email that was accepted just before the kill, which
 * is better than never delivering a birthday card.
 */
async function releaseStaleDeliveries(now) {
    try {
        await prisma.cardDelivery.updateMany({
            where: {
                status: 'sending',
                updatedAt: { lt: new Date(now.getTime() - STALE_SENDING_MS) },
            },
            data: {
                status: 'scheduled',
                error: 'released_after_interrupted_run',
            },
        });
    } catch (err) {
        console.error('[Delivery] stale claim release failed:', err?.message || err);
    }
}

async function sendOne(delivery) {
    const page = delivery.page;
    if (!page?.id) return { sent: false, reason: 'missing_page' };

    const cardUrl = cardUrlFor(page.id);
    const recipientEmail = String(delivery.recipientEmail || '').trim();
    const creatorEmail = String(delivery.creatorEmail || '').trim();

    if (recipientEmail) {
        const { subject, html, text } = renderDeliveryEmail({
            recipientName: page.recipientName,
            senderName: page.senderName,
            cardUrl,
            supportUrl: supportUrl(),
        });
        const result = await sendEmail({
            to: recipientEmail,
            subject,
            html,
            text,
            kind: 'delivery',
            reference: delivery.id,
        });
        return result.ok ? { sent: true, channel: 'email' } : { sent: false, reason: result.reason || 'send_failed' };
    }

    if (!creatorEmail) return { sent: false, reason: 'no_delivery_email' };

    const { subject, html, text } = renderDeliveryAssistEmail({
        recipientName: page.recipientName,
        cardUrl,
        whatsappUrl: whatsappShareUrl(page),
        scheduledLabel: scheduledLabel(delivery),
        supportUrl: supportUrl(),
    });
    const result = await sendEmail({
        to: creatorEmail,
        subject,
        html,
        text,
        kind: 'delivery_assist',
        reference: delivery.id,
    });
    return result.ok ? { sent: true, channel: 'whatsapp_assist' } : { sent: false, reason: result.reason || 'send_failed' };
}

async function sendOneWithRetry(delivery, attemptNumber) {
    let result = await sendOne(delivery);
    if (result.sent) return result;

    // The next cron run is a whole day away. Give transient provider failures
    // one immediate retry instead of delivering a birthday card late.
    if (attemptNumber < MAX_ATTEMPTS && RETRYABLE_REASONS.has(result.reason)) {
        await sleep(RETRY_DELAY_MS);
        result = await sendOne(delivery);
    }
    return result;
}

export async function deliverOne(delivery) {
    const claim = await prisma.cardDelivery.updateMany({
        where: { id: delivery.id, status: 'scheduled' },
        data: { status: 'sending', attempts: { increment: 1 } },
    });
    if (claim.count === 0) return { sent: false, reason: 'claimed_elsewhere' };

    const attemptNumber = (delivery.attempts || 0) + 1;

    try {
        const result = await sendOneWithRetry(delivery, attemptNumber);
        if (result.sent) {
            await prisma.cardDelivery.update({
                where: { id: delivery.id },
                data: {
                    status: 'sent',
                    sentAt: new Date(),
                    error: null,
                    channel: result.channel || delivery.channel,
                },
            });
            return result;
        }

        const permanent = PERMANENT_REASONS.has(result.reason);
        await prisma.cardDelivery.update({
            where: { id: delivery.id },
            data: {
                status: permanent || attemptNumber >= MAX_ATTEMPTS ? 'failed' : 'scheduled',
                error: String(result.reason || 'send_failed').slice(0, 300),
            },
        });
        return result;
    } catch (err) {
        await prisma.cardDelivery.update({
            where: { id: delivery.id },
            data: {
                status: attemptNumber >= MAX_ATTEMPTS ? 'failed' : 'scheduled',
                error: String(err?.message || 'unexpected_error').slice(0, 300),
            },
        }).catch(() => { });
        return { sent: false, reason: 'unexpected_error' };
    }
}

export async function runDeliveries({ now = new Date(), dryRun = false, max = MAX_DELIVERIES_PER_RUN } = {}) {
    const startedAt = Date.now();
    if (!dryRun) await releaseStaleDeliveries(now);
    const due = await findDueDeliveries(now);
    const batch = due.slice(0, Math.max(1, max));
    const configured = isEmailConfigured();

    if (dryRun) {
        return {
            dryRun: true,
            configured,
            due: due.length,
            planned: batch.map((delivery) => ({
                id: delivery.id,
                pageId: delivery.pageId,
                channel: delivery.recipientEmail ? 'email' : 'whatsapp_assist',
                scheduledAt: delivery.scheduledAt,
            })),
            durationMs: Date.now() - startedAt,
        };
    }

    if (!configured) {
        return {
            dryRun: false,
            configured: false,
            due: due.length,
            processed: 0,
            sent: 0,
            failed: 0,
            error: 'email_not_configured',
            durationMs: Date.now() - startedAt,
        };
    }

    let sent = 0;
    let failed = 0;
    let processed = 0;
    let stoppedEarly = false;
    const failures = [];

    for (let i = 0; i < batch.length; i++) {
        if (Date.now() - startedAt > MAX_RUN_MS) {
            stoppedEarly = true;
            break;
        }
        if (i > 0) await sleep(SEND_GAP_MS);
        try {
            const result = await deliverOne(batch[i]);
            processed += 1;
            if (result.sent) sent += 1;
            else {
                failed += 1;
                failures.push({ id: batch[i].id, reason: result.reason });
            }
        } catch (err) {
            processed += 1;
            failed += 1;
            failures.push({ id: batch[i].id, reason: 'unexpected_error' });
            console.error(`[Delivery] unexpected failure for ${batch[i].id}:`, err?.message || err);
        }
    }

    if (sent > 0) {
        try {
            await prisma.supportEvent.create({
                data: { event: 'delivery_sent', amount: sent, path: '/api/cron/delivery' },
            });
        } catch { }
    }

    return {
        dryRun: false,
        configured: true,
        due: due.length,
        processed,
        sent,
        failed,
        truncated: stoppedEarly || due.length > batch.length,
        failures: failures.slice(0, 10),
        durationMs: Date.now() - startedAt,
    };
}
