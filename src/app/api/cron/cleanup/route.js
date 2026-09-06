import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function GET(request) {
    // Security: Verify the request is from Vercel Cron
    // In production, Vercel automatically sets CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Retention policy: pages whose creator opted into the free annual
        // reminder are KEPT (they power next year's reminder loop).
        // Everything else older than 30 days is removed with its photos.
        const staleFilter = {
            createdAt: {
                lt: thirtyDaysAgo,
            },
            reminderEmail: null,
        };

        // 1. Find old pages and their photos
        const oldPages = await prisma.birthdayPage.findMany({
            where: staleFilter,
            include: {
                photos: true,
            },
        });

        const keptPages = await prisma.birthdayPage.count({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo,
                },
                reminderEmail: {
                    not: null,
                },
            },
        });

        if (oldPages.length === 0) {
            return NextResponse.json({ success: true, message: 'No old pages to clean up', keptReminderPages: keptPages });
        }

        // 2. Collect all blob URLs to delete
        const blobUrls = oldPages.flatMap(page => page.photos.map(photo => photo.url));

        // 3. Delete blobs (if any)
        if (blobUrls.length > 0) {
            // Delete in batches of 100 to be safe, though del() handles multiple
            await del(blobUrls);
        }

        // 4. Delete pages from DB (Cascade will delete Photo records)
        // Reminder opt-ins are excluded by staleFilter and survive.
        const deleteResult = await prisma.birthdayPage.deleteMany({
            where: staleFilter,
        });

        return NextResponse.json({
            success: true,
            deletedPages: deleteResult.count,
            deletedBlobs: blobUrls.length,
            keptReminderPages: keptPages
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ success: false, error: 'Cleanup failed' }, { status: 500 });
    }
}
