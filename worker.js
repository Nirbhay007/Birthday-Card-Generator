export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
import openNextWorker from "./.open-next/worker.js";

const CRON_ROUTES = {
    "*/5 * * * *": "/api/cron/delivery",
    "0 * * * *": "/api/cron/recovery",
    "0 4 * * *": "/api/cron/cleanup",
    "0 5 * * *": "/api/cron/reminders",
};

/**
 * Card pages embed VIP / unlock state, so an edge copy must not outlive the
 * moment a card is upgraded. Other routes keep whatever Next.js decided.
 * Purging only reaches the current colo, so this TTL is the cross-colo
 * safety net.
 */
const CARD_EDGE_TTL_SECONDS = 60;
const CACHE_VERSION = "bgen_20261103_v2";

/**
 * Builds a unique cache key Request URL distinguishing standard HTML document requests
 * from Next.js RSC (React Server Component) payloads.
 */
function getCacheKey(request) {
    const url = new URL(request.url);
    const isRsc = request.headers.get("rsc") === "1" ||
                  request.headers.get("next-router-prefetch") === "1" ||
                  url.searchParams.has("_rsc");

    if (isRsc && !url.searchParams.has("__cf_rsc")) {
        url.searchParams.set("__cf_rsc", "1");
    }
    // Namespace edge cache by deployment version so HTML chunk hashes never mismatch after deploy
    url.searchParams.set("__cf_v", CACHE_VERSION);

    return new Request(url.toString(), {
        method: "GET",
        headers: request.headers,
    });
}

/**
 * Purges edge cache for a card ID across both HTML and RSC representations.
 */
function purgeCardCache(id, origin, cache) {
    if (!id || !origin) return Promise.resolve();
    const targets = [
        `${origin}/b/${id}`,
        `${origin}/b/${id}?__cf_v=${CACHE_VERSION}`,
        `${origin}/b/${id}?__cf_rsc=1`,
        `${origin}/b/${id}?__cf_rsc=1&__cf_v=${CACHE_VERSION}`,
        `${origin}/b/${id}?created=1`,
        `${origin}/b/${id}?created=1&__cf_v=${CACHE_VERSION}`,
        `${origin}/b/${id}?created=1&__cf_rsc=1`,
        `${origin}/b/${id}?created=1&__cf_rsc=1&__cf_v=${CACHE_VERSION}`,
        `${origin}/b/${id}?vip=1`,
        `${origin}/b/${id}?vip=1&__cf_v=${CACHE_VERSION}`,
        `${origin}/b/${id}?vip=1&__cf_rsc=1`,
        `${origin}/b/${id}?vip=1&__cf_rsc=1&__cf_v=${CACHE_VERSION}`,
    ];
    return Promise.all(targets.map((target) => cache.delete(target).catch(() => {})));
}

/**
 * /api/premium/verify answers with the card it just upgraded (`pageId`).
 */
async function purgeFromVerifyResponse(response, origin, cache) {
    try {
        const data = await response.json();
        const pageId = typeof data?.pageId === "string" ? data.pageId : "";
        await purgeCardCache(pageId, origin, cache);
    } catch {
        // Ignore malformed payloads — a missed purge only means a stale preview.
    }
}

/**
 * The Razorpay webhook replies `{ ok: true }` and carries the card id in the
 * payment notes, so the id has to come from the (cloned) request body.
 * `revalidatePath()` is a no-op here because OpenNext's tag cache is not
 * configured, which is why the purge is done explicitly.
 */
async function purgeFromWebhookBody(body, origin, cache) {
    try {
        const payload = await body.json();
        const payment = payload?.payload?.payment?.entity || {};
        const pageId = typeof payment?.notes?.pageId === "string"
            ? payment.notes.pageId.trim().slice(0, 60)
            : "";
        await purgeCardCache(pageId, origin, cache);
    } catch {
        // Ignore malformed payloads.
    }
}

/**
 * Stores a copy with a shorter TTL than the response the client receives.
 */
function withEdgeTtl(response, seconds) {
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", `public, s-maxage=${seconds}, stale-while-revalidate=300`);
    headers.delete("Set-Cookie");
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

const worker = {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const cache = caches.default;

        // 1. Cron / internal worker triggers bypass cache
        if (request.headers.get("User-Agent") === "Cloudflare-Worker-Cron/1.0") {
            return openNextWorker.fetch(request, env, ctx);
        }

        const isGet = request.method === "GET";
        const isApi = url.pathname.startsWith("/api/");
        const isBypass = request.headers.has("Authorization") ||
                         request.headers.has("x-prerender-revalidate") ||
                         request.headers.has("x-isr") ||
                         request.headers.get("cache-control")?.includes("no-cache") ||
                         url.searchParams.has("vip") ||
                         url.searchParams.has("fresh");

        // Razorpay webhooks can mark a card VIP without the client ever calling
        // /api/premium/verify. Clone before Next.js consumes the body.
        const webhookBody = !isGet && url.pathname === "/api/premium/webhook"
            ? request.clone()
            : null;

        // 2. Check Cloudflare Edge Cache for GET requests (excluding API mutations and auth)
        if (isGet && !isBypass && !isApi) {
            try {
                const cacheKey = getCacheKey(request);
                const cached = await cache.match(cacheKey);
                if (cached) {
                    const response = new Response(cached.body, cached);
                    response.headers.set("cf-worker-cache", "HIT");
                    return response;
                }
            } catch (e) {
                // Ignore cache match error and proceed to worker
            }
        }

        // 3. Delegate to OpenNext Next.js handler
        const response = await openNextWorker.fetch(request, env, ctx);

        // 4. Invalidate edge cache on card updates / verification
        if (!isGet && isApi && response.status >= 200 && response.status < 300) {
            const bMatch = url.pathname.match(/^\/api\/birthday\/([a-zA-Z0-9_-]+)/);
            if (bMatch) {
                ctx.waitUntil(purgeCardCache(bMatch[1], url.origin, cache));
            } else if (url.pathname === "/api/premium/verify") {
                ctx.waitUntil(purgeFromVerifyResponse(response.clone(), url.origin, cache));
            } else if (webhookBody) {
                ctx.waitUntil(purgeFromWebhookBody(webhookBody, url.origin, cache));
            }
        }

        // 5. Cache eligible card responses in Cloudflare Edge Cache
        if (isGet && !isBypass && !isApi && response.status === 200 && url.pathname.startsWith("/b/")) {
            if (url.searchParams.has("vip") || url.searchParams.has("fresh")) {
                return response;
            }
            const cacheControl = response.headers.get("Cache-Control") || "";
            const isCacheable = (cacheControl.includes("s-maxage") || cacheControl.includes("max-age")) &&
                                !cacheControl.includes("no-store") &&
                                !cacheControl.includes("private") &&
                                !response.headers.has("Set-Cookie");

            if (isCacheable) {
                const cacheKey = getCacheKey(request);
                const cached = response.clone();
                const edgeResponse = withEdgeTtl(cached, CARD_EDGE_TTL_SECONDS);
                ctx.waitUntil(cache.put(cacheKey, edgeResponse).catch(() => {}));
            }
        }

        return response;
    },

    async scheduled(event, env, ctx) {
        const route = CRON_ROUTES[event.cron];
        if (!route) {
            console.warn(`[Cron] Unrecognized cron schedule: ${event.cron}`);
            return;
        }

        const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://birthday.nirbhay.online";
        const cronSecret = env.CRON_SECRET || "";
        const url = `${siteUrl}${route}`;

        console.log(`[Cron Trigger] Firing ${event.cron} -> ${route}`);

        const request = new Request(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${cronSecret}`,
                "User-Agent": "Cloudflare-Worker-Cron/1.0",
            },
        });

        ctx.waitUntil(
            openNextWorker.fetch(request, env, ctx).then(async (response) => {
                const text = await response.text();
                console.log(`[Cron Complete] ${route} -> Status ${response.status}: ${text.slice(0, 200)}`);
            }).catch((err) => {
                console.error(`[Cron Error] ${route} failed:`, err?.message || err);
            })
        );
    },
};

export default worker;
