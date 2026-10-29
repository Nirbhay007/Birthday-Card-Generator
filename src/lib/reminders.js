/**
 * Annual birthday reminders — the email the creator is promised when they
 * tick "remind me" while making a card.
 *
 * Rules:
 *   - one email per birthday year (`reminderSentFor`), never per cron run;
 *   - sent inside the 7-day window before the next birthday;
 *   - skipped for opt-outs, missing dates and cards made days before the
 *     birthday (no instant "it's tomorrow!" surprise);
 *   - the claim is atomic, so overlapping cron invocations cannot double-send;
 *   - a failed send releases the claim and is retried by the next run.
 */

import prisma from '@/lib/prisma';
import { sendEmail, siteUrl, supportUrl, buildUnsubscribeUrl, isEmailConfigured } from '@/lib/email';
import { renderReminderEmail } from '@/lib/emailTemplates';
import { getReminderState } from '@/lib/reminderSchedule';

/** Keep a run comfortably inside the 60s cron budget / Resend rate limit. */
export const MAX_SENDS_PER_RUN = 50;

/** Resend's default limit is 2 requests/second; sequential sends can outrun
 *  it, so leave a small gap between emails. 50 sends still fit in ~30s. */
const SEND_GAP_MS = 550;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function fullPageUrl(pageId) {
    return `${siteUrl()}/b/${pageId}`;
}

function maskEmail(value) {
    const email = String(value || '');
    const at = email.indexOf('@');
    if (at < 1) return '***';
    const name = email.slice(0, at);
    const domain = email.slice(at + 1);
    return `${name.slice(0, 1)}***@${domain}`;
}

/**
 * All pages that should receive a reminder at `now`. Small table, one scan;
 * date math is done in JS because stored birth years vary per card.
 */
export async function findDueReminders(now = new Date()) {
    const rows = await prisma.birthdayPage.findMany({
        where: {
            reminderEmail: { not: null },
            reminderOptOutAt: null,
        },
        select: {
            id: true,
            recipientName: true,
            senderName: true,
            birthdayDate: true,
            reminderEmail: true,
            reminderSentFor: true,
            reminderOptOutAt: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
    });

    const due = [];
    const skipped = {};
    for (const row of rows) {
        const state = getReminderState(row, now);
        if (state.due) {
            due.push({ ...row, ...state });
        } else {
            skipped[state.reason] = (skipped[state.reason] || 0) + 1;
        }
    }
    return { due, skipped };
}

/**
 * Send one reminder. Returns { sent: true } or { sent: false, reason }.
 * The caller already filtered for due pages; the atomic claim below is the
 * final guard against a page being unsubscribed or sent between the scan and
 * this call.
 */
export async function sendReminder(page, now = new Date()) {
    if (!page?.id || !page?.birthdayYear) return { sent: false, reason: 'invalid_page' };

    const previousYear = Number.isInteger(page.reminderSentFor) ? page.reminderSentFor : null;

    let claim = null;
    try {
        claim = await prisma.birthdayPage.updateMany({
            where: {
                id: page.id,
                reminderEmail: { not: null },
                reminderOptOutAt: null,
                OR: [
                    { reminderSentFor: null },
                    { reminderSentFor: { not: page.birthdayYear } },
                ],
            },
            data: { reminderSentFor: page.birthdayYear },
        });
    } catch (err) {
        console.error(`[Reminders] claim failed for ${page.id}:`, err?.message || err);
        return { sent: false, reason: 'db_error' };
    }

    if (!claim || claim.count === 0) return { sent: false, reason: 'claimed_elsewhere' };

    const unsubscribeUrl = buildUnsubscribeUrl(page.id);
    const { subject, html, text } = renderReminderEmail({
        recipientName: page.recipientName,
        senderName: page.senderName,
        // Use the computed occurrence, not the stored date: the stored year is
        // whenever the card was made, while this email is about the upcoming
        // birthday (which may be next year).
        birthdayDate: page.occurrence || page.birthdayDate,
        daysUntil: page.daysUntil,
        cardUrl: fullPageUrl(page.id),
        createUrl: `${siteUrl()}/#create`,
        unsubscribeUrl,
        supportUrl: supportUrl(),
    });

    const headers = {};
    if (unsubscribeUrl) {
        headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
        // RFC 8058 one-click: the mailbox provider POSTs to the same URL.
        headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }

    const result = await sendEmail({
        to: page.reminderEmail.trim(),
        subject,
        html,
        text,
        headers,
        kind: 'reminder',
        reference: page.id,
    });

    if (!result.ok) {
        // Put the previous marker back (usually null) so tomorrow's run can
        // retry. Guarded by the claimed year so a concurrent run is untouched.
        try {
            await prisma.birthdayPage.updateMany({
                where: { id: page.id, reminderSentFor: page.birthdayYear },
                data: { reminderSentFor: previousYear },
            });
        } catch (err) {
            console.error(`[Reminders] release failed for ${page.id}:`, err?.message || err);
        }
        return { sent: false, reason: result.reason || 'send_failed' };
    }

    return { sent: true, id: result.id };
}

/**
 * Cron entry point. `dryRun` never claims or sends; it only reports what
 * would happen, including masked recipients for a local sanity check.
 */
export async function runReminders({ now = new Date(), dryRun = false, max = MAX_SENDS_PER_RUN } = {}) {
    const startedAt = Date.now();
    const { due, skipped } = await findDueReminders(now);
    const batch = due.slice(0, Math.max(1, max));
    const configured = isEmailConfigured();

    if (dryRun) {
        return {
            dryRun: true,
            configured,
            due: due.length,
            planned: batch.map((page) => ({
                pageId: page.id,
                to: maskEmail(page.reminderEmail),
                birthdayYear: page.birthdayYear,
                daysUntil: page.daysUntil,
            })),
            skipped,
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
            skipped,
            truncated: false,
            error: 'email_not_configured',
            durationMs: Date.now() - startedAt,
        };
    }

    let sent = 0;
    let failed = 0;
    const failures = [];

    for (let i = 0; i < batch.length; i++) {
        const page = batch[i];
        if (i > 0) await sleep(SEND_GAP_MS);
        try {
            const result = await sendReminder(page, now);
            if (result.sent) {
                sent += 1;
            } else {
                failed += 1;
                failures.push({ pageId: page.id, reason: result.reason });
            }
        } catch (err) {
            failed += 1;
            failures.push({ pageId: page.id, reason: 'unexpected_error' });
            console.error(`[Reminders] unexpected failure for ${page.id}:`, err?.message || err);
        }
    }

    return {
        dryRun: false,
        configured: true,
        due: due.length,
        processed: batch.length,
        sent,
        failed,
        skipped,
        truncated: due.length > batch.length,
        failures: failures.slice(0, 10),
        durationMs: Date.now() - startedAt,
    };
}
