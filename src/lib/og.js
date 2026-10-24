/**
 * Shared helpers for social preview (Open Graph) images.
 *
 * Why this module exists
 * ----------------------
 * /api/og used to rasterise a brand new PNG on every cold isolate. Measured
 * against production, a cold render costs ~1.23s of CPU (booting the resvg
 * WASM module and font data dominates; the layout itself is trivial), which
 * made the route ~77% of the project's Fluid Active CPU usage. The same card
 * gets unfurled from several regions, and the CDN caches per-POP, so each
 * region paid that boot cost again for an identical image.
 *
 * The fix is to render each image once, store it in R2, and have /api/og
 * redirect to the stored object. Cloudflare then serves one globally cached
 * file instead of booting an image renderer per region.
 *
 * The storage key is derived purely from the render inputs, so the public
 * /api/og URL contract is unchanged — previously cached images stay valid and
 * no database column is needed to remember whether an image exists.
 */

export const THEME_BG = {
    elegant: ['#fdfbf7', '#f3efe6', '#2c2c2c'],
    fun: ['#fff0f5', '#ffd6e8', '#831843'],
    retro: ['#2b2b2b', '#0f0f0f', '#f0f0f0'],
    minimal: ['#ffffff', '#f3f4f6', '#111827'],
    royal: ['#1a0f2e', '#4c1d95', '#fdf6e3'],
    midnight: ['#0b1026', '#312e81', '#eef2ff'],
    princess: ['#fff5f7', '#fecdd3', '#831843'],
    unicorn: ['#f5f3ff', '#ddd6fe', '#4c1d95'],
    // VIP-only themes. These were missing, so a card using one silently fell
    // back to the `fun` palette and rendered a pink preview for a dark theme.
    // Values mirror --bg-primary / --bg-secondary / --text-primary in
    // src/app/themes.css so the preview matches what the card actually looks
    // like. Every id listed in CreateForm/VipCustomizerModal needs an entry.
    neon: ['#070814', '#0e1126', '#ffffff'],
    sunset: ['#1f0b24', '#32113a', '#fff5eb'],
    holo: ['#0b1026', '#131a3d', '#e0f2fe'],
    aurora: ['#f2f8ff', '#dbeafe', '#0c4a3e'],
};

// Matches the truncation the route has always applied, so keys and rendered
// text agree for absurdly long names.
const MAX_FIELD_LENGTH = 24;

/**
 * Build the /api/og path for a card.
 *
 * IMPORTANT: this must stay byte-identical to the URLs previously emitted by
 * generateMetadata. encodeURIComponent (not URLSearchParams) is used on
 * purpose — URLSearchParams encodes spaces as "+", which would produce a new
 * cache key and force every existing card to re-render.
 */
export function buildOgPath({ recipientName, age, theme, senderName }) {
    const senderParam = senderName ? `&sender=${encodeURIComponent(senderName)}` : '';
    return `/api/og?name=${encodeURIComponent(recipientName)}${age ? `&age=${age}` : ''}&theme=${encodeURIComponent(theme || 'elegant')}${senderParam}`;
}

/**
 * Collapse any /api/og query into the canonical render inputs.
 * Defaults mirror the route's historical behaviour.
 */
export function normalizeOgInput(searchParams) {
    return {
        name: (searchParams.get('name') || 'Friend').slice(0, MAX_FIELD_LENGTH),
        age: searchParams.get('age') || '',
        theme: searchParams.get('theme') || 'fun',
        sender: (searchParams.get('sender') || '').slice(0, MAX_FIELD_LENGTH),
    };
}

// 64-bit FNV-1a. Synchronous (unlike crypto.subtle) so the edge route can
// derive a key without an await, and identical in edge and Node runtimes.
function fnv1a64(str) {
    let hash = 0xcbf29ce484222325n;
    const prime = 0x100000001b3n;
    const mask = 0xffffffffffffffffn;
    for (let i = 0; i < str.length; i++) {
        hash ^= BigInt(str.charCodeAt(i));
        hash = (hash * prime) & mask;
    }
    return hash.toString(16).padStart(16, '0');
}

function slug(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 20) || 'x';
}

/**
 * Deterministic R2 object key for a set of render inputs.
 *
 * A short readable prefix keeps the bucket browsable; the hash suffix makes
 * collisions impossible in practice (two different names can slugify the
 * same way).
 */
export function ogStorageKey(input) {
    const canonical = `${input.name}|${input.age}|${input.theme}|${input.sender}`;
    return `og/v1/${slug(input.name)}-${slug(input.theme)}-${slug(input.age || 'na')}-${fnv1a64(canonical)}.png`;
}

/**
 * Absolute public URL for a stored OG image, or null when R2 public delivery
 * is not configured (local dev, previews without the env var).
 */
export function ogPublicUrl(key) {
    const domain = (process.env.R2_PUBLIC_DOMAIN || '').replace(/\/+$/, '');
    if (!domain || !key) return null;
    return `${domain}/${key}`;
}
