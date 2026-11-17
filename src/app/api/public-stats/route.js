import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Public, read-only BirthdayGen aggregates for the portfolio and media kit.
 *
 * Deliberately narrow: no PII, no buyer data, no revenue, no support funnel,
 * no raw referrer/UTM strings. Local/test cards are excluded so the public
 * numbers describe real usage.
 *
 * Caching:
 * - 60s in-isolate memory cache absorbs bursts and keeps DB load flat.
 * - Cache-Control lets a CDN hold the aggregate for 5 minutes and serve stale
 *   data while it revalidates. The generatedAt field always describes the
 *   payload's true age.
 */

export const dynamic = 'force-dynamic';

const MEMORY_TTL_MS = 60 * 1000;
const CACHE_CONTROL =
    'public, max-age=60, s-maxage=300, stale-while-revalidate=3600, stale-if-error=86400';

const LOCAL_IPS_SQL = `("ipAddress" IS NULL OR "ipAddress" NOT IN ('::1', '127.0.0.1', 'localhost'))`;

let cached = { payload: null, expiresAt: 0 };
let inFlight = null;

function respond(payload, cacheStatus) {
    return NextResponse.json(payload, {
        headers: {
            'Cache-Control': CACHE_CONTROL,
            'X-Robots-Tag': 'noindex',
            'X-Stats-Cache': cacheStatus,
        },
    });
}

async function buildPayload() {
    // One round trip for every BirthdayPage aggregate. The ShareEvent count is
    // separate so a pending/missing migration cannot take down the endpoint;
    // in that case we fall back to the legacy lifetime counter.
    const [mainRows, shareRows] = await Promise.all([
        prisma.$queryRaw`
            WITH params AS (
                SELECT date_trunc('day', NOW() AT TIME ZONE 'Asia/Kolkata') AS today_ist
            ),
            base AS (
                SELECT
                    bp.id,
                    bp."ipAddress",
                    bp."theme",
                    bp."source",
                    bp."viewCount",
                    bp."loves",
                    bp."shares",
                    (bp."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' AS ist_created
                FROM "BirthdayPage" bp
                WHERE ("ipAddress" IS NULL OR "ipAddress" NOT IN ('::1', '127.0.0.1', 'localhost'))
            ),
            lifetime AS (
                SELECT
                    COUNT(*)::int AS cards,
                    COUNT(DISTINCT "ipAddress")::int AS creators,
                    COALESCE(SUM("viewCount"), 0)::int AS views,
                    COALESCE(SUM("loves"), 0)::int AS loves,
                    COALESCE(SUM("shares"), 0)::int AS legacy_shares
                FROM base
            ),
            windows AS (
                SELECT
                    COUNT(*) FILTER (
                        WHERE ist_created >= today_ist - INTERVAL '29 days'
                    )::int AS last30_cards,
                    COUNT(DISTINCT "ipAddress") FILTER (
                        WHERE ist_created >= today_ist - INTERVAL '29 days'
                    )::int AS last30_creators,
                    COALESCE(SUM("viewCount") FILTER (
                        WHERE ist_created >= today_ist - INTERVAL '29 days'
                    ), 0)::int AS last30_views,
                    COALESCE(SUM("loves") FILTER (
                        WHERE ist_created >= today_ist - INTERVAL '29 days'
                    ), 0)::int AS last30_loves,
                    COUNT(*) FILTER (
                        WHERE ist_created >= today_ist - INTERVAL '59 days'
                          AND ist_created < today_ist - INTERVAL '29 days'
                    )::int AS prev30_cards,
                    COUNT(DISTINCT "ipAddress") FILTER (
                        WHERE ist_created >= today_ist - INTERVAL '59 days'
                          AND ist_created < today_ist - INTERVAL '29 days'
                    )::int AS prev30_creators
                FROM base, params
            ),
            days AS (
                SELECT generate_series(
                    today_ist - INTERVAL '29 days',
                    today_ist,
                    INTERVAL '1 day'
                )::date AS day
                FROM params
            ),
            daily AS (
                SELECT
                    TO_CHAR(d.day, 'YYYY-MM-DD') AS day,
                    COUNT(bp.id)::int AS cards,
                    COUNT(DISTINCT bp."ipAddress")::int AS creators,
                    COALESCE(SUM(bp."viewCount"), 0)::int AS views,
                    COALESCE(SUM(bp."loves"), 0)::int AS loves
                FROM days d
                LEFT JOIN base bp ON bp.ist_created::date = d.day
                GROUP BY d.day
                ORDER BY d.day
            ),
            themes AS (
                SELECT "theme", COUNT(*)::int AS cards
                FROM base
                WHERE "theme" IS NOT NULL
                GROUP BY "theme"
                ORDER BY cards DESC
                LIMIT 8
            ),
            sources AS (
                SELECT
                    CASE
                        WHEN "source" LIKE 'wishes/%' THEN 'Birthday wish pages'
                        WHEN "source" = 'utm:recipient' THEN 'Recipient referrals'
                        WHEN "source" LIKE '%googlequicksearchbox%' THEN 'Android search'
                        WHEN "source" LIKE '%gemini.google.com%' THEN 'Gemini'
                        WHEN "source" LIKE '%chatgpt.com%' THEN 'ChatGPT'
                        WHEN "source" LIKE 'ref:google.%' THEN 'Google Search'
                        ELSE 'Other tracked'
                    END AS label,
                    COUNT(*)::int AS cards
                FROM base
                WHERE "source" IS NOT NULL AND "source" <> ''
                GROUP BY label
                ORDER BY cards DESC
                LIMIT 8
            ),
            photos AS (
                SELECT COUNT(*)::int AS photos
                FROM "Photo" p
                JOIN base bp ON bp.id = p."pageId"
            ),
            paid AS (
                SELECT COUNT(*)::int AS paid_upgrades
                FROM "PremiumOrder"
                WHERE status = 'paid'
            )
            SELECT
                (SELECT json_build_object(
                    'cards', cards,
                    'creators', creators,
                    'views', views,
                    'loves', loves,
                    'legacyShares', legacy_shares
                ) FROM lifetime) AS lifetime,
                (SELECT json_build_object(
                    'last30Cards', last30_cards,
                    'last30Creators', last30_creators,
                    'last30Views', last30_views,
                    'last30Loves', last30_loves,
                    'prev30Cards', prev30_cards,
                    'prev30Creators', prev30_creators
                ) FROM windows) AS windows,
                (SELECT json_agg(daily) FROM daily) AS daily,
                (SELECT json_agg(themes) FROM themes) AS themes,
                (SELECT json_agg(sources) FROM sources) AS sources,
                (SELECT photos FROM photos) AS photos,
                (SELECT paid_upgrades FROM paid) AS paid_upgrades
        `,
        prisma.$queryRaw`
            SELECT COUNT(*)::int AS shares
            FROM "ShareEvent" se
            JOIN "BirthdayPage" bp ON bp.id = se."pageId"
            WHERE (bp."ipAddress" IS NULL OR bp."ipAddress" NOT IN ('::1', '127.0.0.1', 'localhost'))
        `.catch((error) => {
            console.error('Public stats: ShareEvent unavailable:', error?.message || error);
            return null;
        }),
    ]);

    const main = mainRows[0];
    if (!main?.lifetime || !main?.windows) {
        throw new Error('Public stats query returned no aggregate row');
    }

    const lifetime = main.lifetime;
    const windows = main.windows;
    const trackedShares = shareRows?.[0]?.shares ?? null;
    const shares = trackedShares ?? lifetime.legacyShares ?? 0;
    const cardsPerDay = Math.round((windows.last30Cards || 0) / 30);
    const creatorsPerDay = Math.round((windows.last30Creators || 0) / 30);

    return {
        success: true,
        generatedAt: new Date().toISOString(),
        definitions: {
            cards: 'Birthday pages created, excluding local/test IPs.',
            creators:
                'Distinct creator IPs. Lifetime is deduplicated across all time; 30-day windows within the window; daily counts within that day.',
            views: 'Card page views.',
            loves: 'Card love reactions.',
            shares: 'Deduplicated share events (legacy counter only if ShareEvent is unavailable).',
            photos: 'Photos uploaded to non-test cards.',
            paidUpgrades: 'Paid premium orders, all time.',
            sources:
                'Normalized tracked acquisition source. Untagged traffic is excluded and raw referrer/UTM values are never returned.',
        },
        totals: {
            cards: lifetime.cards || 0,
            creators: lifetime.creators || 0,
            views: lifetime.views || 0,
            loves: lifetime.loves || 0,
            shares,
            photos: main.photos || 0,
            paidUpgrades: main.paid_upgrades || 0,
        },
        last30Days: {
            cards: windows.last30Cards || 0,
            creators: windows.last30Creators || 0,
            views: windows.last30Views || 0,
            loves: windows.last30Loves || 0,
            cardsPerDay,
            creatorsPerDay,
        },
        previous30Days: {
            cards: windows.prev30Cards || 0,
            creators: windows.prev30Creators || 0,
        },
        daily: main.daily || [],
        themes: main.themes || [],
        sources: main.sources || [],
    };
}

export async function GET() {
    const now = Date.now();
    if (cached.payload && cached.expiresAt > now) {
        return respond(cached.payload, 'HIT');
    }

    if (!inFlight) {
        inFlight = buildPayload()
            .then((payload) => {
                cached = {
                    payload,
                    expiresAt: Date.now() + MEMORY_TTL_MS,
                };
                return payload;
            })
            .finally(() => {
                inFlight = null;
            });
    }

    try {
        const payload = await inFlight;
        return respond(payload, 'MISS');
    } catch (error) {
        console.error('Public stats error:', error?.message || error);
        return NextResponse.json(
            { success: false, error: 'Stats unavailable' },
            {
                status: 503,
                headers: {
                    'Cache-Control': 'no-store',
                    'X-Robots-Tag': 'noindex',
                },
            }
        );
    }
}
