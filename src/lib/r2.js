import {
    S3Client,
    PutObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';

/**
 * Cloudflare R2 storage, accessed through its S3-compatible API.
 *
 * R2 is deliberately kept for existing media: every card created so far points
 * at an r2.dev object URL, so switching providers would break those pages.
 * New uploads use the same bucket, with Vercel Blob as a fallback (see
 * /api/upload) when R2 is unreachable or credentials are missing.
 *
 * Env is read lazily so a development run without R2 credentials can still
 * boot, and so tests can change env between requests.
 */
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

function publicUrlFor(key) {
    const { accountId, bucketName, publicDomain } = getR2Config();
    return publicDomain
        ? `${publicDomain}/${key}`
        : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Upload a buffer or Uint8Array to Cloudflare R2 and return its public URL
 */
export async function uploadFileToR2({ buffer, key, contentType }) {
    const { bucketName } = getR2Config();
    const client = getR2Client();

    await client.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType || 'application/octet-stream',
        })
    );

    return {
        url: publicUrlFor(key),
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

    const { bucketName } = getR2Config();
    const client = getR2Client();

    if (normalizedKeys.length === 1) {
        await client.send(
            new DeleteObjectCommand({
                Bucket: bucketName,
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
                Bucket: bucketName,
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
    const { bucketName } = getR2Config();
    const client = getR2Client();
    const res = await client.send(
        new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            MaxKeys: limit,
        })
    );

    const contents = res.Contents || [];
    return contents.map((item) => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: publicUrlFor(item.Key),
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
