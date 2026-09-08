import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// In-memory sliding-window rate limiting (20 uploads per hour per IP)
const uploadRateLimit = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const limit = 20; // 20 uploads per hour

    const timestamps = uploadRateLimit.get(ip) || [];
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= limit) {
        uploadRateLimit.set(ip, validTimestamps);
        return true;
    }

    validTimestamps.push(now);
    uploadRateLimit.set(ip, validTimestamps);

    // Periodically clean up stale IPs from map
    if (uploadRateLimit.size > 500) {
        for (const [key, times] of uploadRateLimit.entries()) {
            if (times.every((t) => now - t >= windowMs)) {
                uploadRateLimit.delete(key);
            }
        }
    }

    return false;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO_TYPES = [
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB max for photos
const MAX_AUDIO_SIZE = 8 * 1024 * 1024; // 8MB max for premium music

export async function POST(request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

        // 1. IP Rate Limiting
        if (ip !== 'unknown' && isRateLimited(ip)) {
            return NextResponse.json(
                { success: false, error: 'Upload limit reached (max 20 uploads per hour). Please try again in a little while.' },
                { status: 429 }
            );
        }

        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided. Please choose a photo or audio file to upload.' }, { status: 400 });
        }

        // Determine file category (image or audio)
        const fileType = (file.type || '').toLowerCase();
        const fileName = (file.name || '').toLowerCase();

        const isAudio =
            ALLOWED_AUDIO_TYPES.includes(fileType) ||
            /\.(mp3|m4a|wav|aac|ogg|webm)$/i.test(fileName);

        const isImage =
            ALLOWED_IMAGE_TYPES.includes(fileType) ||
            /\.(jpe?g|png|webp|gif)$/i.test(fileName);

        if (!isImage && !isAudio) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unsupported file format. Please upload photos (JPG, PNG, WebP) or songs (MP3, M4A, WAV, AAC, OGG).',
                },
                { status: 400 }
            );
        }

        // Check size constraints
        if (isImage && file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json(
                { success: false, error: `Photo is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max photo size is 5MB.` },
                { status: 400 }
            );
        }

        if (isAudio && file.size > MAX_AUDIO_SIZE) {
            return NextResponse.json(
                { success: false, error: `Music file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max audio size is 8MB.` },
                { status: 400 }
            );
        }

        // Organize into subdirectories for clear management & cleanup
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const folder = isAudio ? 'music' : 'photos';
        const pathname = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

        const blob = await put(pathname, file, {
            access: 'public',
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
            name: file.name,
            size: file.size,
            kind: isAudio ? 'audio' : 'photo',
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Upload failed. Please check your connection and try again.' },
            { status: 500 }
        );
    }
}
