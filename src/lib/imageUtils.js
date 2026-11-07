/**
 * Client-side image utility for normalizing and compressing user-uploaded photos.
 * Handles Apple HEIC/HEIF files, downscales high-megapixel camera photos,
 * and converts them into lightweight, universal JPEGs for fast uploads.
 */

export function isHeicFile(file) {
    if (!file) return false;
    const name = (file.name || '').toLowerCase();
    const type = (file.type || '').toLowerCase();
    const hasHeicExt = name.endsWith('.heic') || name.endsWith('.heif');
    const hasHeicMime = type === 'image/heic' || type === 'image/heif';
    // Many browsers report HEIC files with empty or generic MIME types
    const hasGenericMime = !type || type === 'application/octet-stream';
    return hasHeicMime || (hasHeicExt && hasGenericMime) || hasHeicExt;
}

/**
 * Try native hardware-accelerated decode first (Safari on iOS & macOS).
 * Returns a JPEG File if successful, or null if not supported natively.
 */
async function tryNativeDecode(file, maxDim = 1600, quality = 0.85) {
    if (typeof window === 'undefined' || !file) return null;

    // Fast path: createImageBitmap (Safari 17+ on Apple hardware supports HEIC)
    if (typeof createImageBitmap === 'function') {
        try {
            const bmp = await createImageBitmap(file);
            const { width, height } = bmp;
            if (width && height) {
                const scale = Math.min(1, maxDim / Math.max(width, height));
                const targetW = Math.max(1, Math.round(width * scale));
                const targetH = Math.max(1, Math.round(height * scale));
                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(bmp, 0, 0, targetW, targetH);
                    bmp.close?.();
                    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
                    if (blob && blob.size > 0) {
                        const newName = (file.name || 'photo.heic').replace(/\.(heic|heif)$/i, '.jpg');
                        return new File([blob], newName, { type: 'image/jpeg' });
                    }
                }
                bmp.close?.();
            }
        } catch {
            // Not supported natively in this browser engine (e.g. Chrome / Firefox)
        }
    }

    return null;
}

/**
 * Convert HEIC using 'heic-to/csp' with a timeout.
 * Uses the CSP-safe build to prevent Content Security Policy violations in production.
 * A 10MB HEIC already takes ~6s in WASM on a fast desktop, so the timeout is
 * generous: a short one rejects exactly the large phone photos that need this
 * path most. The uploader shows a progress message while it runs.
 */
async function tryWasmHeicToJpeg(file, timeoutMs = 30000) {
    if (typeof window === 'undefined' || !file) return null;

    try {
        const { heicTo } = await import('heic-to/csp');
        if (typeof heicTo !== 'function') return null;

        const conversionPromise = heicTo({
            blob: file,
            type: 'image/jpeg',
            quality: 0.86,
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('HEIC conversion timed out')), timeoutMs)
        );

        const convertedBlob = await Promise.race([conversionPromise, timeoutPromise]);
        if (!convertedBlob || convertedBlob.size === 0) return null;

        const newFileName = (file.name || 'photo.heic').replace(/\.(heic|heif)$/i, '.jpg');
        return new File([convertedBlob], newFileName, { type: 'image/jpeg' });
    } catch (err) {
        console.warn('WASM HEIC conversion error:', err);
        return null;
    }
}

/**
 * Dynamically converts a HEIC/HEIF File or Blob to a standard JPEG File in the browser.
 * Falls back gracefully if conversion is unavailable.
 */
export async function convertHeicToJpeg(file) {
    if (typeof window === 'undefined' || !file) return file;

    // 1. Try native decoding first (Safari / iOS hardware-accelerated, ~20ms)
    try {
        const nativeResult = await tryNativeDecode(file);
        if (nativeResult) return nativeResult;
    } catch (err) {
        console.warn('Native HEIC decode attempt failed:', err);
    }

    // 2. Try CSP-safe libheif WASM worker (Chrome, Firefox, Edge)
    try {
        const wasmResult = await tryWasmHeicToJpeg(file, 30000);
        if (wasmResult) return wasmResult;
    } catch (err) {
        console.warn('WASM HEIC conversion attempt failed:', err);
    }

    // 3. Fallback: If under 5MB, pass through original file since server accepts HEIC
    if (file.size <= 5 * 1024 * 1024) {
        console.warn('Passing through original HEIC photo as fallback (≤5MB)');
        return file;
    }

    // 4. File is too large to pass through to server and couldn't be converted
    throw new Error(
        `"${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) could not be converted in this browser. Please open the photo on your device and save/export it as JPG or PNG.`
    );
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

    // If it's still HEIC (passed through under 5MB because browser couldn't convert it),
    // skip canvas recompression since non-Safari browsers cannot decode HEIC on canvas.
    if (isHeicFile(workFile)) {
        return workFile;
    }

    // 2. If it's not an image MIME type and doesn't look like an image, return as-is
    const isImageLike =
        (workFile.type && workFile.type.startsWith('image/')) ||
        /\.(jpe?g|png|webp|gif|bmp|tiff?|avif|svg|ico)$/i.test(workFile.name || '');

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
