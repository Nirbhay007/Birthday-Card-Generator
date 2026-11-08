import { NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';
import { getClientIp } from '@/lib/clientIp';
import { isUploadRateLimited } from '@/lib/uploadRateLimit';
import { HEIC_SOURCE_PREFIX, MAX_HEIC_SOURCE_SIZE } from '@/lib/uploadRules';
import { convertHeicBufferToJpeg, isHeicBuffer } from '@/lib/heicServer';
import { storeMediaBuffer } from '@/lib/mediaStorage';
import { sendEmailAlert } from '@/lib/alerts';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST /api/upload/heic — convert a large HEIC/HEIF photo that the browser
 * could not decode.
 *
 * Vercel caps a serverless request body at 4.5MB, so the client first uploads
 * the original file straight to Vercel Blob and sends this route its public
 * URL. The route downloads it, converts it to a downscaled JPEG, stores the
 * JPEG in the normal photo location, and removes the temporary source.
 */

const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';
const MAX_SOURCE_AGE_MS = 15 * 60 * 1000;

function isTemporaryHeicSourceUrl(value) {
    try {
        const url = new URL(value);
        if (url.protocol !== 'https:') return false;
        if (url.username || url.password || url.port) return false;
        if (!url.hostname.toLowerCase().endsWith(BLOB_HOST_SUFFIX)) return false;
        if (!url.pathname.startsWith('/photos/')) return false;

        const name = decodeURIComponent(url.pathname.split('/').pop() || '');
        return name.startsWith(HEIC_SOURCE_PREFIX);
    } catch {
        return false;
    }
}

function fileNameFromUrl(value) {
    try {
        const pathname = new URL(value).pathname;
        const name = decodeURIComponent(pathname.split('/').pop() || 'photo.heic');
        return name.startsWith(HEIC_SOURCE_PREFIX)
            ? name.slice(HEIC_SOURCE_PREFIX.length) || 'photo.heic'
            : name;
    } catch {
        return 'photo.heic';
    }
}

export async function POST(request) {
    let sourceUrl = null;

    try {
        const ip = getClientIp(request);
        if (ip && isUploadRateLimited(ip)) {
            return NextResponse.json(
                { success: false, error: 'Upload limit reached (max 40 uploads per hour). Please try again in a little while.' },
                { status: 429 }
            );
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json(
                { success: false, error: 'Large-file uploads are not configured on this deployment.' },
                { status: 503 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ success: false, error: 'Invalid upload request.' }, { status: 400 });
        }

        sourceUrl = typeof body?.url === 'string' ? body.url : null;
        if (!sourceUrl || !isTemporaryHeicSourceUrl(sourceUrl)) {
            return NextResponse.json({ success: false, error: 'Invalid photo source.' }, { status: 400 });
        }

        // Confirm the hand-off file belongs to this Blob store and was created
        // moments ago. This prevents the route from touching real user photos.
        let blobInfo;
        try {
            blobInfo = await head(sourceUrl);
        } catch (headError) {
            console.warn('[Upload] Temporary HEIC source not found:', headError?.message || headError);
            return NextResponse.json(
                { success: false, error: 'Could not read the uploaded photo. Please try again.' },
                { status: 400 }
            );
        }

        if (blobInfo.size > MAX_HEIC_SOURCE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'That photo is too large. Please choose a photo under 25MB.' },
                { status: 400 }
            );
        }

        const uploadedAt = Date.parse(blobInfo.uploadedAt);
        if (!Number.isFinite(uploadedAt) || Date.now() - uploadedAt > MAX_SOURCE_AGE_MS) {
            return NextResponse.json(
                { success: false, error: 'This upload link has expired. Please try again.' },
                { status: 400 }
            );
        }

        const sourceResponse = await fetch(sourceUrl, {
            cache: 'no-store',
            signal: AbortSignal.timeout(20000),
        });

        if (!sourceResponse.ok) {
            return NextResponse.json(
                { success: false, error: 'Could not read the uploaded photo. Please try again.' },
                { status: 400 }
            );
        }

        const declaredSize = Number(sourceResponse.headers.get('content-length') || 0);
        if (declaredSize > MAX_HEIC_SOURCE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'That photo is too large. Please choose a photo under 25MB.' },
                { status: 400 }
            );
        }

        const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());
        if (sourceBuffer.length > MAX_HEIC_SOURCE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'That photo is too large. Please choose a photo under 25MB.' },
                { status: 400 }
            );
        }

        if (!isHeicBuffer(sourceBuffer)) {
            return NextResponse.json(
                { success: false, error: 'This file is not a valid HEIC photo. Please choose another image.' },
                { status: 400 }
            );
        }

        let jpegBuffer;
        try {
            jpegBuffer = await convertHeicBufferToJpeg(sourceBuffer);
        } catch (conversionError) {
            console.error('[Upload] HEIC conversion failed:', conversionError?.message || conversionError);
            return NextResponse.json(
                { success: false, error: 'We could not process this HEIC photo. Please try another photo.' },
                { status: 422 }
            );
        }

        const sourceName = fileNameFromUrl(sourceUrl);
        const outputName = `${sourceName.replace(/\.(heic|heif)$/i, '') || 'photo'}.jpg`;
        const safeName = outputName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const pathname = `photos/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

        const { url, provider } = await storeMediaBuffer({
            buffer: jpegBuffer,
            pathname,
            contentType: 'image/jpeg',
        });

        return NextResponse.json({
            success: true,
            url,
            name: outputName,
            size: jpegBuffer.length,
            kind: 'photo',
            provider,
        });
    } catch (error) {
        console.error('[Upload] HEIC route failed:', error?.message || error);
        sendEmailAlert({
            title: 'CRITICAL: HEIC Upload Failed',
            message: `A HEIC photo could not be converted on the server: ${error?.message || 'Unknown error'}.`,
            level: 'critical',
        }).catch(console.error);
        return NextResponse.json(
            { success: false, error: 'Upload failed. Please check your connection and try again.' },
            { status: 500 }
        );
    } finally {
        // The source was only a temporary hand-off to this function. Never
        // delete anything that does not carry the dedicated temp prefix.
        if (sourceUrl && isTemporaryHeicSourceUrl(sourceUrl) && process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                await del(sourceUrl);
            } catch (error) {
                console.warn('[Upload] Could not delete temporary HEIC source:', error?.message || error);
            }
        }
    }
}
