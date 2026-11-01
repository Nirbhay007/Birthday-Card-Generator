import {
    S3Client,
    PutObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';

function getR2Config() {
    return {
        accountId: process.env.R2_ACCOUNT_ID,
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        bucketName: process.env.R2_BUCKET_NAME || 'birthday-card-assets',
        publicDomain: (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/+$/, ''),
    };
}

// Lazy-initialized S3 client for Cloudflare R2
let r2Client = null;

export function getR2Client() {
    const config = getR2Config();
    if (!r2Client) {
        if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
            throw new Error(
                `Cloudflare R2 environment variables are missing (accountId: ${Boolean(config.accountId)}, accessKeyId: ${Boolean(config.accessKeyId)}, secretAccessKey: ${Boolean(config.secretAccessKey)}).`
            );
        }
        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }
    return r2Client;
}

/**
 * Access the native Cloudflare R2 binding when running inside Cloudflare Workers
 */
async function getNativeR2Bucket() {
    try {
        const { getCloudflareContext } = await import('@opennextjs/cloudflare');
        const ctx = await getCloudflareContext({ async: true });
        if (ctx?.env?.BIRTHDAY_ASSETS) {
            return ctx.env.BIRTHDAY_ASSETS;
        }
    } catch {
        // Not running in Cloudflare Workers or binding not found
    }
    return null;
}

/**
 * True only inside the real Cloudflare Workers runtime.
 *
 * `getCloudflareContext()` also resolves a *local* Miniflare bucket under
 * `next dev`. Uploading there returns a public r2.dev URL for an object that
 * exists only on the developer's machine, so every photo 404s in the browser.
 * Prefer the S3 client whenever we are not actually in workerd and S3
 * credentials exist; keep the binding for Workers and for credential-less QA
 * runs (which must never touch live storage).
 */
function isCloudflareWorkersRuntime() {
    try {
        return typeof navigator !== 'undefined' && /Cloudflare-Workers/i.test(navigator.userAgent || '');
    } catch {
        return false;
    }
}

function shouldUseNativeBinding() {
    const config = getR2Config();
    const hasS3Creds = Boolean(config.accountId && config.accessKeyId && config.secretAccessKey);
    return isCloudflareWorkersRuntime() || !hasS3Creds;
}

/**
 * Upload a buffer or Uint8Array to Cloudflare R2 and return its public URL
 */
export async function uploadFileToR2({ buffer, key, contentType }) {
    const config = getR2Config();
    const publicDomain = config.publicDomain;
    const bucketName = config.bucketName;
    const accountId = config.accountId;

    // Fast path: use native Cloudflare Worker R2 binding (zero network hop, no AWS S3 auth needed)
    try {
        const nativeBucket = shouldUseNativeBinding() ? await getNativeR2Bucket() : null;
        if (nativeBucket) {
            await nativeBucket.put(key, buffer, {
                httpMetadata: {
                    contentType: contentType || 'application/octet-stream',
                },
            });
            const url = publicDomain ? `${publicDomain}/${key}` : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
            return {
                url,
                key,
                bucket: bucketName,
            };
        }
    } catch (nativeErr) {
        console.warn('[R2] Native binding upload failed, trying S3 client fallback:', nativeErr?.message || nativeErr);
    }

    // Fallback: AWS S3 client over HTTPS
    const client = getR2Client();

    await client.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType || 'application/octet-stream',
        })
    );

    const url = publicDomain ? `${publicDomain}/${key}` : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
    return {
        url,
        key,
        bucket: bucketName,
    };
}

/**
 * Delete one or multiple files from Cloudflare R2 by their S3 keys
 */
export async function deleteFilesFromR2(keys) {
    if (!keys || keys.length === 0) return 0;
    const normalizedKeys = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
    if (normalizedKeys.length === 0) return 0;

    // Fast path: native Cloudflare R2 binding
    try {
        const nativeBucket = shouldUseNativeBinding() ? await getNativeR2Bucket() : null;
        if (nativeBucket) {
            await nativeBucket.delete(normalizedKeys);
            return normalizedKeys.length;
        }
    } catch (nativeErr) {
        console.warn('[R2] Native binding delete failed, trying S3 client fallback:', nativeErr?.message || nativeErr);
    }

    const config = getR2Config();
    const client = getR2Client();

    if (normalizedKeys.length === 1) {
        await client.send(
            new DeleteObjectCommand({
                Bucket: config.bucketName,
                Key: normalizedKeys[0],
            })
        );
        return 1;
    }

    // S3 DeleteObjects supports up to 1000 keys per request
    let deletedCount = 0;
    for (let i = 0; i < normalizedKeys.length; i += 1000) {
        const chunk = normalizedKeys.slice(i, i + 1000);
        const res = await client.send(
            new DeleteObjectsCommand({
                Bucket: config.bucketName,
                Delete: {
                    Objects: chunk.map((k) => ({ Key: k })),
                    Quiet: false,
                },
            })
        );
        deletedCount += res.Deleted?.length || chunk.length;
    }

    return deletedCount;
}

/**
 * List files in R2 with an optional prefix
 */
export async function listR2Files({ prefix = '', limit = 1000 } = {}) {
    const config = getR2Config();
    const publicDomain = config.publicDomain;

    // Fast path: native Cloudflare R2 binding
    try {
        const nativeBucket = shouldUseNativeBinding() ? await getNativeR2Bucket() : null;
        if (nativeBucket) {
            const res = await nativeBucket.list({ prefix, limit });
            const objects = res.objects || [];
            return objects.map((item) => ({
                key: item.key,
                size: item.size,
                lastModified: item.uploaded,
                url: publicDomain ? `${publicDomain}/${item.key}` : item.key,
            }));
        }
    } catch (nativeErr) {
        console.warn('[R2] Native binding list failed, trying S3 client fallback:', nativeErr?.message || nativeErr);
    }

    const client = getR2Client();
    const res = await client.send(
        new ListObjectsV2Command({
            Bucket: config.bucketName,
            Prefix: prefix,
            MaxKeys: limit,
        })
    );

    const contents = res.Contents || [];
    return contents.map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: publicDomain ? `${publicDomain}/${item.Key}` : item.Key,
    }));
}

/**
 * Extract S3 key from a full public URL (supports r2.dev, custom domains, or plain keys)
 */
export function getR2KeyFromUrl(url) {
    if (!url) return null;
    try {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            const parsed = new URL(url);
            // remove leading slash
            return parsed.pathname.replace(/^\/+/, '');
        }
        return url;
    } catch {
        return url;
    }
}
