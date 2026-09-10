import {
    S3Client,
    PutObjectCommand,
    DeleteObjectsCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'birthday-card-assets';
const publicDomain = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/+$/, '');

// Lazy-initialized S3 client for Cloudflare R2
let r2Client = null;

export function getR2Client() {
    if (!r2Client) {
        if (!accountId || !accessKeyId || !secretAccessKey) {
            throw new Error('Cloudflare R2 environment variables are missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).');
        }
        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    return r2Client;
}

/**
 * Upload a buffer or Uint8Array to Cloudflare R2 and return its public URL
 */
export async function uploadFileToR2({ buffer, key, contentType }) {
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
    const client = getR2Client();

    const normalizedKeys = (Array.isArray(keys) ? keys : [keys]).filter(Boolean);
    if (normalizedKeys.length === 0) return 0;

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
