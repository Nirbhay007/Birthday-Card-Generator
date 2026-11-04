import { after } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2';
import { buildOgPath, normalizeOgInput, ogStorageKey } from '@/lib/og';

/**
 * Pre-render a card's social preview and store it in R2.
 *
 * /api/og then redirects to the stored PNG, so unfurls from any region are
 * served as a static R2 object instead of booting Satori + resvg in every
 * function instance. Measured cost of a cold render was ~1.2s of CPU, which
 * made it the single largest line item in the project's function usage.
 *
 * Runs after the response has been sent. Every failure is swallowed on
 * purpose: if the image is not stored, /api/og falls back to the generic
 * default preview exactly as it did before this optimisation existed.
 *
 * The fetch must never follow a redirect. /api/og answers ordinary callers
 * with a 302 (to the stored PNG, or to the default one), and following one
 * would upload that generic image under the card's own immutable key. The
 * `warm=1` + Bearer secret pair is what makes the route render instead.
 *
 * Kept out of `@/lib/og` because it pulls in the AWS SDK.
 */
export function warmOgImage(request, page) {
    const ogPath = buildOgPath({
        recipientName: page.recipientName,
        age: page.age,
        theme: page.theme,
        senderName: page.senderName,
    });

    after(async () => {
        try {
            const secret = (process.env.CRON_SECRET || '').trim();
            if (!secret) return;

            const origin = new URL(request.url).origin;
            const absoluteUrl = `${origin}${ogPath}`;
            const warmUrl = `${absoluteUrl}${absoluteUrl.includes('?') ? '&' : '?'}warm=1`;

            const response = await fetch(warmUrl, {
                redirect: 'manual',
                headers: { authorization: `Bearer ${secret}` },
            });
            if (response.status !== 200) return;
            if (!(response.headers.get('content-type') || '').startsWith('image/png')) return;

            const buffer = Buffer.from(await response.arrayBuffer());
            const key = ogStorageKey(normalizeOgInput(new URL(absoluteUrl).searchParams));
            await uploadFileToR2({ buffer, key, contentType: 'image/png' });
        } catch (error) {
            console.warn('OG pre-render skipped:', error?.message || error);
        }
    });
}
