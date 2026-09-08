import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { del, list } from '@vercel/blob';

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
        // We preserve BirthdayPage rows in DB for marketing/retargeting data, but delete photos from Blob storage.
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
            // Delete blobs in chunks of 100
            for (let i = 0; i < expiredPhotoUrls.length; i += 100) {
                const chunk = expiredPhotoUrls.slice(i, i + 100);
                await del(chunk);
            }
            deletedExpiredBlobs = expiredPhotoUrls.length;

            // Delete Photo records from DB (page details remain for retargeting)
            await prisma.photo.deleteMany({
                where: {
                    pageId: { in: expiredPageIds },
                },
            });
        }

        // 2. Cleanup orphaned/unlinked uploads older than 24 hours
        let deletedOrphanedBlobs = 0;
        try {
            // Get up to 1000 blobs in the store (uses only 1 list operation)
            const listResult = await list({ limit: 1000 });
            if (listResult && Array.isArray(listResult.blobs) && listResult.blobs.length > 0) {
                // Fetch all valid photo URLs currently in the database
                const allActivePhotos = await prisma.photo.findMany({
                    select: { url: true },
                });
                const activeUrls = new Set(allActivePhotos.map((p) => p.url));

                // Find blobs uploaded >24h ago that are not linked to any page
                // (24h grace period ensures active card drafts aren't affected)
                const orphanedUrls = listResult.blobs
                    .filter((b) => {
                        const uploadedAt = b.uploadedAt ? new Date(b.uploadedAt) : new Date(0);
                        const isOldEnough = uploadedAt < twentyFourHoursAgo;
                        // Avoid deleting preset assets or custom audio if active
                        const isImageOrUpload = b.pathname?.startsWith('photos/') || !b.pathname?.includes('asset');
                        return isOldEnough && isImageOrUpload && !activeUrls.has(b.url);
                    })
                    .map((b) => b.url);

                if (orphanedUrls.length > 0) {
                    for (let i = 0; i < orphanedUrls.length; i += 100) {
                        const chunk = orphanedUrls.slice(i, i + 100);
                        await del(chunk);
                    }
                    deletedOrphanedBlobs = orphanedUrls.length;
                }
            }
        } catch (listErr) {
            console.warn('Orphaned blob list/cleanup skipped:', listErr?.message || listErr);
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
