import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { warmOgImage } from '@/lib/og-warm';

const VALID_THEMES = ['fun', 'elegant', 'royal', 'neon', 'midnight', 'princess', 'retro', 'sunset', 'unicorn', 'minimal', 'holo', 'aurora'];
const VALID_TRACKS = ['classic', 'rock', 'off', 'musicbox', 'strings', 'party', 'piano', 'retro', 'acoustic', 'reggae', 'techno', 'beats', 'waltz', 'lullaby', 'fanfare', 'chamber', 'marching'];

const MAX_PHOTOS = 24;

/** Constant-time string comparison for the card's edit token. */
function tokensMatch(expected, provided) {
    if (typeof provided !== 'string' || provided.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
    }
    return diff === 0;
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing card ID' }, { status: 400 });
        }

        const body = await request.json();
        const { theme, music, message, cleanFree, photos, editToken } = body;

        // For cleanFree we need to read existing values — single select query
        if (cleanFree) {
            const existing = await prisma.birthdayPage.findUnique({
                where: { id },
                select: { id: true, theme: true, music: true, isVip: true },
            });
            if (!existing) {
                return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
            }
            // Non-destructive: Preserve all uploaded photos and themes in DB
            // Client rendering handles free vs VIP display dynamically
            return NextResponse.json({
                success: true,
                page: {
                    id: existing.id,
                    theme: existing.theme,
                    music: existing.music,
                    isVip: existing.isVip,
                },
            });
        }

        // Ownership gate: the card ID is public (it is in the share link), so
        // edits require the secret handed to the creator at creation time.
        // Cards created before edit tokens existed (null) keep the legacy
        // open-edit behavior so existing owners don't lose access.
        const ownership = await prisma.birthdayPage.findUnique({
            where: { id },
            select: { editToken: true },
        });
        if (!ownership) {
            return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
        }
        if (ownership.editToken && !tokensMatch(ownership.editToken, editToken)) {
            return NextResponse.json({ success: false, error: 'You are not allowed to edit this card.' }, { status: 403 });
        }

        const updateData = {};

        if (typeof theme === 'string' && VALID_THEMES.includes(theme.trim().toLowerCase())) {
            updateData.theme = theme.trim().toLowerCase();
        }

        if (typeof music === 'string' && VALID_TRACKS.includes(music.trim().toLowerCase())) {
            updateData.music = music.trim().toLowerCase();
        }

        if (typeof message === 'string') {
            updateData.message = message.slice(0, 2000);
        }

        if (Array.isArray(photos)) {
            // Replace the whole gallery. Only http(s) URLs survive — these are
            // upload-service URLs, never arbitrary schemes.
            updateData.photos = {
                deleteMany: {},
                create: photos
                    .filter((url) => typeof url === 'string' && /^https?:\/\//i.test(url))
                    .slice(0, MAX_PHOTOS)
                    .map((url, index) => ({ url, order: index })),
            };
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
        }

        // Single DB call — Prisma throws P2025 if record not found, caught below
        const updated = await prisma.birthdayPage.update({
            where: { id },
            data: updateData,
        });

        // Bust ISR cache so VIP theme/music changes are visible immediately
        try { revalidatePath(`/b/${id}`); } catch {}

        // A theme change produces a different preview image. Render it now so
        // the next unfurl is served from R2 instead of a cold edge isolate.
        if (updateData.theme) warmOgImage(request, updated);

        return NextResponse.json({
            success: true,
            page: {
                id: updated.id,
                theme: updated.theme,
                music: updated.music,
                isVip: updated.isVip,
                photosCount: updated.photos?.length || 0,
            },
        });
    } catch (error) {
        // P2025 = record not found (Prisma error code for update on missing row)
        if (error?.code === 'P2025') {
            return NextResponse.json({ success: false, error: 'Card not found' }, { status: 404 });
        }
        console.error('Update card error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update card' }, { status: 500 });
    }
}
