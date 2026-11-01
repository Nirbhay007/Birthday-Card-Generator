/**
 * Scheduled card delivery.
 *
 * Two honest paths, because no WhatsApp Business provider is configured:
 *   1. We have the recipient's email → send the card automatically at the
 *      chosen time.
 *   2. We only have the creator's email → email the creator a ready-to-send
 *      WhatsApp link at the chosen time. They tap once; the recipient gets a
 *      normal WhatsApp message from a human they know.
 *
 * A due row is claimed by flipping `scheduled` → `sending`, so overlapping
 * cron runs cannot double-send. Failures release the row for up to 3 tries.
 */

import prisma from '@/lib/prisma';
import { sendEmail, siteUrl, supportUrl, isEmailConfigured } from '@/lib/email';
import { renderDeliveryEmail, renderDeliveryAssistEmail } from '@/lib/emailTemplates';

export const MAX_DELIVERIES_PER_RUN = 25;
const MAX_ATTEMPTS = 3;
const SEND_GAP_MS = 550;

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
    try {
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: delivery.timezone || 'Asia/Kolkata',
        }).format(new Date(delivery.scheduledAt));
    } catch {
        return '';
    }
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

export async function deliverOne(delivery) {
    const claim = await prisma.cardDelivery.updateMany({
        where: { id: delivery.id, status: 'scheduled' },
        data: { status: 'sending', attempts: { increment: 1 } },
    });
    if (claim.count === 0) return { sent: false, reason: 'claimed_elsewhere' };

    try {
        const result = await sendOne(delivery);
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

        const nextAttempts = (delivery.attempts || 0) + 1;
        await prisma.cardDelivery.update({
            where: { id: delivery.id },
            data: {
                status: nextAttempts >= MAX_ATTEMPTS ? 'failed' : 'scheduled',
                error: String(result.reason || 'send_failed').slice(0, 300),
            },
        });
        return result;
    } catch (err) {
        const nextAttempts = (delivery.attempts || 0) + 1;
        await prisma.cardDelivery.update({
            where: { id: delivery.id },
            data: {
                status: nextAttempts >= MAX_ATTEMPTS ? 'failed' : 'scheduled',
                error: String(err?.message || 'unexpected_error').slice(0, 300),
            },
        }).catch(() => { });
        return { sent: false, reason: 'unexpected_error' };
    }
}

export async function runDeliveries({ now = new Date(), dryRun = false, max = MAX_DELIVERIES_PER_RUN } = {}) {
    const startedAt = Date.now();
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
    const failures = [];

    for (let i = 0; i < batch.length; i++) {
        if (i > 0) await sleep(SEND_GAP_MS);
        try {
            const result = await deliverOne(batch[i]);
            if (result.sent) sent += 1;
            else {
                failed += 1;
                failures.push({ id: batch[i].id, reason: result.reason });
            }
        } catch (err) {
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
        processed: batch.length,
        sent,
        failed,
        truncated: due.length > batch.length,
        failures: failures.slice(0, 10),
        durationMs: Date.now() - startedAt,
    };
}
