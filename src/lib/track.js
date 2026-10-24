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
        const path = window.location.pathname;
        const body = JSON.stringify({ event, path, ...extra });
        fetch('/api/support/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => { });
    } catch { }
}
