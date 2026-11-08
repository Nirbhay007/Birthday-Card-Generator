import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/clientIp';
import { isUploadRateLimited } from '@/lib/uploadRateLimit';
import { MAX_AUDIO_SIZE, MAX_IMAGE_SIZE, isAudioUpload, isHeicUpload, isImageUpload } from '@/lib/uploadRules';
import { storeMediaBuffer } from '@/lib/mediaStorage';
import { convertHeicBufferToJpeg, isHeicBuffer } from '@/lib/heicServer';
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
        let buffer = Buffer.from(arrayBuffer);
        let contentType = file.type || (isAudio ? 'audio/mpeg' : 'image/jpeg');
        let uploadName = file.name;

        // Normalize HEIC/HEIF photos on the server. The browser usually
        // converts them first, but passing through a file the client could
        // not decode leaves an image most browsers cannot display.
        if (isImage && isHeicUpload(fileType, fileName)) {
            if (!isHeicBuffer(buffer)) {
                return NextResponse.json(
                    { success: false, error: 'This file is not a valid HEIC photo. Please choose another image.' },
                    { status: 400 }
                );
            }

            try {
                buffer = await convertHeicBufferToJpeg(buffer);
                contentType = 'image/jpeg';
                uploadName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
            } catch (conversionError) {
                console.error('[Upload] HEIC conversion failed:', conversionError?.message || conversionError);
                return NextResponse.json(
                    { success: false, error: 'We could not process this HEIC photo. Please try another photo.' },
                    { status: 422 }
                );
            }
        }

        // Organize into subdirectories for clear management & cleanup
        const safeName = uploadName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
        const folder = isAudio ? 'music' : 'photos';
        const pathname = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;

        const { url, provider: storageProvider } = await storeMediaBuffer({
            buffer,
            pathname,
            contentType,
        });

        return NextResponse.json({
            success: true,
            url,
            name: uploadName,
            size: buffer.length,
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
