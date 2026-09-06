import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * Viral-loop counters: views, loves, shares — with anti-spam layers:
 * 1. One view / one love per browser (httpOnly cookie) — survives reloads.
 * 2. Per-IP rate limit (best-effort in-memory; mirrors the create route's
 *    budget approach for direct API spam). DB-backed IP logs can replace
 *    this later if abuse ever matters more than growth.
 * 3. Fail-open: counter failures never break the celebration page.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map();

function throttled(ip) {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    arr.push(now);
    hits.set(ip, arr);
    if (hits.size > 5000) hits.delete(hits.keys().next().value);
    return arr.length > MAX_PER_WINDOW;
}

const COUNTS = { viewCount: true, loves: true, shares: true };

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        if (!id || typeof id !== 'string' || id.length > 64) {
            return NextResponse.json({ success: false }, { status: 400 });
        }
        const body = await request.json().catch(() => ({}));
        const { type } = body;

        let data = null;
        if (type === 'view') data = { viewCount: { increment: 1 } };
        else if (type === 'love') data = { loves: { increment: 1 } };
        else if (type === 'share') data = { shares: { increment: 1 } };
        else {
            return NextResponse.json({ success: false, error: 'Unknown reaction type' }, { status: 400 });
        }

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (throttled(ip)) {
            return NextResponse.json({ success: false, error: 'Slow down' }, { status: 429 });
        }

        const jar = await cookies();
        // Views + loves: one per browser. Shares are intentionally NOT
        // cookie-deduped — sharing to 4 channels is 4 legitimate shares.
        const cookieName = type === 'view' ? `bgen-v-${id}` : type === 'love' ? `bgen-l-${id}` : null;
        if (cookieName && jar.get(cookieName)) {
            const page = await prisma.birthdayPage.findUnique({ where: { id }, select: COUNTS }).catch(() => null);
            return NextResponse.json({ success: true, duplicate: true, ...(page || { viewCount: 0, loves: 0, shares: 0 }) });
        }

        const page = await prisma.birthdayPage.update({
            where: { id },
            data,
            select: COUNTS,
        });
        const res = NextResponse.json({ success: true, ...page });
        if (cookieName) {
            res.cookies.set(cookieName, '1', { httpOnly: true, sameSite: 'lax', maxAge: 31536000, path: '/' });
        }
        return res;
    } catch (error) {
        // Never break the celebration on counter failures (e.g. unknown id)
        console.error('React counter error:', error?.message || error);
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
