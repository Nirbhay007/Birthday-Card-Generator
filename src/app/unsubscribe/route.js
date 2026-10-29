import prisma from '@/lib/prisma';
import { escapeHtml } from '@/lib/emailTemplates';
import { siteUrl, verifyUnsubscribeToken } from '@/lib/email';

/**
 * /unsubscribe?token=…
 *
 * Signed link included in every birthday reminder. Sets `reminderOptOutAt`
 * but deliberately leaves `reminderEmail` in place: it is the suppression
 * record, and the cleanup cron uses a non-null email to keep the page's
 * photos alive. Unsubscribing stops email; it does not delete their card.
 *
 * GET only shows a confirmation page. Mutating on GET would let mailbox link
 * scanners and chat previews opt people out without a click.
 *
 * POST supports both the confirmation form and RFC 8058 one-click
 * unsubscribe from the mailbox provider.
 */

export const dynamic = 'force-dynamic';

function htmlPage({ title, heading, body, status = 200 }) {
    const home = `${siteUrl()}/`;
    return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>${escapeHtml(title)} · BirthdayGen</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f3fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b0f2e;padding:24px;">
  <main style="width:100%;max-width:460px;background:#ffffff;border:1px solid #ece5f5;border-radius:20px;padding:32px 28px;box-shadow:0 12px 40px rgba(27,15,46,0.08);">
    <p style="margin:0 0 18px;font-size:15px;font-weight:800;letter-spacing:-0.2px;">BirthdayGen 🎂</p>
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;letter-spacing:-0.4px;">${escapeHtml(heading)}</h1>
    <div style="margin:0;color:#6b6478;font-size:14px;line-height:1.7;">${body}</div>
    <p style="margin:26px 0 0;"><a href="${escapeHtml(home)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Back to BirthdayGen</a></p>
  </main>
</body>
</html>`,
        {
            status,
            headers: {
                'content-type': 'text/html; charset=utf-8',
                'cache-control': 'no-store, max-age=0',
                'referrer-policy': 'no-referrer',
                'x-robots-tag': 'noindex',
            },
        }
    );
}

/** Read the page behind a token without changing anything. */
async function lookup(token) {
    const verified = verifyUnsubscribeToken(token);
    if (!verified) return { ok: false, reason: 'invalid_token' };

    try {
        const page = await prisma.birthdayPage.findUnique({
            where: { id: verified.pageId },
            select: { recipientName: true, reminderOptOutAt: true },
        });
        if (!page) return { ok: false, reason: 'not_found' };
        return {
            ok: true,
            pageId: verified.pageId,
            recipientName: page.recipientName || '',
            alreadyOptedOut: Boolean(page.reminderOptOutAt),
        };
    } catch (err) {
        console.error('[Unsubscribe] lookup failed:', err?.message || err);
        return { ok: false, reason: 'db_error' };
    }
}

/** Record the opt-out. Idempotent: a second click just updates the timestamp. */
async function setOptOut(token) {
    const verified = verifyUnsubscribeToken(token);
    if (!verified) return { ok: false, reason: 'invalid_token' };

    try {
        const page = await prisma.birthdayPage.update({
            where: { id: verified.pageId },
            data: { reminderOptOutAt: new Date() },
            select: { recipientName: true },
        });
        return { ok: true, recipientName: page.recipientName || '' };
    } catch (err) {
        if (err?.code === 'P2025') return { ok: false, reason: 'not_found' };
        console.error('[Unsubscribe] update failed:', err?.message || err);
        return { ok: false, reason: 'db_error' };
    }
}

function errorPage(reason) {
    if (reason === 'not_found') {
        return htmlPage({
            title: 'Card not found',
            heading: 'This card no longer exists',
            body: '<p style="margin:0;">The reminder link points to a card that has been removed. There is nothing left to unsubscribe from.</p>',
            status: 404,
        });
    }

    if (reason === 'db_error') {
        return htmlPage({
            title: 'Something went wrong',
            heading: 'We could not update your preference',
            body: '<p style="margin:0;">Please try the link again in a minute. If it keeps failing, reply to the reminder email and we will remove you manually.</p>',
            status: 500,
        });
    }

    return htmlPage({
        title: 'Link expired',
        heading: 'This unsubscribe link is not valid',
        body: '<p style="margin:0;">It may have expired or been copied incompletely. Open the latest reminder email and use the unsubscribe link at the bottom, or simply reply to that email.</p>',
        status: 400,
    });
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    const result = await lookup(token);

    if (!result.ok) return errorPage(result.reason);

    const name = result.recipientName ? `${escapeHtml(result.recipientName)}'s` : 'this';

    if (result.alreadyOptedOut) {
        return htmlPage({
            title: 'Reminders off',
            heading: 'Reminders are already off',
            body: `<p style="margin:0 0 12px;">No birthday reminder emails are being sent for <strong style="color:#1b0f2e;">${name}</strong> card.</p>
                   <p style="margin:0;">The card and its photos are still saved. Nothing has been deleted.</p>`,
        });
    }

    return htmlPage({
        title: 'Turn off reminders',
        heading: 'Turn off birthday reminders?',
        body: `<p style="margin:0 0 12px;">No more reminder emails for <strong style="color:#1b0f2e;">${name}</strong> card.</p>
               <p style="margin:0 0 18px;">The card and its photos stay saved — nothing gets deleted.</p>
               <form method="POST" action="/unsubscribe?token=${encodeURIComponent(token)}" style="margin:0;">
                 <input type="hidden" name="token" value="${escapeHtml(token)}">
                 <button type="submit" style="display:inline-block;padding:12px 20px;border:0;border-radius:999px;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;">Yes, turn off reminders</button>
               </form>`,
    });
}

export async function POST(request) {
    const { searchParams } = new URL(request.url);

    // RFC 8058 sends only "List-Unsubscribe=One-Click". The confirmation form
    // posts the token in the body; the query value is the fallback.
    let form = null;
    try {
        form = await request.formData();
    } catch { }

    const token = searchParams.get('token') || String(form?.get('token') || '');
    const oneClick = String(form?.get('List-Unsubscribe') || '') === 'One-Click';

    const result = await setOptOut(token);
    if (!result.ok) {
        return new Response('Invalid unsubscribe link', {
            status: result.reason === 'not_found' ? 404 : 400,
            headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
        });
    }

    if (oneClick) {
        return new Response('Unsubscribed', {
            status: 200,
            headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
        });
    }

    const name = result.recipientName ? `${escapeHtml(result.recipientName)}'s` : 'this';
    return htmlPage({
        title: 'Reminders off',
        heading: 'You are unsubscribed',
        body: `<p style="margin:0 0 12px;">No more birthday reminder emails for <strong style="color:#1b0f2e;">${name}</strong> card.</p>
               <p style="margin:0;">The card and its photos stay saved — nothing has been deleted. You can opt in again whenever you create a new card.</p>`,
    });
}
