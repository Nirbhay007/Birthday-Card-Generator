import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { recipientName, birthdayDate, message, theme, photos, reminderEmail, remindNextYear, age, senderName, relationship, music, source } = body;

        // Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const recentPages = await prisma.birthdayPage.count({
            where: {
                ipAddress: ip,
                createdAt: {
                    gte: oneHourAgo,
                },
            },
        });

        if (recentPages >= 5) {
            return NextResponse.json({ success: false, error: 'Rate limit exceeded. You can only create 5 pages per hour.' }, { status: 429 });
        }

        if (!recipientName) {
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
        const MUSIC_CHOICES = ['classic', 'musicbox', 'party', 'off'];
        const validMusic = MUSIC_CHOICES.includes(music) ? music : 'classic';
        const validSource = typeof source === 'string' && /^(wishes|ages)\/[a-z0-9-]+$/.test(source)
            ? source.slice(0, 60)
            : null;

        // Create the page and photos in a transaction
        const page = await prisma.birthdayPage.create({
            data: {
                recipientName: String(recipientName).slice(0, 80),
                birthdayDate: birthdayDate ? new Date(birthdayDate) : null,
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
                    create: photos?.map((url, index) => ({
                        url,
                        order: index,
                    })) || [],
                },
            },
        });

        return NextResponse.json({ success: true, id: page.id });
    } catch (error) {
        console.error('Create page error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create page' }, { status: 500 });
    }
}
