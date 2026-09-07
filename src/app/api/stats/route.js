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

        // Donation funnel (isolated try/catch: stats must keep working even if
        // the SupportEvent table hasn't been migrated yet — then support: null).
        let support = null;
        try {
            const [byEvent, payByAmount, supportByDayRaw] = await Promise.all([
                prisma.supportEvent.groupBy({
                    by: ['event'],
                    _count: { event: true },
                }),
                prisma.supportEvent.groupBy({
                    by: ['amount'],
                    _count: { amount: true },
                    where: { event: 'pay_click', amount: { not: null } },
                    orderBy: { _count: { amount: 'desc' } },
                    take: 10,
                }),
                prisma.$queryRaw`
                    SELECT DATE("createdAt")::text AS day, "event" AS event, COUNT(*)::int AS clicks
                    FROM "SupportEvent"
                    WHERE "createdAt" >= ${since}
                    GROUP BY DATE("createdAt"), "event"
                    ORDER BY day ASC
                `,
            ]);
            const supportJson = JSON.parse(JSON.stringify({ supportByDayRaw }, (_, v) => (typeof v === 'bigint' ? Number(v) : v)));
            const counts = Object.fromEntries(byEvent.map((r) => [r.event, r._count.event]));
            // Revenue truth lives in PremiumOrder (paid rows only). Isolated so
            // a missing table can never break the rest of stats.
            let revenue = { paidOrders: 0, inrPaise: 0, usdCents: 0 };
            try {
                const paid = await prisma.premiumOrder.groupBy({
                    by: ['currency'],
                    _count: { currency: true },
                    _sum: { amount: true },
                    where: { status: 'paid' },
                });
                for (const row of paid) {
                    if (row.currency === 'INR') {
                        revenue.paidOrders += row._count.currency;
                        revenue.inrPaise += row._sum.amount || 0;
                    } else if (row.currency === 'USD') {
                        revenue.paidOrders += row._count.currency;
                        revenue.usdCents += row._sum.amount || 0;
                    }
                }
            } catch {}
            support = {
                modalOpens: counts.modal_open || 0,
                payClicks: counts.pay_click || 0,
                upiCopies: counts.copy_upi || 0,
                // pay_click measures UPI *intent* — UPI provides no success callback.
                payClicksByAmount: payByAmount.map((r) => ({ amount: r.amount, clicks: r._count.amount })),
                last14Days: supportJson.supportByDayRaw,
                revenue,
            };
        } catch (supportError) {
            console.error('Support stats unavailable (pending migration?):', supportError?.message || supportError);
        }

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
            support,
        });
    } catch (error) {
        console.error('Stats error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Stats unavailable' }, { status: 500 });
    }
}
