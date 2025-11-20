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

        // 1. Find old pages and their photos
        const oldPages = await prisma.birthdayPage.findMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
            include: {
                photos: true,
            },
        });

        if (oldPages.length === 0) {
            return NextResponse.json({ success: true, message: 'No old pages to clean up' });
        }

        // 2. Collect all blob URLs to delete
        const blobUrls = oldPages.flatMap(page => page.photos.map(photo => photo.url));

        // 3. Delete blobs (if any)
        if (blobUrls.length > 0) {
            // Delete in batches of 100 to be safe, though del() handles multiple
            await del(blobUrls);
        }

        // 4. Delete pages from DB (Cascade will delete Photo records)
        const deleteResult = await prisma.birthdayPage.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo,
                },
            },
        });

        return NextResponse.json({
            success: true,
            deletedPages: deleteResult.count,
            deletedBlobs: blobUrls.length
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ success: false, error: 'Cleanup failed' }, { status: 500 });
    }
}
