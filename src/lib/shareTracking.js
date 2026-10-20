/**
 * Client-side share-intent tracking.
 *
 * A "share" is one real share action (button click / native share sheet),
 * recorded with its channel and where on the page it happened. The server
 * dedupes the same channel twice in one browsing session, so double-clicks
 * and repeat clicks cannot inflate the count while sharing to a different
 * channel still counts separately.
 *
 * Preview mode (?preview=1) is always skipped: owner testing never counts.
 */

const SESSION_KEY = 'bgen-share-session';
export const SHARE_DEDUPE_MS = 6 * 60 * 60 * 1000; // matches the API window

let memorySessionId = null;

function randomId() {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
    } catch { }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getShareSessionId() {
    if (typeof window === 'undefined') return null;
    try {
        const existing = window.sessionStorage.getItem(SESSION_KEY);
        if (existing) return existing;
        const id = randomId();
        window.sessionStorage.setItem(SESSION_KEY, id);
        return id;
    } catch {
        // Private mode / storage disabled: fall back to a per-page-load id so
        // dedupe still works for this visit.
        if (!memorySessionId) memorySessionId = randomId();
        return memorySessionId;
    }
}

function isPreviewUrl() {
    try {
        const q = new URLSearchParams(window.location.search);
        if (!q.has('preview')) return false;
        const v = (q.get('preview') || '').toLowerCase();
        return v === '' || v === '1' || v === 'true' || v === 'yes' || v === 'on';
    } catch {
        return false;
    }
}

/**
 * @param {object} opts
 * @param {string} opts.pageId  BirthdayPage id
 * @param {string} opts.channel 'whatsapp' | 'telegram' | 'facebook' | 'x' | 'copy' | 'native' | 'other'
 * @param {string} [opts.source] 'post_creation' | 'creator_notice' | 'card_footer'
 */
export function trackShare({ pageId, channel, source = 'card_footer' }) {
    if (!pageId || typeof window === 'undefined') return;

    try {
        if (isPreviewUrl()) return;
    } catch { }

    const ch = typeof channel === 'string' && channel.trim() ? channel.trim().toLowerCase() : 'other';

    // Cheap client-side guard. The API enforces the same window server-side.
    const dedupeKey = `bgen-share:${pageId}:${ch}`;
    try {
        const last = Number(window.sessionStorage.getItem(dedupeKey) || 0);
        if (Number.isFinite(last) && last > 0 && Date.now() - last < SHARE_DEDUPE_MS) return;
        window.sessionStorage.setItem(dedupeKey, String(Date.now()));
    } catch { }

    try {
        fetch(`/api/birthday/${pageId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'share', channel: ch, source, sessionId: getShareSessionId() }),
            // Survive the page being backgrounded/navigated by the share target.
            keepalive: true,
        }).catch(() => { });
    } catch { }
}
