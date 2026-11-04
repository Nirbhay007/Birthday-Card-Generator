import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/clientIp';
import { isUploadRateLimited } from '@/lib/uploadRateLimit';
import { MAX_AUDIO_SIZE, MAX_IMAGE_SIZE, isAudioUpload, isImageUpload } from '@/lib/uploadRules';
import { uploadFileToR2 } from '@/lib/r2';
import { put } from '@vercel/blob';
import { sendEmailAlert } from '@/lib/alerts';

export async function POST(request) {
    try {
        const ip = getClientIp(request);

        // 1. IP Rate Limiting
        if (ip && isUploadRateLimited(ip)) {
            return NextResponse.json(
                { success: false, error: 'Upload limit reached (max 40 uploads per hour). Please try again in a little while.' },
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

        const isAudio = isAudioUpload(fileType, fileName);
        const isImage = isImageUpload(fileType, fileName);

        if (!isImage && !isAudio) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unsupported file format. Please upload photos (JPG, PNG, WebP, HEIC, AVIF, GIF) or songs (MP3, M4A, WAV, AAC, OGG).',
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

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = file.type || (isAudio ? 'audio/mpeg' : 'image/jpeg');

        // Organize into subdirectories for clear management & cleanup
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const folder = isAudio ? 'music' : 'photos';
        const pathname = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

        let url;
        let storageProvider = 'r2';

        try {
            const { url: r2Url } = await uploadFileToR2({
                buffer,
                key: pathname,
                contentType,
            });
            url = r2Url;
        } catch (r2Error) {
            console.warn('[Upload] Primary R2 upload failed, attempting Vercel Blob fallback:', r2Error?.message || r2Error);
            sendEmailAlert({
                title: 'R2 Upload Failed (Fallback Engaged)',
                message: `Cloudflare R2 failed (${r2Error?.name || 'Error'}: ${r2Error?.message || 'AccessDenied'}). Switched to Vercel Blob fallback automatically.`,
                level: 'warning',
            }).catch(console.error);

            if (process.env.BLOB_READ_WRITE_TOKEN) {
                const blob = await put(pathname, buffer, {
                    access: 'public',
                    contentType,
                });
                url = blob.url;
                storageProvider = 'vercel-blob';
            } else {
                throw r2Error;
            }
        }

        return NextResponse.json({
            success: true,
            url,
            name: file.name,
            size: file.size,
            kind: isAudio ? 'audio' : 'photo',
            provider: storageProvider,
        });
    } catch (error) {
        console.error('Upload error:', error);
        sendEmailAlert({
            title: 'CRITICAL: Media Upload Failed Completely',
            message: `User file upload failed: ${error?.message || 'Unknown error'}. Card creation blocked!`,
            level: 'critical',
        }).catch(console.error);
        return NextResponse.json(
            { success: false, error: 'Upload failed. Please check your connection and try again.' },
            { status: 500 }
        );
    }
}
