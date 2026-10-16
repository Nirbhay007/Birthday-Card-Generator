#!/usr/bin/env node

/**
 * Birthday Generator Analytics CLI
 * 
 * Provides end-to-end operational insights:
 *  - Daily card creation and engagement trends (Today vs. Past N days)
 *  - Media and photo attach rates + storage provider health (R2 vs Blob)
 *  - Premium purchase intent vs paid conversion funnel + revenue
 *  - Support/tip funnel interactions
 *  - Today's hourly pulse and traffic sources
 * 
 * Usage:
 *   node scripts/analytics.js
 *   pnpm analytics
 *   node scripts/analytics.js --days 14
 *   node scripts/analytics.js --json
 */

const fs = require('fs');
const path = require('path');

// 1. Auto-load .env if not already populated
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const eq = line.indexOf('=');
        if (eq > 0) {
            const key = line.slice(0, eq).trim();
            let val = line.slice(eq + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    });
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Parse CLI flags
const args = process.argv.slice(2);
const daysArgIdx = args.indexOf('--days');
const DAYS = daysArgIdx !== -1 && args[daysArgIdx + 1] ? parseInt(args[daysArgIdx + 1], 10) : 8;
const OUTPUT_JSON = args.includes('--json');

const LOCAL_IPS = ['::1', '127.0.0.1', 'localhost'];

function formatIST(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return new Date(d.getTime() + 5.5 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' IST';
}

function formatCurrency(amountPaise, currency = 'INR') {
    if (currency === 'INR') {
        return `₹${(amountPaise / 100).toFixed(0)}`;
    }
    return `$${(amountPaise / 100).toFixed(2)}`;
}

async function run() {
    try {
        const now = new Date();
        const currentIST = formatIST(now);

        // 1. Daily Card Creation & Engagement Metrics
        const dailyCardStats = await prisma.$queryRaw`
            SELECT 
                TO_CHAR(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD (Dy)') AS date_ist,
                COUNT(*)::int AS cards_created,
                COUNT(DISTINCT "ipAddress")::int AS unique_creators,
                COALESCE(SUM("viewCount"), 0)::int AS views,
                COALESCE(SUM("loves"), 0)::int AS loves,
                COALESCE(SUM("shares"), 0)::int AS shares,
                COUNT(CASE WHEN "isVip" = true OR "isVipPro" = true THEN 1 END)::int AS vip_cards
            FROM "BirthdayPage"
            WHERE ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - (${DAYS}::text || ' days')::interval
              AND ("ipAddress" IS NULL OR "ipAddress" NOT IN ('::1', '127.0.0.1', 'localhost'))
            GROUP BY date_ist
            ORDER BY date_ist DESC
        `;

        // 2. Daily Photos Attached
        const dailyPhotoStats = await prisma.$queryRaw`
            SELECT 
                TO_CHAR((bp."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD (Dy)') AS date_ist,
                COUNT(DISTINCT bp.id)::int AS total_cards,
                COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN bp.id END)::int AS cards_with_photos,
                COUNT(p.id)::int AS total_photos
            FROM "BirthdayPage" bp
            LEFT JOIN "Photo" p ON p."pageId" = bp.id
            WHERE (bp."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - (${DAYS}::text || ' days')::interval
              AND (bp."ipAddress" IS NULL OR bp."ipAddress" NOT IN ('::1', '127.0.0.1', 'localhost'))
            GROUP BY date_ist
            ORDER BY date_ist DESC
        `;

        const photoMap = new Map();
        dailyPhotoStats.forEach((r) => photoMap.set(r.date_ist, r));

        // 3. Premium Orders & Intent by Day
        const dailyPremiumOrders = await prisma.$queryRaw`
            SELECT 
                TO_CHAR(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD (Dy)') AS date_ist,
                COUNT(*)::int AS intent_orders,
                COUNT(CASE WHEN "status" = 'paid' THEN 1 END)::int AS paid_orders,
                COUNT(CASE WHEN "status" = 'failed' THEN 1 END)::int AS failed_orders,
                COUNT(CASE WHEN "tier" = 'universe' THEN 1 END)::int AS universe_intent,
                COUNT(CASE WHEN "tier" = 'card_vip' THEN 1 END)::int AS vip_intent,
                COALESCE(SUM(CASE WHEN "status" = 'paid' AND "currency" = 'INR' THEN "amount" ELSE 0 END), 0)::bigint AS inr_revenue_paise,
                COALESCE(SUM(CASE WHEN "status" = 'paid' AND "currency" = 'USD' THEN "amount" ELSE 0 END), 0)::bigint AS usd_revenue_cents
            FROM "PremiumOrder"
            WHERE ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - (${DAYS}::text || ' days')::interval
            GROUP BY date_ist
            ORDER BY date_ist DESC
        `;

        const premiumMap = new Map();
        dailyPremiumOrders.forEach((r) => premiumMap.set(r.date_ist, r));

        // Combined Daily Table
        const combinedDaily = dailyCardStats.map((c) => {
            const p = photoMap.get(c.date_ist) || { cards_with_photos: 0, total_photos: 0 };
            const prem = premiumMap.get(c.date_ist) || {
                intent_orders: 0,
                paid_orders: 0,
                inr_revenue_paise: 0n,
                usd_revenue_cents: 0n,
            };

            const attachPct = c.cards_created > 0 ? ((p.cards_with_photos / c.cards_created) * 100).toFixed(0) + '%' : '0%';
            const convPct = prem.intent_orders > 0 ? ((prem.paid_orders / prem.intent_orders) * 100).toFixed(0) + '%' : '0%';
            const inrRevenue = `₹${(Number(prem.inr_revenue_paise) / 100).toFixed(0)}`;

            return {
                Date: c.date_ist,
                Cards: c.cards_created,
                Creators: c.unique_creators,
                'Photos Attach': `${p.cards_with_photos}/${c.cards_created} (${attachPct})`,
                Photos: p.total_photos,
                Views: c.views,
                Loves: c.loves,
                Shares: c.shares,
                'Prem Intent': prem.intent_orders,
                'Prem Paid': `${prem.paid_orders} (${convPct})`,
                Revenue: inrRevenue,
            };
        });

        // 4. Today's Hourly Breakdown (IST)
        const todayHourly = await prisma.$queryRaw`
            SELECT 
                TO_CHAR(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata', 'HH24:00') AS hour_ist,
                COUNT(*)::int AS cards_created,
                COALESCE(SUM("viewCount"), 0)::int AS views
            FROM "BirthdayPage"
            WHERE (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata')::date = (NOW() AT TIME ZONE 'Asia/Kolkata')::date
              AND ("ipAddress" IS NULL OR "ipAddress" NOT IN ('::1', '127.0.0.1', 'localhost'))
            GROUP BY hour_ist
            ORDER BY hour_ist ASC
        `;

        // 5. Today's Detailed Photo & Storage Health
        const todayStart = new Date(now.getTime() - ((now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()) * 1000);
        // Better UTC start for IST:
        const istMidnightUtc = new Date();
        istMidnightUtc.setUTCHours(18, 30, 0, 0); // 18:30 UTC previous day = 00:00 IST today
        if (now.getUTCHours() < 18 || (now.getUTCHours() === 18 && now.getUTCMinutes() < 30)) {
            istMidnightUtc.setUTCDate(istMidnightUtc.getUTCDate() - 1);
        }

        const todayCards = await prisma.birthdayPage.findMany({
            where: {
                createdAt: { gte: istMidnightUtc },
                ipAddress: { notIn: LOCAL_IPS },
            },
            include: { photos: true },
        });

        const allTodayUrls = todayCards.flatMap((c) => c.photos.map((ph) => ph.url));
        const r2Photos = allTodayUrls.filter((u) => u.includes('r2.dev') || u.includes('r2.cloudflarestorage')).length;
        const blobPhotos = allTodayUrls.filter((u) => u.includes('blob.vercel-storage') || u.includes('vercel-storage')).length;
        const otherPhotos = allTodayUrls.length - r2Photos - blobPhotos;

        // 6. Recent Premium Orders (Last 5 with details)
        const recentOrders = await prisma.premiumOrder.findMany({
            take: 6,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                createdAt: true,
                status: true,
                tier: true,
                amount: true,
                currency: true,
                buyerContact: true,
                snapshotUrl: true,
                paidAt: true,
            },
        });

        // 7. Support Funnel Events (Past 7 days)
        const supportEvents = await prisma.$queryRaw`
            SELECT 
                "event",
                COUNT(*)::int AS count,
                COUNT(CASE WHEN ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date THEN 1 END)::int AS today_count
            FROM "SupportEvent"
            WHERE ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '7 days'
            GROUP BY "event"
            ORDER BY count DESC
        `;

        // 8. Top Themes Today & Past 7 Days
        const topThemes = await prisma.$queryRaw`
            SELECT 
                "theme",
                COUNT(*)::int AS past_week_cards,
                COUNT(CASE WHEN ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date THEN 1 END)::int AS today_cards
            FROM "BirthdayPage"
            WHERE ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata' >= (NOW() AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '7 days'
              AND ("ipAddress" IS NULL OR "ipAddress" NOT IN ('::1', '127.0.0.1', 'localhost'))
            GROUP BY "theme"
            ORDER BY past_week_cards DESC
        `;

        if (OUTPUT_JSON) {
            console.log(
                JSON.stringify(
                    {
                        generatedAt: currentIST,
                        daily: combinedDaily,
                        todayHourly,
                        storage: { total: allTodayUrls.length, r2: r2Photos, blob: blobPhotos, other: otherPhotos },
                        recentOrders,
                        supportEvents,
                        topThemes,
                    },
                    null,
                    2
                )
            );
            return;
        }

        // ================= PRETTY CLI OUTPUT =================
        console.log('\n========================================================================================');
        console.log(`🎂 BIRTHDAY GENERATOR — OPERATIONAL & REVENUE ANALYTICS`);
        console.log(`📅 Current IST: ${currentIST} | Range: Past ${DAYS} Days`);
        console.log('========================================================================================\n');

        console.log('📊 1. DAILY CREATION, ENGAGEMENT & MONETIZATION FUNNEL (IST)');
        console.table(combinedDaily);

        console.log('⚡ 2. TODAY\'S HOURLY ACTIVITY (OCT 13 IST)');
        if (todayHourly.length > 0) {
            console.table(todayHourly);
        } else {
            console.log('No cards recorded yet today.\n');
        }

        console.log('🖼️ 3. MEDIA & STORAGE HEALTH (TODAY)');
        const todayTotalCards = todayCards.length;
        const todayCardsWithPhotos = todayCards.filter((c) => c.photos.length > 0).length;
        const todayPhotoCount = allTodayUrls.length;
        console.log(` • Cards Created Today:  ${todayTotalCards}`);
        console.log(
            ` • Photo Attach Rate:    ${todayCardsWithPhotos}/${todayTotalCards} (${todayTotalCards ? ((todayCardsWithPhotos / todayTotalCards) * 100).toFixed(1) : 0}%)`
        );
        console.log(` • Total Photos Uploaded: ${todayPhotoCount}`);
        console.log(` • Storage Target:       Cloudflare R2 = ${r2Photos} | Vercel Blob = ${blobPhotos} | Other = ${otherPhotos}`);
        console.log(` • Storage Status:       ${blobPhotos === 0 && otherPhotos === 0 ? '🟢 100% Direct R2 (Optimal)' : '🟡 Fallback Active'}\n`);

        console.log('💎 4. PREMIUM INTENT & RECENT CHECKOUTS');
        const formattedOrders = recentOrders.map((o) => {
            let targetName = 'N/A';
            if (o.snapshotUrl) {
                try {
                    const u = new URL(o.snapshotUrl);
                    targetName = u.searchParams.get('to') || 'Custom Cinema';
                } catch {
                    targetName = 'Cinema Link';
                }
            }
            return {
                Time: formatIST(o.createdAt),
                Status: o.status === 'paid' ? '✅ PAID' : o.status === 'created' ? '⏳ INTENT' : '❌ FAILED',
                Tier: o.tier || 'universe',
                Amount: formatCurrency(o.amount, o.currency),
                Buyer: o.buyerContact || 'Anonymous',
                Target: targetName,
            };
        });
        console.table(formattedOrders);

        console.log('💖 5. SUPPORT & DONATION FUNNEL (PAST 7 DAYS)');
        console.table(supportEvents);

        console.log('🎨 6. THEME POPULARITY');
        console.table(topThemes);

        console.log('========================================================================================\n');
    } catch (err) {
        console.error('Error generating analytics report:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
