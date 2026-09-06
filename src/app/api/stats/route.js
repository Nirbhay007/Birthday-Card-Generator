import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Private growth dashboard (READ-ONLY — zero writes, zero schema changes).
 * Usage: GET /api/stats?token=YOUR_STATS_TOKEN
 * Set STATS_TOKEN in .env / Vercel env. Unset token = endpoint disabled (404).
 */
export const dynamic = 'force-dynamic';

function authorized(provided, expected) {
    if (!expected || !provided) return false;
    if (provided.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < provided.length; i++) {
        diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
}

export async function GET(request) {
    const expected = process.env.STATS_TOKEN;
    const { searchParams } = new URL(request.url);
    if (!authorized(searchParams.get('token') || '', expected || '')) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    try {
        const since = new Date(Date.now() - 14 * 24 * 3600 * 1000);

        const [pages, photos, sums, reminders, perDay, byTheme, byRelationship, byMusic, bySource] = await Promise.all([
            prisma.birthdayPage.count(),
            prisma.photo.count(),
            prisma.birthdayPage.aggregate({
                _sum: { viewCount: true, loves: true, shares: true },
            }),
            prisma.birthdayPage.count({ where: { reminderEmail: { not: null } } }),
            prisma.$queryRaw`
                SELECT DATE("createdAt")::text AS day, COUNT(*)::int AS pages,
                       COALESCE(SUM("viewCount"), 0)::int AS views
                FROM "BirthdayPage"
                WHERE "createdAt" >= ${since}
                GROUP BY DATE("createdAt")
                ORDER BY day ASC
            `,
            prisma.birthdayPage.groupBy({
                by: ['theme'],
                _count: { theme: true },
                orderBy: { _count: { theme: 'desc' } },
                take: 8,
            }),
            prisma.birthdayPage.groupBy({
                by: ['relationship'],
                _count: { relationship: true },
                orderBy: { _count: { relationship: 'desc' } },
                take: 8,
            }),
            prisma.birthdayPage.groupBy({
                by: ['music'],
                _count: { music: true },
                orderBy: { _count: { music: 'desc' } },
                take: 8,
            }),
            prisma.birthdayPage.groupBy({
                by: ['source'],
                _count: { source: true },
                orderBy: { _count: { source: 'desc' } },
                take: 12,
            }),
        ]);

        // BigInt-safe serialization (counts can exceed Number range in theory)
        const json = JSON.parse(JSON.stringify({ perDay }, (_, v) => (typeof v === 'bigint' ? Number(v) : v)));

        return NextResponse.json({
            success: true,
            generatedAt: new Date().toISOString(),
            totals: {
                pages,
                photos,
                avgPhotosPerPage: pages ? +(photos / pages).toFixed(2) : 0,
                views: sums._sum.viewCount || 0,
                loves: sums._sum.loves || 0,
                shares: sums._sum.shares || 0,
                reminderOptIns: reminders,
                reminderRate: pages ? +((reminders / pages) * 100).toFixed(1) : 0,
            },
            last14Days: json.perDay,
            topThemes: byTheme.map((t) => ({ theme: t.theme, pages: t._count.theme })),
            topRelationships: byRelationship
                .filter((r) => r.relationship)
                .map((r) => ({ relationship: r.relationship, pages: r._count.relationship })),
            topMusic: byMusic
                .filter((m) => m.music)
                .map((m) => ({ music: m.music, pages: m._count.music })),
            creationsBySource: bySource
                .filter((s) => s.source)
                .map((s) => ({ source: s.source, pages: s._count.source })),
        });
    } catch (error) {
        console.error('Stats error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Stats unavailable' }, { status: 500 });
    }
}
