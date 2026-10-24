import crypto from 'crypto';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmailAlert } from '@/lib/alerts';
import { warmOgImage } from '@/lib/og-warm';

// Cap per-IP creations per hour. High enough for shared networks (family wifi,
// CGNAT mobile carriers) but low enough to stop scripted abuse of storage.
const MAX_PAGES_PER_HOUR = 10;

export async function POST(request) {
    try {
        const body = await request.json();
        const { recipientName, birthdayDate, message, theme, photos, reminderEmail, remindNextYear, age, senderName, relationship, music, source } = body;

        // Rate Limiting — findMany with take=limit is cheaper than count() for
        // threshold checks: we only need to know whether >= limit rows exist.
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const recentCheck = await prisma.birthdayPage.findMany({
            where: {
                ipAddress: ip,
                createdAt: { gte: oneHourAgo },
            },
            select: { id: true },
            take: MAX_PAGES_PER_HOUR,
        });

        if (recentCheck.length >= MAX_PAGES_PER_HOUR) {
            return NextResponse.json(
                { success: false, error: `Rate limit exceeded. You can create up to ${MAX_PAGES_PER_HOUR} pages per hour.` },
                { status: 429 }
            );
        }

        // Trim before validating: whitespace-only names are not names, and the
        // stored value should match what the creator sees.
        const cleanRecipientName = typeof recipientName === 'string' ? recipientName.trim() : '';
        if (!cleanRecipientName) {
            return NextResponse.json({ success: false, error: 'Recipient name is required' }, { status: 400 });
        }

        const validReminderEmail = (remindNextYear && typeof reminderEmail === 'string' && reminderEmail.includes('@'))
            ? reminderEmail.trim().slice(0, 255)
            : null;

        const parsedAge = typeof age === 'number' ? Math.trunc(age) : parseInt(age, 10);
        const validAge = Number.isFinite(parsedAge) && parsedAge >= 1 && parsedAge <= 120 ? parsedAge : null;
        const validSender = typeof senderName === 'string' && senderName.trim().length > 0
            ? senderName.trim().slice(0, 80)
            : null;
        const validRelationship = typeof relationship === 'string' && relationship.trim().length > 0
            ? relationship.trim().slice(0, 30)
            : null;
        const MUSIC_CHOICES = ['classic', 'rock', 'musicbox', 'party', 'off', 'beats', 'strings', 'piano', 'waltz', 'lullaby', 'fanfare', 'retro', 'acoustic', 'reggae', 'techno', 'neon', 'sunset', 'starlight', 'chamber', 'marching'];
        const validMusic = MUSIC_CHOICES.includes(music) ? music : 'classic';
        const validSource = typeof source === 'string' && /^(wishes|ages)\/[a-z0-9-]+$/.test(source)
            ? source.slice(0, 60)
            : null;

        let validBirthdayDate = null;
        if (birthdayDate) {
            const parsed = new Date(birthdayDate);
            if (!Number.isNaN(parsed.getTime())) {
                const now = Date.now();
                const minTime = now - 35 * 24 * 60 * 60 * 1000; // allow buffer for timezone differences
                const maxTime = now + 370 * 24 * 60 * 60 * 1000; // allow buffer up to ~1 year ahead
                if (parsed.getTime() >= minTime && parsed.getTime() <= maxTime) {
                    validBirthdayDate = parsed;
                }
            }
        }

        // Ownership secret: whoever holds this token may edit the card later
        // (theme/music/message via PATCH). Returned once to the creator and
        // kept in their browser's localStorage — never rendered on the page.
        const editToken = crypto.randomBytes(24).toString('hex'); // 192-bit

        // Create the page and photos in a transaction
        const page = await prisma.birthdayPage.create({
            data: {
                editToken,
                recipientName: cleanRecipientName.slice(0, 80),
                birthdayDate: validBirthdayDate,
                message: typeof message === 'string' ? message.slice(0, 2000) : null,
                theme: theme || 'elegant',
                ipAddress: ip,
                reminderEmail: validReminderEmail,
                age: validAge,
                senderName: validSender,
                relationship: validRelationship,
                music: validMusic,
                source: validSource,
                photos: {
                    create: photos?.slice(0, 12).map((url, index) => ({
                        url,
                        order: index,
                    })) || [],
                },
            },
        });

        warmOgImage(request, page);

        return NextResponse.json({ success: true, id: page.id, editToken });
    } catch (error) {
        console.error('Create page error:', error);
        sendEmailAlert({
            title: 'CRITICAL: Birthday Card Creation Failed',
            message: `Card creation failed in /api/birthday: ${error?.message || 'Database or server error'}.`,
            level: 'critical',
        }).catch(console.error);
        return NextResponse.json({ success: false, error: 'Failed to create page' }, { status: 500 });
    }
}
