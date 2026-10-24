/**
 * First-touch traffic attribution, stored in this browser only.
 *
 * Card.source is the only attribution column we have, so the value must fit
 * the server's allowlist:
 *   - `wishes/...` / `ages/...`  → internal landing pages (set by CreateForm)
 *   - `utm:<source>`             → explicit campaign (`?utm_source=instagram`)
 *   - `ref:<hostname-or-tag>`    → affiliate tag (`?ref=priya`) or external
 *                                  referrer hostname (`ref:news.ycombinator.com`)
 *
 * First touch wins for 30 days: a later internal navigation or a second UTM
 * does not rewrite where the creator originally came from. The value is
 * intentionally low-cardinality and contains no query strings or PII.
 */

const ATTRIBUTION_KEY = 'bgen-attribution-v1';
const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function slug(value, max = 40) {
    if (typeof value !== 'string') return '';
    return value
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, max);
}

function fromCurrentUrl() {
    if (typeof window === 'undefined') return null;
    try {
        const params = new URLSearchParams(window.location.search);
        const utm = slug(params.get('utm_source') || '', 34);
        if (utm) return `utm:${utm}`;

        const ref = slug(params.get('ref') || '', 40);
        if (ref) return `ref:${ref}`;

        if (!document.referrer) return null;
        const referrer = new URL(document.referrer);
        if (referrer.origin === window.location.origin) return null;
        const host = slug(referrer.hostname.replace(/^www\./, ''), 40);
        // A bare hostname is useful ("google.com"), but never a full URL.
        return host ? `ref:${host}` : null;
    } catch {
        return null;
    }
}

/**
 * Return the first-touch source, capturing it from the current URL/referrer
 * if this browser has no unexpired value yet. Call on the client only.
 */
export function getAttributionSource() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(ATTRIBUTION_KEY);
        if (raw) {
            const stored = JSON.parse(raw);
            if (stored?.source && typeof stored.source === 'string'
                && Date.now() - Number(stored.ts || 0) < ATTRIBUTION_TTL_MS) {
                return stored.source;
            }
        }
    } catch { }

    const source = fromCurrentUrl();
    if (!source) return null;
    try {
        localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({ source, ts: Date.now() }));
    } catch { }
    return source;
}

/**
 * Explicitly capture the current URL (e.g. on the landing page) without
 * returning anything. Safe to call repeatedly; first touch is preserved.
 */
export function captureAttribution() {
    getAttributionSource();
}
