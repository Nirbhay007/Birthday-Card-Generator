'use client';

import { upload } from '@vercel/blob/client';
import { HEIC_SOURCE_PREFIX, isHeicUpload } from '@/lib/uploadRules';

/**
 * Files at or below this size go through /api/upload (R2). Vercel caps a
 * serverless request body at 4.5MB, so leave a little headroom before
 * switching to a direct browser → Vercel Blob upload.
 */
export const SERVER_UPLOAD_SAFE_LIMIT = 4 * 1024 * 1024;

export function needsDirectBlobUpload(file) {
    return Boolean(file?.size && file.size > SERVER_UPLOAD_SAFE_LIMIT);
}

function safeFileName(name) {
    return String(name || 'upload')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 80) || 'upload';
}

const EXTENSION_CONTENT_TYPES = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    avif: 'image/avif',
    bmp: 'image/bmp',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    wav: 'audio/wav',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
};

function contentTypeFor(file, folder) {
    const declared = (file?.type || '').toLowerCase();
    if (declared && declared !== 'application/octet-stream') return declared;

    const extension = String(file?.name || '').split('.').pop().toLowerCase();
    return EXTENSION_CONTENT_TYPES[extension] || (folder === 'music' ? 'audio/mpeg' : 'image/jpeg');
}

/**
 * Upload a large file directly to Vercel Blob, bypassing the function body
 * limit. Returns the public URL, matching what /api/upload responds with.
 */
export async function uploadDirectToBlob(file, folder, { prefix = '' } = {}) {
    const pathname = `${folder}/${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeFileName(file.name)}`;
    const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/blob',
        contentType: contentTypeFor(file, folder),
    });

    return blob.url;
}

async function uploadViaApi(file) {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    let data = null;
    try {
        data = await res.json();
    } catch {
        // Fall through to the status-based message below.
    }

    if (!res.ok || !data?.success || !data.url) {
        throw new Error(
            data?.error ||
                (res.status === 413
                    ? 'That photo is too large. Please select a smaller photo.'
                    : 'Failed to upload photo. Please try again.')
        );
    }

    return data.url;
}

function withHeicExtension(file) {
    if (/\.(heic|heif)$/i.test(file.name || '')) return file;

    const base = String(file.name || 'photo').replace(/\.[^.]+$/, '') || 'photo';
    return new File([file], `${base}.heic`, { type: 'image/heic' });
}

/**
 * A HEIC that survived client-side conversion (unsupported browser, huge
 * photo, unusual HEVC profile) is converted by the server instead:
 * - small files go through /api/upload, which converts in-process;
 * - large files are first put in temporary Blob storage so they bypass the
 *   serverless body limit, then /api/upload/heic converts and cleans them up.
 */
async function uploadHeicPhoto(file) {
    if (!needsDirectBlobUpload(file)) {
        return uploadViaApi(file);
    }

    const sourceUrl = await uploadDirectToBlob(withHeicExtension(file), 'photos', {
        prefix: HEIC_SOURCE_PREFIX,
    });
    if (!sourceUrl) throw new Error('Failed to upload photo');

    const res = await fetch('/api/upload/heic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl }),
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        // Fall through to the generic message below.
    }

    if (!res.ok || !data?.success || !data.url) {
        throw new Error(data?.error || 'Could not process this HEIC photo. Please try again.');
    }

    return data.url;
}

/**
 * Upload one photo and return its public URL. Handles HEIC conversion,
 * large-file direct uploads, and the normal serverless upload route.
 */
export async function uploadPhotoFile(file) {
    if (!file) throw new Error('No photo selected.');

    if (isHeicUpload(file.type, file.name)) {
        return uploadHeicPhoto(file);
    }

    if (needsDirectBlobUpload(file)) {
        const url = await uploadDirectToBlob(file, 'photos');
        if (!url) throw new Error('Failed to upload photo');
        return url;
    }

    return uploadViaApi(file);
}
