import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/clientIp';
import prisma from '@/lib/prisma';

/**
 * Group-card wishes.
 *
 * GET  /api/group-wishes?pageId=...   public list (only for group cards)
 * POST /api/group-wishes { pageId, name, message, emoji? }
 *
 * Wishes are plain text and rendered through React, which escapes them. The
 * API is append-only and rate-limited per IP; there is no edit/delete path, so
 * a contributor can never rewrite someone else's message.
 */

const MAX_PER_WINDOW = 12;
const WINDOW_MS = 60_000;
const hits = new Map();

function throttled(ip) {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
    arr.push(now);
    hits.set(ip, arr);
    if (hits.size > 5000) hits.delete(hits.keys().next().value);
    return arr.length > MAX_PER_WINDOW;
}

function cleanLine(value, max) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, max);
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageId = String(searchParams.get('pageId') || '').trim();
        if (!pageId) return NextResponse.json({ success: false, error: 'Missing card.' }, { status: 400 });

        const page = await prisma.birthdayPage.findUnique({
            where: { id: pageId },
            select: { id: true, isGroup: true, recipientName: true },
        });
        if (!page) return NextResponse.json({ success: false, error: 'Card not found.' }, { status: 404 });
        if (!page.isGroup) return NextResponse.json({ success: false, error: 'This is not a group card.' }, { status: 404 });

        const [wishes, count] = await Promise.all([
            prisma.groupWish.findMany({
                where: { pageId },
                orderBy: { createdAt: 'asc' },
                take: 200,
                select: { id: true, name: true, message: true, emoji: true, createdAt: true },
            }),
            prisma.groupWish.count({ where: { pageId } }),
        ]);

        return NextResponse.json({
            success: true,
            recipientName: page.recipientName,
            count,
            wishes,
        });
    } catch (error) {
        console.error('Group wishes read error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Could not load wishes.' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const ip = getClientIp(request);
        if (ip && throttled(ip)) {
            return NextResponse.json({ success: false, error: 'Too many wishes at once. Take a breath and try again.' }, { status: 429 });
        }

        const body = await request.json().catch(() => ({}));
        const pageId = String(body?.pageId || '').trim();
        const name = cleanLine(body?.name, 40);
        const message = cleanLine(body?.message, 300);
        const emoji = cleanLine(body?.emoji, 8);

        if (!pageId) return NextResponse.json({ success: false, error: 'Missing card.' }, { status: 400 });
        if (!name) return NextResponse.json({ success: false, error: 'Add your name so they know who it is from.' }, { status: 400 });
        if (!message) return NextResponse.json({ success: false, error: 'Write a short birthday wish first.' }, { status: 400 });

        const page = await prisma.birthdayPage.findUnique({
            where: { id: pageId },
            select: { id: true, isGroup: true },
        });
        if (!page) return NextResponse.json({ success: false, error: 'Card not found.' }, { status: 404 });
        if (!page.isGroup) return NextResponse.json({ success: false, error: 'This is not a group card.' }, { status: 404 });

        const wish = await prisma.groupWish.create({
            data: {
                pageId,
                name,
                message,
                emoji: emoji || null,
            },
            select: { id: true, name: true, message: true, emoji: true, createdAt: true },
        });

        try {
            await prisma.supportEvent.create({
                data: { event: 'group_wish_submitted', path: '/b/[id]/add' },
            });
        } catch { }

        return NextResponse.json({ success: true, wish });
    } catch (error) {
        console.error('Group wish create error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Could not add your wish. Please try again.' }, { status: 500 });
    }
}
