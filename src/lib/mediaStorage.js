import { uploadFileToR2 } from '@/lib/r2';
import { put } from '@vercel/blob';
import { sendEmailAlert } from '@/lib/alerts';

/**
 * Store an uploaded media buffer in R2, falling back to Vercel Blob when R2 is
 * unavailable. Shared by the normal upload route and the HEIC conversion
 * route so both paths behave identically.
 */
export async function storeMediaBuffer({ buffer, pathname, contentType }) {
    try {
        const { url } = await uploadFileToR2({
            buffer,
            key: pathname,
            contentType,
        });
        return { url, provider: 'r2' };
    } catch (r2Error) {
        console.warn('[Upload] Primary R2 upload failed, attempting Vercel Blob fallback:', r2Error?.message || r2Error);
        sendEmailAlert({
            title: 'R2 Upload Failed (Fallback Engaged)',
            message: `Cloudflare R2 failed (${r2Error?.name || 'Error'}: ${r2Error?.message || 'AccessDenied'}). Switched to Vercel Blob fallback automatically.`,
            level: 'warning',
        }).catch(console.error);

        if (!process.env.BLOB_READ_WRITE_TOKEN) throw r2Error;

        const blob = await put(pathname, buffer, {
            access: 'public',
            contentType,
        });
        return { url: blob.url, provider: 'vercel-blob' };
    }
}
