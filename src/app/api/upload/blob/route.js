import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { getClientIp } from '@/lib/clientIp';
import { isUploadRateLimited } from '@/lib/uploadRateLimit';
import {
    ALLOWED_AUDIO_TYPES,
    ALLOWED_IMAGE_TYPES,
    MAX_AUDIO_SIZE,
    MAX_IMAGE_SIZE,
} from '@/lib/uploadRules';

/**
 * POST /api/upload/blob — token endpoint for direct browser → Vercel Blob
 * uploads.
 *
 * Vercel caps a serverless request body at 4.5MB, which is smaller than the
 * 8MB audio limit this app promises. Files over that size are uploaded
 * straight from the browser: the client asks this route for a short-lived
 * token, then PUTs the bytes to Blob. Small files keep using /api/upload's
 * R2 path, so existing media stays where it is.
 *
 * The token is scoped to one pathname and one content-type allowlist, and the
 * route is throttled like the normal upload route.
 */

const UPLOAD_PATH = /^(photos|music)\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

export async function POST(request) {
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

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                if (!UPLOAD_PATH.test(pathname)) {
                    throw new Error('Invalid upload path.');
                }

                const isAudio = pathname.startsWith('music/');
                return {
                    allowedContentTypes: isAudio ? ALLOWED_AUDIO_TYPES : ALLOWED_IMAGE_TYPES,
                    maximumSizeInBytes: isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE,
                    addRandomSuffix: false,
                };
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error('[Upload] Blob token error:', error?.message || error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Could not authorize upload.' },
            { status: 400 }
        );
    }
}
