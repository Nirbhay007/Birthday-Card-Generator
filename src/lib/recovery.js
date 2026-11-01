/**
 * Abandoned-checkout recovery sweep.
 *
 * The leak this closes: 81 orders/month are created, 29 paid, 43 left created,
 * 9 failed. A buyer who got interrupted by a UPI app switch or a closed tab
 * usually never comes back on their own. One email, two hours later, with a
 * signed link back to the exact checkout, is the cheapest second chance.
 *
 * Rules:
 *   - only orders with a buyer email (phone-only orders cannot be emailed);
 *   - at least 2 hours old, at most 7 days old;
 *   - never paid, never already nudged (`recoverySentAt`);
 *   - never after the card's birthday has passed — a "your VIP card is still
 *     waiting" email the day after the party is worse than silence;
 *   - at most one nudge per buyer email per 7 days, even if they opened
 *     checkout more than once and left several unpaid orders behind;
 *   - the claim is atomic, so overlapping cron runs cannot double-send;
 *   - a failed send releases the claim and is retried by the next run.
 */

import prisma from '@/lib/prisma';
import { isBirthdayRelevant } from '@/lib/cardDates';
import { isEmailConfigured, parseBuyerEmail, sendRecoveryForOrder } from '@/lib/email';

export const MAX_RECOVERY_PER_RUN = 30;
const SEND_GAP_MS = 550;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskEmail(value) {
    const email = String(value || '');
    const at = email.indexOf('@');
    if (at < 1) return '***';
    return `${email.slice(0, 1)}***@${email.slice(at + 1)}`;
}

export async function findRecoverableOrders(now = new Date()) {
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const rows = await prisma.premiumOrder.findMany({
        where: {
            status: { in: ['created', 'failed'] },
            recoverySentAt: null,
            createdAt: { gte: sevenDaysAgo, lte: twoHoursAgo },
            buyerContact: { contains: '@' },
        },
        select: {
            orderId: true,
            tier: true,
            status: true,
            buyerContact: true,
            createdAt: true,
            pageId: true,
        },
        orderBy: { createdAt: 'asc' },
        take: MAX_RECOVERY_PER_RUN * 2,
    });

    // PremiumOrder has no Prisma relation to BirthdayPage, so resolve the
    // dates in one extra query and drop orders whose occasion is over.
    const pageIds = [...new Set(rows.map((row) => row.pageId).filter(Boolean))];
    const pages = pageIds.length
        ? await prisma.birthdayPage
            .findMany({
                where: { id: { in: pageIds } },
                select: { id: true, birthdayDate: true },
            })
            .catch(() => [])
        : [];
    const birthdayByPage = new Map(pages.map((page) => [page.id, page.birthdayDate]));

    return rows.filter((row) =>
        isBirthdayRelevant(row.pageId ? birthdayByPage.get(row.pageId) : null, now)
    );
}

/** Buyer emails that already received a nudge inside the trailing 7 days. */
async function findRecentlyNudgedEmails(now = new Date()) {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let rows = [];
    try {
        rows = await prisma.premiumOrder.findMany({
            where: { recoverySentAt: { gte: sevenDaysAgo } },
            select: { buyerContact: true },
        });
    } catch {
        return new Set();
    }
    return new Set(rows.map((row) => parseBuyerEmail(row.buyerContact)).filter(Boolean));
}

/**
 * Split the candidates into "send now" and "same buyer already nudged".
 * Dedupes inside the batch too, so two unpaid orders from one buyer in the
 * same hour cannot produce two emails.
 */
function splitByBuyer(rows, nudgedEmails) {
    const eligible = [];
    const duplicates = [];
    for (const row of rows) {
        const email = parseBuyerEmail(row.buyerContact);
        if (!email) continue;
        if (nudgedEmails.has(email)) {
            duplicates.push(row);
            continue;
        }
        nudgedEmails.add(email);
        eligible.push(row);
    }
    return { eligible, duplicates };
}

export async function runRecovery({ now = new Date(), dryRun = false, max = MAX_RECOVERY_PER_RUN } = {}) {
    const startedAt = Date.now();
    const rows = await findRecoverableOrders(now);
    const nudgedEmails = await findRecentlyNudgedEmails(now);
    const { eligible, duplicates } = splitByBuyer(rows, nudgedEmails);
    const batch = eligible.slice(0, Math.max(1, max));
    const configured = isEmailConfigured();

    if (dryRun) {
        return {
            dryRun: true,
            configured,
            due: eligible.length,
            duplicateSuppressed: duplicates.length,
            planned: batch.map((row) => ({
                orderId: row.orderId,
                tier: row.tier,
                to: maskEmail(parseBuyerEmail(row.buyerContact)),
                createdAt: row.createdAt,
            })),
            durationMs: Date.now() - startedAt,
        };
    }

    if (!configured) {
        return {
            dryRun: false,
            configured: false,
            due: eligible.length,
            duplicateSuppressed: duplicates.length,
            processed: 0,
            sent: 0,
            failed: 0,
            error: 'email_not_configured',
            durationMs: Date.now() - startedAt,
        };
    }

    // Mark same-buyer duplicates as handled without emailing them. The column
    // means "claimed by recovery", so they are never reconsidered later.
    if (duplicates.length) {
        try {
            await prisma.premiumOrder.updateMany({
                where: { orderId: { in: duplicates.map((row) => row.orderId) }, recoverySentAt: null },
                data: { recoverySentAt: new Date() },
            });
        } catch (err) {
            console.error('[Recovery] duplicate suppression failed:', err?.message || err);
        }
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const failures = [];

    for (let i = 0; i < batch.length; i++) {
        if (i > 0) await sleep(SEND_GAP_MS);
        try {
            const result = await sendRecoveryForOrder(batch[i].orderId);
            if (result.sent) {
                sent += 1;
            } else if (result.reason === 'birthday_passed') {
                skipped += 1;
            } else {
                failed += 1;
                failures.push({ orderId: batch[i].orderId, reason: result.reason });
            }
        } catch (err) {
            failed += 1;
            failures.push({ orderId: batch[i].orderId, reason: 'unexpected_error' });
            console.error(`[Recovery] unexpected failure for ${batch[i].orderId}:`, err?.message || err);
        }
    }

    // Server-side funnel event; isolated so analytics can never break recovery.
    if (sent > 0) {
        try {
            await prisma.supportEvent.create({
                data: { event: 'recovery_email_sent', amount: sent, path: '/api/cron/recovery' },
            });
        } catch { }
    }

    return {
        dryRun: false,
        configured: true,
        due: eligible.length,
        duplicateSuppressed: duplicates.length,
        processed: batch.length,
        sent,
        skipped,
        failed,
        truncated: eligible.length > batch.length,
        failures: failures.slice(0, 10),
        durationMs: Date.now() - startedAt,
    };
}
