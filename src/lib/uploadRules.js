/**
 * Shared upload validation rules.
 *
 * Used by both the server upload route and the Vercel Blob token route so the
 * two paths can never disagree about what counts as a valid photo or song.
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB max for photos
export const MAX_AUDIO_SIZE = 8 * 1024 * 1024; // 8MB max for premium music

export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/avif',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
];

export const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/mp4',
    'audio/webm',
];

export function isAudioUpload(fileType = '', fileName = '') {
    return (
        ALLOWED_AUDIO_TYPES.includes(fileType) ||
        /\.(mp3|m4a|wav|aac|ogg|webm)$/i.test(fileName)
    );
}

export function isImageUpload(fileType = '', fileName = '') {
    return (
        ALLOWED_IMAGE_TYPES.includes(fileType) ||
        /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp|tiff?|svg|ico)$/i.test(fileName) ||
        // HEIC files from iOS often arrive with empty or generic MIME types
        ((!fileType || fileType === 'application/octet-stream') && /\.(heic|heif)$/i.test(fileName))
    );
}
