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
    const isGroup = tier === 'group_card';
    const isCard = tier === 'card_vip' || isGroup;
    const name = String(recipientName || '').trim();
    const money = formatMoney(amount, currency);
    const date = formatDate(paidAt);
    const subject = isGroup
        ? (name ? `${name}'s group card is live 🎂` : 'Your group card is live 🎂')
        : isCard
            ? (name ? `You're all set! ${name}'s VIP card is live 🎂` : "You're all set! Your VIP card is live 🎂")
            : (name ? `Your Premium universe for ${name} is ready ✨` : 'Your Premium birthday universe is ready ✨');

    const intro = isGroup
        ? `Your group card${name ? ` for ${name}` : ''} is live. Share the contributor link, collect wishes from everyone, and the VIP finish is unlocked too.`
        : isCard
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
    const cta = link
        ? button(link, isGroup ? 'Open the group card' : isCard ? 'Open the VIP card' : 'Open your Premium universe')
        : '';

    const magicLinkHtml = !isCard && magicLink
        ? `<div style="margin:18px 0 0;padding:12px 14px;border-radius:12px;background:${PAPER};border:1px solid #ece5f5;">
            <p style="margin:0 0 6px;color:${MUTED};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Your magic link</p>
            <p style="margin:0;color:${INK};font-size:12px;line-height:1.6;word-break:break-all;">${escapeHtml(magicLink)}</p>
          </div>`
        : '';

    const html = layout({
        preheader: isGroup
            ? 'Your group card and contributor link are ready.'
            : isCard ? 'Your VIP card upgrade is active.' : 'Your Premium universe is ready to share.',
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

/**
 * Abandoned-checkout recovery. Sent once, a couple of hours after an order was
 * created and left unpaid. The link is signed (order id + poll token) so only
 * the buyer who received this email can resume the exact order.
 */
export function renderRecoveryEmail({
    recipientName = '',
    tier = 'universe',
    amount = 0,
    currency = 'INR',
    resumeUrl = '',
    supportUrl = '',
} = {}) {
    const isCard = tier === 'card_vip';
    const isGroup = tier === 'group_card';
    const name = String(recipientName || '').trim();
    const money = formatMoney(amount, currency);
    const what = isGroup
        ? (name ? `the group card for ${name}` : 'your group card')
        : isCard
            ? (name ? `${name}'s VIP card` : 'your VIP card')
            : (name ? `the Premium universe for ${name}` : 'your Premium universe');
    const subject = isGroup
        ? `Your group card is still waiting 🎂`
        : isCard
            ? (name ? `${name}'s VIP card is still waiting 👑` : 'Your VIP card is still waiting 👑')
            : (name ? `Your Premium universe for ${name} is still waiting ✨` : 'Your Premium universe is still waiting ✨');

    const html = layout({
        preheader: `${what} is saved. Pick up where you left off.`,
        body: `
          <p style="margin:0 0 8px;color:${PURPLE};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">Still saved for you</p>
          <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;letter-spacing:-0.4px;color:${INK};">You were one tap away</h1>
          <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.7;">
            ${escapeHtml(what)} is still saved${money ? `, and the ${escapeHtml(money)} checkout is still open` : ''}. Nothing was charged.
            If the payment window closed or your UPI app interrupted the flow, you can finish it here.
          </p>
          <p style="margin:24px 0 0;">${button(resumeUrl, 'Finish my checkout')}</p>
          <p style="margin:16px 0 0;color:${MUTED};font-size:12px;line-height:1.7;">
            This link is tied to your order. If you already completed the payment, you can ignore this email — your card will unlock automatically.
          </p>
        `,
        footer: `
          <p style="margin:0 0 8px;">You are receiving this because you started a checkout on BirthdayGen.</p>
          ${supportUrl ? `<p style="margin:0;">Need help? <a href="${escapeHtml(supportUrl)}" style="color:${PURPLE};font-weight:700;text-decoration:none;">WhatsApp us</a>.</p>` : ''}
        `,
    });

    const text = [
        'You were one tap away',
        '',
        `${what} is still saved${money ? `, and the ${money} checkout is still open` : ''}. Nothing was charged.`,
        '',
        `Finish my checkout: ${resumeUrl}`,
        '',
        'If you already completed the payment, you can ignore this email.',
        supportUrl ? `Need help? ${supportUrl}` : '',
    ].join('\n').trim();

    return { subject, html, text };
}

/**
 * Scheduled delivery to the recipient. This is the one email the recipient
 * gets from us, so it stays short: who it is from, one button, no upsell.
 */
export function renderDeliveryEmail({
    recipientName = '',
    senderName = '',
    cardUrl = '',
    supportUrl = '',
} = {}) {
    const name = String(recipientName || '').trim() || 'you';
    const from = String(senderName || '').trim();
    const subject = from ? `🎂 ${from} sent you a birthday surprise` : '🎂 Someone sent you a birthday surprise';

    const html = layout({
        preheader: `A birthday surprise for ${name}. Open it on your phone.`,
        body: `
          <p style="margin:0 0 8px;color:${PURPLE};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">A birthday surprise</p>
          <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;letter-spacing:-0.4px;color:${INK};">Hey ${escapeHtml(name)} 🎁</h1>
          <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.7;">
            ${from ? `<strong style="color:${INK};">${escapeHtml(from)}</strong> made something special for your birthday. ` : 'Someone made something special for your birthday. '}
            Open it on your phone, turn the sound on, and blow out the candles.
          </p>
          <p style="margin:24px 0 0;">${button(cardUrl, 'Open your surprise')}</p>
          <p style="margin:16px 0 0;color:${MUTED};font-size:12px;line-height:1.7;">No app, no signup. The link is yours to keep.</p>
        `,
        footer: `
          <p style="margin:0 0 8px;">You are receiving this because someone scheduled a BirthdayGen card for you.</p>
          ${supportUrl ? `<p style="margin:0;">Trouble opening it? <a href="${escapeHtml(supportUrl)}" style="color:${PURPLE};font-weight:700;text-decoration:none;">WhatsApp us</a>.</p>` : ''}
        `,
    });

    const text = [
        `Hey ${name}`,
        '',
        `${from ? `${from} made` : 'Someone made'} something special for your birthday. Open it on your phone and blow out the candles.`,
        '',
        `Open your surprise: ${cardUrl}`,
        '',
        supportUrl ? `Need help? ${supportUrl}` : '',
    ].join('\n').trim();

    return { subject, html, text };
}

/**
 * Delivery assist for the creator when we do not have the recipient's email.
 * No WhatsApp provider is connected, so the honest fallback is a ready-to-send
 * WhatsApp link plus the card URL — the creator sends it themselves.
 */
export function renderDeliveryAssistEmail({
    recipientName = '',
    cardUrl = '',
    whatsappUrl = '',
    scheduledLabel = '',
    supportUrl = '',
} = {}) {
    const name = String(recipientName || '').trim() || 'them';
    const subject = `⏰ Time to send ${name}'s birthday card`;

    const html = layout({
        preheader: `Your scheduled delivery is due. One tap to send it on WhatsApp.`,
        body: `
          <p style="margin:0 0 8px;color:${PURPLE};font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">Scheduled delivery</p>
          <h1 style="margin:0 0 10px;font-size:24px;line-height:1.25;letter-spacing:-0.4px;color:${INK};">It's time to send ${escapeHtml(name)}'s card 🎂</h1>
          <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.7;">
            You asked us to remind you${scheduledLabel ? ` on ${escapeHtml(scheduledLabel)}` : ''}. We do not have ${escapeHtml(name)}'s email, so here is the card and a WhatsApp message ready to go.
          </p>
          <p style="margin:24px 0 0;">${button(whatsappUrl, 'Send on WhatsApp')}</p>
          <p style="margin:12px 0 0;">${button(cardUrl, 'Open the card first', { secondary: true })}</p>
          <p style="margin:16px 0 0;color:${MUTED};font-size:12px;line-height:1.7;">Tip: send it in the morning, not at midnight. The candles are more fun when they are awake.</p>
        `,
        footer: `
          <p style="margin:0 0 8px;">You scheduled this delivery on BirthdayGen.</p>
          ${supportUrl ? `<p style="margin:0;">Need help? <a href="${escapeHtml(supportUrl)}" style="color:${PURPLE};font-weight:700;text-decoration:none;">WhatsApp us</a>.</p>` : ''}
        `,
    });

    const text = [
        `It's time to send ${name}'s card`,
        '',
        `You asked us to remind you${scheduledLabel ? ` on ${scheduledLabel}` : ''}. We do not have ${name}'s email, so here is the card and a WhatsApp message ready to go.`,
        '',
        `Send on WhatsApp: ${whatsappUrl}`,
        `Open the card first: ${cardUrl}`,
        '',
        supportUrl ? `Need help? ${supportUrl}` : '',
    ].join('\n').trim();

    return { subject, html, text };
}
