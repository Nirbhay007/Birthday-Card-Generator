/**
 * Resolve the client IP used for per-visitor rate limiting.
 *
 * Vercel terminates the request before it reaches the function, so
 * `x-forwarded-for` and `x-real-ip` are populated by the platform. The first
 * `x-forwarded-for` entry is the original client for Vercel / standard proxies.
 *
 * We intentionally do not trust `cf-connecting-ip` here: it is only written by
 * Cloudflare's edge, so on a direct Vercel deployment a client could send its
 * own value and dodge rate limits.
 */
export function getClientIp(request) {
    const headers = request?.headers;
    if (!headers) return null;

    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        for (const part of forwarded.split(',')) {
            const ip = normalizeIp(part);
            if (ip) return ip;
        }
    }

    const realIp = normalizeIp(headers.get('x-real-ip'));
    if (realIp) return realIp;

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
