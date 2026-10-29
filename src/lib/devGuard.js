/**
 * devGuard.js — Development environment write guard.
 *
 * All API routes that mutate the database should call `blockInDev()` before
 * performing any DB write.  In development (`NODE_ENV !== 'production'`) the
 * function returns a NextResponse stub so the caller can do:
 *
 *   const devBlock = blockInDev(request, 'create birthday page');
 *   if (devBlock) return devBlock;
 *
 * This keeps real production data clean and prevents accidental event / counter
 * inflation during local testing, while still letting the app function normally
 * (the stub response is valid JSON that clients can handle gracefully).
 *
 * READ operations (GET, stats, etc.) are unaffected — only writes are blocked.
 *
 * To opt-out for a specific call during dev, pass `{ force: true }` as the
 * third argument.  Use sparingly (e.g. one-off test upgrades).
 */

import { NextResponse } from 'next/server';

const IS_DEV = process.env.NODE_ENV == 'development';

/**
 * Returns a NextResponse if in development and not forced, otherwise null.
 *
 * @param {Request} request  - The incoming Next.js Request object (used for logging).
 * @param {string}  label    - Human-readable label for the blocked operation.
 * @param {{ force?: boolean }} [opts]
 * @returns {import('next/server').NextResponse | null}
 */
export function blockInDev(request, label = 'DB write', { force = false } = {}) {
    if (!IS_DEV || force) return null;

    const method = request?.method || 'UNKNOWN';
    const url = request?.url || '';

    console.warn(
        `[DEV GUARD] Blocked ${method} ${url} → "${label}". ` +
        `DB writes are disabled in development to keep production data clean. ` +
        `Pass { force: true } to bypass.`
    );

    return NextResponse.json(
        {
            success: true,
            __devBlocked: true,
            message: `[dev] "${label}" was blocked — no DB write occurred.`,
        },
        { status: 200 }
    );
}

/** Convenience: true when running in development. */
export const isDev = IS_DEV;

/**
 * Dev-only logger — a no-op in production.
 * Use instead of raw console.log for anything that should only appear locally.
 */
export function devLog(...args) {
    if (IS_DEV) console.log('[DEV]', ...args);
}
