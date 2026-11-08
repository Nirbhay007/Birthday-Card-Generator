/**
 * Server-side HEIC/HEIF normalization.
 *
 * Browsers without a native HEIC decoder (Chrome, Firefox, older Safari) rely
 * on the client-side libheif build in `imageUtils.js`. That build can still
 * fail on very large phone photos or unusual HEVC variants, so the upload
 * routes use this Node path as a guaranteed fallback. The output is always a
 * downscaled JPEG, which every browser can display.
 */

const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1']);

export function isHeicBuffer(buffer) {
    if (!buffer || buffer.length < 12) return false;

    // ISO-BMFF files start with a `ftyp` box; the major brand follows it.
    if (buffer.toString('ascii', 4, 8) !== 'ftyp') return false;

    const brand = buffer.toString('ascii', 8, 12).toLowerCase();
    return HEIC_BRANDS.has(brand);
}

export async function convertHeicBufferToJpeg(buffer, { maxDim = 1600, quality = 0.82 } = {}) {
    // Lazy-load both decoders: normal JPEG/PNG uploads never pay for them.
    const [{ default: decode }, { default: sharp }] = await Promise.all([
        import('heic-decode'),
        import('sharp'),
    ]);

    const { width, height, data } = await decode({ buffer });

    if (!width || !height || !data?.length) {
        throw new Error('The HEIC decoder returned no image data.');
    }

    const pixels = Buffer.from(data.buffer, data.byteOffset, data.byteLength);

    return sharp(pixels, { raw: { width, height, channels: 4 } })
        .flatten({ background: '#ffffff' })
        .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: Math.round(quality * 100), mozjpeg: true })
        .toBuffer();
}
