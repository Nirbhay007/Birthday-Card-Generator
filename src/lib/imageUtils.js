/**
 * Client-side image utility for normalizing and compressing user-uploaded photos.
 * Handles Apple HEIC/HEIF files, downscales high-megapixel camera photos,
 * and converts them into lightweight, universal JPEGs for fast uploads.
 */

export function isHeicFile(file) {
    if (!file) return false;
    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    return (
        name.endsWith('.heic') ||
        name.endsWith('.heif') ||
        type === 'image/heic' ||
        type === 'image/heif'
    );
}

/**
 * Dynamically converts a HEIC/HEIF File or Blob to a standard JPEG File in the browser.
 */
export async function convertHeicToJpeg(file) {
    if (typeof window === 'undefined') return file;

    try {
        const heic2anyModule = await import('heic2any');
        const heic2any = heic2anyModule.default || heic2anyModule;

        const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.86,
        });

        const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        const newFileName = (file.name || 'photo.heic').replace(/\.(heic|heif)$/i, '.jpg');

        return new File([singleBlob], newFileName, { type: 'image/jpeg' });
    } catch (err) {
        console.warn('HEIC client conversion skipped or failed:', err);
        return file;
    }
}

/**
 * Downscales and compresses an image File using HTML Canvas.
 * - Handles HEIC conversion first if required.
 * - Caps max dimension at `maxDim` (default 1600px).
 * - Encodes as JPEG at `quality` (default 0.82).
 * - Keeps already small (<300KB) JPEG/PNG/WebP files intact to avoid unnecessary recompression.
 */
export async function compressAndNormalizeImage(file, maxDim = 1600, quality = 0.82) {
    if (!file) return file;

    let workFile = file;

    // 1. Convert HEIC to JPEG if needed
    if (isHeicFile(workFile)) {
        workFile = await convertHeicToJpeg(workFile);
    }

    // 2. If it's not an image MIME type and doesn't look like an image, return as-is
    const isImageLike =
        (workFile.type && workFile.type.startsWith('image/')) ||
        /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(workFile.name || '');

    if (!isImageLike) {
        return workFile;
    }

    // 3. Skip already compressed small files
    if (
        workFile.size < 300 * 1024 &&
        (workFile.type === 'image/jpeg' || workFile.type === 'image/webp' || workFile.type === 'image/png')
    ) {
        return workFile;
    }

    // 4. Decode and compress using Image + Canvas
    return new Promise((resolve) => {
        if (typeof window === 'undefined') {
            resolve(workFile);
            return;
        }

        let objectUrl = '';
        try {
            objectUrl = URL.createObjectURL(workFile);
        } catch {
            resolve(workFile);
            return;
        }

        const img = new Image();
        let isDone = false;

        const cleanup = () => {
            if (objectUrl) {
                try {
                    URL.revokeObjectURL(objectUrl);
                } catch {}
                objectUrl = '';
            }
        };

        const finish = (result) => {
            if (isDone) return;
            isDone = true;
            cleanup();
            resolve(result);
        };

        img.onload = () => {
            try {
                let { naturalWidth: width, naturalHeight: height } = img;
                if (!width || !height) {
                    width = img.width;
                    height = img.height;
                }

                if (!width || !height) {
                    finish(workFile);
                    return;
                }

                const scale = Math.min(1, maxDim / Math.max(width, height));
                const targetWidth = Math.round(width * scale);
                const targetHeight = Math.round(height * scale);

                // If already within bounds and JPEG under 1.5MB, no resize needed
                if (scale >= 1 && workFile.type === 'image/jpeg' && workFile.size < 1.5 * 1024 * 1024) {
                    finish(workFile);
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    finish(workFile);
                    return;
                }

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            finish(workFile);
                            return;
                        }
                        const finalName = (workFile.name || 'photo.jpg')
                            .replace(/\.[^.]+$/, '')
                            .slice(0, 80) + '.jpg';
                        finish(new File([blob], finalName, { type: 'image/jpeg' }));
                    },
                    'image/jpeg',
                    quality
                );
            } catch (err) {
                console.warn('Canvas compression error:', err);
                finish(workFile);
            }
        };

        img.onerror = () => {
            console.warn('Could not decode image for canvas compression, returning workFile');
            finish(workFile);
        };

        img.src = objectUrl;
    });
}
