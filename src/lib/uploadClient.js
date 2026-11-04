'use client';

import { upload } from '@vercel/blob/client';

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
export async function uploadDirectToBlob(file, folder) {
    const pathname = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeFileName(file.name)}`;
    const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/blob',
        contentType: contentTypeFor(file, folder),
    });

    return blob.url;
}
