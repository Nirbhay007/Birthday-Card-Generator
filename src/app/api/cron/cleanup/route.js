import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteFilesFromR2, listR2Files, getR2KeyFromUrl } from '@/lib/r2';
import { del } from '@vercel/blob';

export async function GET(request) {
    // Security: Verify request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = Date.now();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

        // 1. Find non-reminder pages created >7 days ago whose birthday was >7 days ago (or created >7 days ago if no date set)
        // that still have photos attached. Belated cards created recently are protected for at least 7 days from creation.
        // We preserve BirthdayPage rows in DB for marketing/retargeting data, but delete photos from storage.
        const expiredPages = await prisma.birthdayPage.findMany({
            where: {
                reminderEmail: null,
                createdAt: { lt: sevenDaysAgo },
                photos: {
                    some: {},
                },
                OR: [
                    { birthdayDate: { lt: sevenDaysAgo } },
                    { birthdayDate: null },
                ],
            },
            include: {
                photos: true,
            },
        });

        let deletedExpiredBlobs = 0;
        const expiredPageIds = expiredPages.map((p) => p.id);
        const expiredPhotoUrls = expiredPages.flatMap((p) => p.photos.map((ph) => ph.url));

        if (expiredPhotoUrls.length > 0) {
            const r2Keys = [];
            const vercelBlobUrls = [];

            for (const url of expiredPhotoUrls) {
                if (url.includes('vercel-storage.com')) {
                    vercelBlobUrls.push(url);
                } else {
                    const key = getR2KeyFromUrl(url);
                    if (key) r2Keys.push(key);
                }
            }

            // Delete from Cloudflare R2
            if (r2Keys.length > 0) {
                try {
                    await deleteFilesFromR2(r2Keys);
                } catch (r2Err) {
                    console.error('R2 expired photo cleanup error:', r2Err);
                }
            }

            // Delete legacy Vercel Blobs if any exist
            if (vercelBlobUrls.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
                try {
                    for (let i = 0; i < vercelBlobUrls.length; i += 100) {
                        const chunk = vercelBlobUrls.slice(i, i + 100);
                        await del(chunk);
                    }
                } catch (vErr) {
                    console.warn('Legacy Vercel Blob delete error:', vErr?.message || vErr);
                }
            }

            deletedExpiredBlobs = expiredPhotoUrls.length;

            // Delete Photo records from DB (page details remain for retargeting)
            await prisma.photo.deleteMany({
                where: {
                    pageId: { in: expiredPageIds },
                },
            });
        }

        // 2. Cleanup orphaned/unlinked uploads in R2 older than 24 hours
        let deletedOrphanedBlobs = 0;
        try {
            const r2Files = await listR2Files({ limit: 1000 });
            if (r2Files && r2Files.length > 0) {
                // Fetch all valid photo URLs currently in the database
                const allActivePhotos = await prisma.photo.findMany({
                    select: { url: true },
                });
                const activeUrls = new Set(allActivePhotos.map((p) => p.url));
                const activeKeys = new Set(allActivePhotos.map((p) => getR2KeyFromUrl(p.url)).filter(Boolean));

                // Find uploads older than 24h not linked to any page
                const orphanedKeys = r2Files
                    .filter((f) => {
                        const uploadedAt = f.lastModified ? new Date(f.lastModified) : new Date(0);
                        const isOldEnough = uploadedAt < twentyFourHoursAgo;
                        const isUpload = f.key?.startsWith('photos/') || f.key?.startsWith('music/');
                        return isOldEnough && isUpload && !activeUrls.has(f.url) && !activeKeys.has(f.key);
                    })
                    .map((f) => f.key);

                if (orphanedKeys.length > 0) {
                    deletedOrphanedBlobs = await deleteFilesFromR2(orphanedKeys);
                }
            }
        } catch (listErr) {
            console.warn('Orphaned R2 list/cleanup skipped:', listErr?.message || listErr);
        }

        // Count pages with reminder email whose photos were preserved
        const keptReminderPages = await prisma.birthdayPage.count({
            where: {
                reminderEmail: { not: null },
                photos: { some: {} },
            },
        });

        return NextResponse.json({
            success: true,
            deletedExpiredPhotoPages: expiredPages.length,
            deletedExpiredBlobs,
            deletedOrphanedBlobs,
            keptReminderPagesWithPhotos: keptReminderPages,
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ success: false, error: 'Cleanup failed' }, { status: 500 });
    }
}
