/**
 * Resolve the client IP used for per-visitor rate limiting.
 *
 * Cloudflare Workers run before the edge proxy re-adds `X-Forwarded-For`, so
 * that header is absent inside the Worker. Reading it (as the routes used to)
 * collapsed every visitor into the same `'unknown'` bucket, turning per-IP
 * limits into one global limit for the entire site.
 *
 * `CF-Connecting-IP` is set by Cloudflare's edge on every request and cannot be
 * forged by the client. The other headers keep the same code working on Vercel
 * and local dev.
 */
export function getClientIp(request) {
    const headers = request?.headers;
    if (!headers) return null;

    for (const name of ['cf-connecting-ip', 'true-client-ip', 'x-real-ip']) {
        const ip = normalizeIp(headers.get(name));
        if (ip) return ip;
    }

    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        // The first entry is the original client for Vercel / standard proxies.
        for (const part of forwarded.split(',')) {
            const ip = normalizeIp(part);
            if (ip) return ip;
        }
    }

    return null;
}

function normalizeIp(value) {
    if (typeof value !== 'string') return null;
    const ip = value.trim();
    if (!ip || ip.length > 45) return null;

    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        const valid = ip.split('.').every((octet) => Number(octet) <= 255);
        return valid ? ip : null;
    }

    // IPv6, including `::1` and IPv4-mapped addresses.
    if (/^[0-9a-f:.]+$/i.test(ip) && ip.includes(':')) return ip;

    return null;
}
