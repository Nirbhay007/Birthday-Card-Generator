/**
 * Centralized Alerting Utility — Email via Resend
 *
 * Required environment variables:
 *   RESEND_API_KEY      — Get free at https://resend.com (3,000 emails/month free)
 *   ALERT_FROM_EMAIL    — Verified sender domain, e.g. "alerts@yourdomain.com"
 *                         Default: "onboarding@resend.dev" (works for testing, sends to verified emails only)
 *   ALERT_TO_EMAIL      — Destination email. Default: nirbhaysinghbe1@gmail.com
 */

import { Resend } from 'resend';

// In-memory rate limiting — suppress duplicate alerts for 10 minutes per unique alert type
const recentAlerts = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function sendEmailAlert({ title, message, level = 'warning' }) {
    try {
        const alertKey = `${level}:${title}`;
        const now = Date.now();
        const lastSent = recentAlerts.get(alertKey);

        if (lastSent && now - lastSent < RATE_LIMIT_WINDOW_MS) {
            console.log(`[Alerts] Suppressing duplicate alert '${title}' (throttled for 10m)`);
            return { throttled: true };
        }
        recentAlerts.set(alertKey, now);

        const apiKey = process.env.RESEND_API_KEY?.trim();
        if (!apiKey) {
            console.warn('[Alerts] RESEND_API_KEY not set. Email alert skipped.');
            return { success: false, reason: 'RESEND_API_KEY not set' };
        }

        const toEmail = process.env.ALERT_TO_EMAIL || 'nirbhaysinghbe1@gmail.com';
        const fromEmail = process.env.ALERT_FROM_EMAIL || 'alerts@nirbhay.online';
        const istTime = new Date(now + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' IST';

        const icon = level === 'critical' ? '🚨' : level === 'warning' ? '⚠️' : 'ℹ️';
        const badgeColor = level === 'critical' ? '#dc2626' : level === 'warning' ? '#d97706' : '#2563eb';
        const badgeLabel = level.toUpperCase();

        const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td style="background:${badgeColor};padding:4px 24px;">
          <p style="margin:0;color:#fff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${icon} ${badgeLabel} ALERT — Birthday Generator</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 28px 20px;">
          <h1 style="margin:0 0 12px;color:#f9fafb;font-size:18px;font-weight:600;line-height:1.3;">${title}</h1>
          <p style="margin:0 0 20px;color:#9ca3af;font-size:14px;line-height:1.6;">${message}</p>
          <hr style="border:none;border-top:1px solid #2a2a2a;margin:20px 0;">
          <p style="margin:0;color:#6b7280;font-size:12px;">🕒 ${istTime}</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#111;padding:14px 28px;border-top:1px solid #2a2a2a;">
          <p style="margin:0;color:#4b5563;font-size:11px;">Automated alert from <strong>birthday-generator</strong> · <a href="https://vercel.com" style="color:#6b7280;text-decoration:none;">View Vercel Logs</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject: `${icon} [${badgeLabel}] ${title}`,
            html,
        });

        if (error) {
            console.error('[Alerts] Resend error:', error);
            return { success: false, error };
        }

        console.log(`[Alerts] Email alert sent successfully (id: ${data?.id})`);
        return { success: true, id: data?.id };
    } catch (err) {
        console.error('[Alerts] Failed to send alert email:', err?.message || err);
        return { success: false, error: err?.message };
    }
}
