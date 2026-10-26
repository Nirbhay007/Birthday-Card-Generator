/**
 * Fire-and-forget product analytics.
 *
 * Keep this payload PII-free: event name + path only. The API allowlists the
 * event names and never stores cookies or IPs. `keepalive` lets an event sent
 * during a navigation (or right before a checkout redirect) still land.
 */
export function track(event, extra = {}) {
    if (typeof window === 'undefined') return;
    try {
        // Callers may override `path` to group events that happen on a
        // per-card URL (e.g. '/b/[id]') instead of creating one analytics
        // bucket per card id. Invalid overrides fall back to the real path.
        const { path: pathOverride, ...rest } = extra;
        const path = typeof pathOverride === 'string' && pathOverride.startsWith('/')
            ? pathOverride
            : window.location.pathname;
        const body = JSON.stringify({ event, path, ...rest });
        fetch('/api/support/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => { });
    } catch { }
}
