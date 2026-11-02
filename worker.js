export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
import openNextWorker from "./.open-next/worker.js";

const CRON_ROUTES = {
    "*/5 * * * *": "/api/cron/delivery",
    "0 * * * *": "/api/cron/recovery",
    "0 4 * * *": "/api/cron/cleanup",
    "0 5 * * *": "/api/cron/reminders",
};

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

    return new Request(url.toString(), {
        method: "GET",
        headers: request.headers,
    });
}

/**
 * Purges edge cache for a card ID across both HTML and RSC representations.
 */
function purgeCardCache(id, origin, cache, ctx) {
    if (!id || !origin) return;
    const targets = [
        `${origin}/b/${id}`,
        `${origin}/b/${id}?__cf_rsc=1`,
    ];
    for (const target of targets) {
        ctx.waitUntil(cache.delete(target).catch(() => {}));
    }
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const cache = caches.default;

        // 1. Cron / internal worker triggers bypass cache
        if (request.headers.get("User-Agent") === "Cloudflare-Worker-Cron/1.0") {
            return openNextWorker.fetch(request, env, ctx);
        }

        const isGet = request.method === "GET";
        const isApi = url.pathname.startsWith("/api/");
        const isBypass = request.headers.has("Authorization");

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
                purgeCardCache(bMatch[1], url.origin, cache, ctx);
            }
        }

        // 5. Cache eligible responses in Cloudflare Edge Cache
        if (isGet && !isBypass && !isApi && response.status === 200) {
            const cacheControl = response.headers.get("Cache-Control") || "";
            const isCacheable = (cacheControl.includes("s-maxage") || cacheControl.includes("max-age")) &&
                                !cacheControl.includes("no-store") &&
                                !cacheControl.includes("private") &&
                                !response.headers.has("Set-Cookie");

            if (isCacheable) {
                const cacheKey = getCacheKey(request);
                ctx.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {}));
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
