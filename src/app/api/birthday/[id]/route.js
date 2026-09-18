import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_THEMES = ['fun', 'elegant', 'royal', 'neon', 'midnight', 'princess', 'retro', 'sunset', 'unicorn', 'minimal'];
const VALID_TRACKS = ['classic', 'rock', 'off', 'musicbox', 'strings', 'party', 'piano', 'retro', 'acoustic', 'reggae', 'techno', 'beats', 'waltz', 'lullaby', 'fanfare'];

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing card ID' }, { status: 400 });
        }

        const body = await request.json();
        const { theme, music, message, cleanFree, photos } = body;

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
            updateData.photos = photos;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
        }

        // Single DB call — Prisma throws P2025 if record not found, caught below
        const updated = await prisma.birthdayPage.update({
            where: { id },
            data: updateData,
        });

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
