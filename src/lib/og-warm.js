import { after } from 'next/server';
import { uploadFileToR2 } from '@/lib/r2';
import { buildOgPath, normalizeOgInput, ogStorageKey } from '@/lib/og';

/**
 * Pre-render a card's social preview and store it in R2.
 *
 * /api/og then redirects to the stored PNG, so unfurls from any region are
 * served by Cloudflare's CDN instead of booting Satori + resvg on a cold edge
 * isolate. Measured cost of a cold render was ~1.2s of CPU, which made it the
 * single largest line item in the project's Fluid Active CPU usage.
 *
 * Runs after the response has been sent. Every failure is swallowed on
 * purpose: if the image is not stored, /api/og renders it on demand exactly
 * as it did before this optimisation existed.
 *
 * Kept out of `@/lib/og` because it pulls in the AWS SDK, and that module is
 * imported by the edge-runtime OG route.
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
            const origin = new URL(request.url).origin;
            const absoluteUrl = `${origin}${ogPath}`;

            const response = await fetch(absoluteUrl);
            if (!response.ok) return;

            const buffer = Buffer.from(await response.arrayBuffer());
            const key = ogStorageKey(normalizeOgInput(new URL(absoluteUrl).searchParams));
            await uploadFileToR2({ buffer, key, contentType: 'image/png' });
        } catch (error) {
            console.warn('OG pre-render skipped:', error?.message || error);
        }
    });
}
