/**
 * Transactional email delivery.
 *
 * Uses the same Resend account as the admin alerts (`RESEND_API_KEY`), but a
 * separate sender so buyer mail never looks like an internal alert:
 *
 *   EMAIL_FROM         Verified sender, e.g. "BirthdayGen <hello@yourdomain.com>".
 *                      Falls back to ALERT_FROM_EMAIL.
 *   EMAIL_REPLY_TO     Optional Reply-To. Replies to reminders land here.
 *   EMAIL_TOKEN_SECRET HMAC key for unsubscribe links. Falls back to
 *                      CRON_SECRET, then RAZORPAY_KEY_SECRET, so an existing
 *                      deployment gets working links without extra setup.
 *   NEXT_PUBLIC_SITE_URL  Absolute links in emails. Falls back to the
 *                      production host.
 *
 * Nothing here throws on a delivery failure: callers are payment/cron paths
 * and must keep working even when Resend is down or unconfigured.
 */

import crypto from 'crypto';
import { Resend } from 'resend';
import prisma from '@/lib/prisma';
import { renderReceiptEmail } from '@/lib/emailTemplates';
import { isValidEmail } from '@/lib/utils';

const DEFAULT_SITE_URL = 'https://birthday.nirbhay.online';
const UNSUBSCRIBE_TOKEN_TTL_MS = 400 * 24 * 60 * 60 * 1000; // 400 days

export function siteUrl() {
    return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim().replace(/\/+$/, '') || DEFAULT_SITE_URL;
}

export function supportUrl() {
    const digits = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '').replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
}

function senderFrom() {
    return (process.env.EMAIL_FROM || process.env.ALERT_FROM_EMAIL || '').trim();
}

/** True when both a provider key and a sender are present. */
export function isEmailConfigured() {
    return Boolean((process.env.RESEND_API_KEY || '').trim() && senderFrom());
}

function tokenSecrets() {
    return [
        process.env.EMAIL_TOKEN_SECRET,
        process.env.CRON_SECRET,
        process.env.RAZORPAY_KEY_SECRET,
    ]
        .map((value) => (value || '').trim())
        .filter(Boolean);
}

function tokenSecret() {
    return tokenSecrets()[0] || '';
}

function safeEqual(a, b) {
    const left = Buffer.from(String(a || ''), 'utf8');
    const right = Buffer.from(String(b || ''), 'utf8');
    if (left.length === 0 || left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
}

/** One printable line — subjects must never be able to inject headers. */
function cleanSubject(value) {
    return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
}

/** Extract the first usable email from a stored "email / phone" summary. */
export function parseBuyerEmail(value) {
    if (typeof value !== 'string') return '';
    const parts = value.split(/[\s,;/|]+/);
    for (const raw of parts) {
        const candidate = raw.replace(/^mailto:/i, '').trim();
        if (!candidate || candidate.toLowerCase() === 'void@razorpay.com') continue;
        if (isValidEmail(candidate)) return candidate.toLowerCase();
    }
    return '';
}

/**
 * Keep the better contact when the Razorpay webhook reports one.
 * A user-supplied email on our checkout is more useful than a phone number
 * Razorpay happened to collect, so never overwrite a real email with a phone.
 */
export function mergeBuyerContacts(existing, incoming) {
    if (parseBuyerEmail(existing)) return existing;
    const next = typeof incoming === 'string' ? incoming.trim().slice(0, 200) : '';
    if (next) return next;
    return typeof existing === 'string' && existing.trim() ? existing : null;
}

/**
 * Send one email. Returns { ok: true, id } or { ok: false, reason, error }.
 * `kind` and `reference` are logged instead of the recipient address.
 */
export async function sendEmail({ to, subject, html, text, headers, replyTo, kind = 'email', reference = '' }) {
    const recipient = typeof to === 'string' ? to.trim() : '';
    if (!isValidEmail(recipient)) {
        return { ok: false, reason: 'invalid_recipient' };
    }

    const apiKey = (process.env.RESEND_API_KEY || '').trim();
    if (!apiKey) {
        console.warn(`[Email] ${kind} skipped: RESEND_API_KEY is not set.`);
        return { ok: false, reason: 'email_not_configured' };
    }

    const from = senderFrom();
    if (!from) {
        console.warn(`[Email] ${kind} skipped: EMAIL_FROM / ALERT_FROM_EMAIL is not set.`);
        return { ok: false, reason: 'sender_not_configured' };
    }

    const reply = (replyTo || process.env.EMAIL_REPLY_TO || '').trim();

    try {
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from,
            to: [recipient],
            subject: cleanSubject(subject),
            html,
            ...(text ? { text } : {}),
            ...(reply && isValidEmail(reply) ? { replyTo: reply } : {}),
            ...(headers && Object.keys(headers).length ? { headers } : {}),
        });

        if (error) {
            console.error(`[Email] ${kind} rejected by Resend (${reference || 'no ref'}):`, error?.message || error);
            return { ok: false, reason: 'provider_error', error: error?.message || String(error) };
        }

        console.log(`[Email] ${kind} sent (${reference || 'no ref'}, id: ${data?.id || 'unknown'})`);
        return { ok: true, id: data?.id };
    } catch (err) {
        console.error(`[Email] ${kind} failed (${reference || 'no ref'}):`, err?.message || err);
        return { ok: false, reason: 'send_failed', error: err?.message || String(err) };
    }
}

/** Signed, expiring unsubscribe token. No database row needed. */
export function createUnsubscribeToken(pageId, { expiresAt = Date.now() + UNSUBSCRIBE_TOKEN_TTL_MS } = {}) {
    const secret = tokenSecret();
    if (!secret || typeof pageId !== 'string' || !pageId) return '';
    const payload = Buffer.from(
        JSON.stringify({ v: 1, p: pageId, e: Math.floor(expiresAt / 1000) }),
        'utf8'
    ).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${signature}`;
}

/** Verify an unsubscribe token. Returns { pageId } or null. */
export function verifyUnsubscribeToken(token) {
    const secrets = tokenSecrets();
    if (!secrets.length || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;

    // Try every configured secret so links survive adding EMAIL_TOKEN_SECRET
    // later (the signing key moves to the front of the list, old links stay
    // valid under the previous key).
    const matches = secrets.some((secret) => {
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
        return safeEqual(expected, signature);
    });
    if (!matches) return null;

    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (data?.v !== 1 || typeof data?.p !== 'string' || !data.p) return null;
        if (typeof data?.e !== 'number' || data.e * 1000 < Date.now()) return null;
        return { pageId: data.p };
    } catch {
        return null;
    }
}

export function buildUnsubscribeUrl(pageId) {
    const token = createUnsubscribeToken(pageId);
    return token ? `${siteUrl()}/unsubscribe?token=${encodeURIComponent(token)}` : '';
}

/** Remembered magic link for a Premium order, restricted to our own host. */
function magicLinkForOrder(order) {
    // Without a token the link cannot unlock anything — never email a bare
    // snapshot URL and call it a magic link.
    if (!order?.unlockToken) return '';

    const snapshot = typeof order?.snapshotUrl === 'string' ? order.snapshotUrl.trim() : '';
    if (snapshot) {
        try {
            const url = new URL(snapshot);
            const own = new URL(siteUrl());
            if (url.origin === own.origin && /^https?:$/.test(url.protocol)) {
                // Snapshot keeps the recipient/sender params; set() replaces
                // any stale key with the canonical token for this order.
                url.searchParams.set('key', order.unlockToken);
                return url.toString();
            }
        } catch { }
    }
    return `${siteUrl()}/premium?key=${encodeURIComponent(order.unlockToken)}`;
}

/**
 * Send the one-time payment confirmation for an order.
 *
 * Idempotent and race-safe: the order row is claimed with
 * `receiptSentAt = now` before Resend is called. Whichever of /verify, the
 * webhook, or the status poller gets there first wins; a failed send releases
 * the claim so a later trigger can retry. At most one email per order, ever.
 */
export async function sendReceiptForOrder(orderId) {
    if (typeof orderId !== 'string' || !orderId) {
        return { sent: false, reason: 'missing_order' };
    }

    let order = null;
    try {
        order = await prisma.premiumOrder.findUnique({
            where: { orderId },
            select: {
                orderId: true,
                paymentId: true,
                status: true,
                amount: true,
                currency: true,
                paidAt: true,
                pageId: true,
                tier: true,
                unlockToken: true,
                snapshotUrl: true,
                buyerContact: true,
                receiptSentAt: true,
            },
        });
    } catch (err) {
        console.error(`[Email] receipt lookup failed for ${orderId}:`, err?.message || err);
        return { sent: false, reason: 'db_error' };
    }

    if (!order) return { sent: false, reason: 'order_not_found' };
    if (order.status !== 'paid') return { sent: false, reason: 'not_paid' };
    if (order.receiptSentAt) return { sent: false, reason: 'already_sent' };

    const email = parseBuyerEmail(order.buyerContact);
    if (!email) return { sent: false, reason: 'no_email' };

    const claimAt = new Date();
    try {
        const claim = await prisma.premiumOrder.updateMany({
            where: { orderId, status: 'paid', receiptSentAt: null },
            data: { receiptSentAt: claimAt },
        });
        if (claim.count === 0) return { sent: false, reason: 'claimed_elsewhere' };
    } catch (err) {
        console.error(`[Email] receipt claim failed for ${orderId}:`, err?.message || err);
        return { sent: false, reason: 'db_error' };
    }

    let recipientName = '';
    if (order.pageId) {
        try {
            const page = await prisma.birthdayPage.findUnique({
                where: { id: order.pageId },
                select: { recipientName: true },
            });
            recipientName = page?.recipientName || '';
        } catch { }
    }
    if (!recipientName && order.snapshotUrl) {
        try {
            recipientName = new URL(order.snapshotUrl).searchParams.get('to') || '';
        } catch { }
    }

    const isCard = order.tier === 'card_vip';
    const { subject, html, text } = renderReceiptEmail({
        tier: order.tier,
        recipientName,
        amount: order.amount,
        currency: order.currency,
        orderId: order.orderId,
        paymentId: order.paymentId || '',
        paidAt: order.paidAt,
        cardUrl: order.pageId ? `${siteUrl()}/b/${order.pageId}` : '',
        magicLink: isCard ? '' : magicLinkForOrder(order),
        supportUrl: supportUrl(),
    });

    let result = await sendEmail({
        to: email,
        subject,
        html,
        text,
        kind: 'receipt',
        reference: orderId,
    });

    // One short retry for transient provider/network failures. Configuration
    // and bad-address errors are permanent, so do not waste a second attempt.
    if (!result.ok && (result.reason === 'send_failed' || result.reason === 'provider_error')) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        result = await sendEmail({
            to: email,
            subject,
            html,
            text,
            kind: 'receipt',
            reference: orderId,
        });
    }

    if (!result.ok) {
        // Release only the claim we made (compare by exact timestamp) so a
        // concurrent successful sender is never marked unsent.
        try {
            await prisma.premiumOrder.updateMany({
                where: { orderId, receiptSentAt: claimAt },
                data: { receiptSentAt: null },
            });
        } catch (err) {
            console.error(`[Email] receipt release failed for ${orderId}:`, err?.message || err);
        }
        return { sent: false, reason: result.reason || 'send_failed' };
    }

    return { sent: true, id: result.id };
}
