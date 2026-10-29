/**
 * Transactional email templates for payment confirmations and birthday
 * reminders. Pure string builders: no Resend, no database, no env-dependent
 * side effects (apart from the optional support URL passed in by the caller).
 *
 * Every dynamic value is HTML-escaped. User names and links are untrusted.
 */

const BRAND = 'BirthdayGen';
const INK = '#1b0f2e';
const PURPLE = '#7c3aed';
const GOLD = '#f2c14e';
const PAPER = '#f7f3fb';
const MUTED = '#6b6478';

export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[char]));
}

/** `amount` is in the smallest currency unit (paise / cents). */
export function formatMoney(amount, currency) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return '';
    const code = String(currency || 'INR').toUpperCase();
    try {
        return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(n / 100);
    } catch {
        return `${code} ${(n / 100).toFixed(2)}`;
    }
}

export function formatDate(value, { withYear = true } = {}) {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    try {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            ...(withYear ? { year: 'numeric' } : {}),
            timeZone: 'UTC',
        }).format(date);
    } catch {
        return '';
    }
}

function button(href, label, { secondary = false } = {}) {
    const bg = secondary ? '#ffffff' : PURPLE;
    const color = secondary ? INK : '#ffffff';
    const border = secondary ? `border:1px solid #e4dced;` : 'border:1px solid transparent;';
    return `<a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:${bg};color:${color};${border}font-size:14px;font-weight:700;text-decoration:none;line-height:1.2;">${escapeHtml(label)}</a>`;
}

function layout({ preheader, body, footer }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(BRAND)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <div style="display:none;font-size:1px;color:${PAPER};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ece5f5;">
        <tr><td style="background:${INK};padding:20px 28px;">
          <span style="font-size:18px;font-weight:800;letter-spacing:-0.3px;color:#ffffff;">${BRAND}</span>
          <span style="font-size:18px;"> 🎂</span>
        </td></tr>
        <tr><td style="padding:28px;">${body}</td></tr>
        <tr><td style="padding:18px 28px 22px;background:#faf7fe;border-top:1px solid #eee7f6;color:${MUTED};font-size:12px;line-height:1.6;">${footer}</td></tr>
      </table>
      <p style="margin:14px 0 0;color:#9a93a8;font-size:11px;">Made with care by ${BRAND} · birthday.nirbhay.online</p>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Payment confirmation. Deliberately not called a tax invoice: BirthdayGen
 * does not collect GST details, so this is a plain record of the payment.
 */
export function renderReceiptEmail({
    tier = 'universe',
    recipientName = '',
    amount = 0,
    currency = 'INR',
    orderId = '',
    paymentId = '',
    paidAt = null,
    cardUrl = '',
    magicLink = '',
    supportUrl = '',
} = {}) {
    const isCard = tier === 'card_vip';
    const name = String(recipientName || '').trim();
    const money = formatMoney(amount, currency);
    const date = formatDate(paidAt);
    const subject = isCard
        ? (name ? `You're all set! ${name}'s VIP card is live 🎂` : "You're all set! Your VIP card is live 🎂")
        : (name ? `Your Premium universe for ${name} is ready ✨` : 'Your Premium birthday universe is ready ✨');

    const intro = isCard
        ? `Your VIP upgrade${name ? ` for ${name}'s card` : ''} is active. The crown, extra themes, soundtracks and photo gallery are unlocked.`
        : 'Your Premium universe is unlocked. The wax-sealed letter, memory album, cinematic scenes and permanent magic link are ready to share.';

    const details = [
        money ? ['Amount', money] : null,
        date ? ['Paid on', date] : null,
        orderId ? ['Order', orderId] : null,
        paymentId ? ['Payment', paymentId] : null,
    ].filter(Boolean);

    const detailsHtml = details.length
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
            ${details.map(([label, value]) => `<tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0ebf6;color:${MUTED};font-size:12px;width:34%;">${escapeHtml(label)}</td>
              <td style="padding:8px 0;border-bottom:1px solid #f0ebf6;color:${INK};font-size:12px;font-weight:600;word-break:break-word;">${escapeHtml(value)}</td>
            </tr>`).join('')}
          </table>`
        : '';

    const link = isCard ? cardUrl : magicLink;
    const cta = link ? button(link, isCard ? 'Open the VIP card' : 'Open your Premium universe') : '';

    const magicLinkHtml = !isCard && magicLink
        ? `<div style="margin:18px 0 0;padding:12px 14px;border-radius:12px;background:${PAPER};border:1px solid #ece5f5;">
            <p style="margin:0 0 6px;color:${MUTED};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Your magic link</p>
            <p style="margin:0;color:${INK};font-size:12px;line-height:1.6;word-break:break-all;">${escapeHtml(magicLink)}</p>
          </div>`
        : '';

    const html = layout({
        preheader: isCard ? 'Your VIP card upgrade is active.' : 'Your Premium universe is ready to share.',
        body: `
          <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;letter-spacing:-0.4px;color:${INK};">Payment confirmed ✅</h1>
          <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.7;">${escapeHtml(intro)}</p>
          ${detailsHtml}
          ${cta ? `<p style="margin:22px 0 0;">${cta}</p>` : ''}
          ${magicLinkHtml}
          <p style="margin:22px 0 0;color:${MUTED};font-size:12px;line-height:1.7;">This was a one-time payment. No subscription, no recurring charge, no account needed.</p>
        `,
        footer: `
          <p style="margin:0 0 8px;">You are receiving this because you provided this email at checkout.</p>
          ${supportUrl ? `<p style="margin:0;">Need help with your purchase? <a href="${escapeHtml(supportUrl)}" style="color:${PURPLE};font-weight:700;text-decoration:none;">WhatsApp us</a>.</p>` : ''}
        `,
    });

    const textLines = [
        'Payment confirmed',
        '',
        intro,
        '',
        ...details.map(([label, value]) => `${label}: ${value}`),
        '',
    ];
    if (link) textLines.push(isCard ? `Open the card: ${link}` : `Open your Premium universe: ${link}`);
    if (!isCard && magicLink) textLines.push(`Magic link: ${magicLink}`);
    textLines.push(
        '',
        'One-time payment. No subscription, no recurring charge, no account needed.',
        supportUrl ? `Need help? ${supportUrl}` : ''
    );
    const text = textLines.join('\n').trim();

    return { subject, html, text };
}

/**
 * Annual reminder, sent inside a 7-day window before the next birthday.
 * Includes an unsubscribe link and a List-Unsubscribe header upstream.
 */
export function renderReminderEmail({
    recipientName = '',
    senderName = '',
    birthdayDate = null,
    daysUntil = 7,
    cardUrl = '',
    createUrl = '',
    unsubscribeUrl = '',
    supportUrl = '',
} = {}) {
    const name = String(recipientName || '').trim() || 'someone special';
    const from = String(senderName || '').trim();
    const date = formatDate(birthdayDate);
    const when = daysUntil <= 0
        ? 'today'
        : daysUntil === 1
            ? 'tomorrow'
            : `in ${daysUntil} days`;
    const subject = `🎂 ${name}'s birthday is ${when}`;

    const html = layout({
        preheader: `${name}'s birthday is ${when}. Your card and photos are still saved.`,
        body: `
          <p style="margin:0 0 8px;color:${PURPLE};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">Birthday reminder</p>
          <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;letter-spacing:-0.4px;color:${INK};">${escapeHtml(name)}'s birthday is ${escapeHtml(when)}</h1>
          <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.7;">
            ${date ? `Their birthday is on <strong style="color:${INK};">${escapeHtml(date)}</strong>. ` : ''}
            You made a BirthdayGen card${from ? ` from ${escapeHtml(from)}` : ''} for ${escapeHtml(name)} — and it is still saved, photos and all.
          </p>
          <p style="margin:16px 0 0;color:${MUTED};font-size:14px;line-height:1.7;">Open it again, share the same link, or make a fresh card for this year. Either way, you are already ahead of everyone who forgot.</p>
          <p style="margin:24px 0 0;">${button(cardUrl, 'Open the saved card')}</p>
          <p style="margin:12px 0 0;">${button(createUrl, 'Make a fresh card', { secondary: true })}</p>
        `,
        footer: `
          <p style="margin:0 0 8px;">You asked for this reminder when you created the card. One email a year for this card, nothing else.</p>
          <p style="margin:0;">${unsubscribeUrl ? `No more reminders? <a href="${escapeHtml(unsubscribeUrl)}" style="color:${PURPLE};text-decoration:underline;">Unsubscribe</a>.` : 'Reply to this email to stop reminders.'}${supportUrl ? ` · <a href="${escapeHtml(supportUrl)}" style="color:${PURPLE};text-decoration:none;">Need help?</a>` : ''}</p>
        `,
    });

    const text = [
        `${name}'s birthday is ${when}`,
        '',
        date ? `Their birthday is on ${date}.` : '',
        `You made a BirthdayGen card for ${name}${from ? ` from ${from}` : ''} — and it is still saved, photos and all.`,
        '',
        `Open the saved card: ${cardUrl}`,
        `Make a fresh card: ${createUrl}`,
        '',
        'You asked for this reminder when you created the card. One email a year for this card, nothing else.',
        unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : '',
        supportUrl ? `Need help? ${supportUrl}` : '',
    ].join('\n').trim();

    return { subject, html, text };
}
