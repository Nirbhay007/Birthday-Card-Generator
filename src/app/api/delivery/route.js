import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isValidEmail } from '@/lib/utils';
import {
    deliveryDateString,
    deliverySweepForDate,
    nextDeliveryDate,
    todayInDeliveryZone,
} from '@/lib/deliverySchedule';

/**
 * Scheduled delivery for a card (VIP feature).
 *
 * GET    /api/delivery?pageId=...&token=...   read the current schedule
 * POST   /api/delivery { pageId, editToken, scheduledDate, ... }  create/update
 * DELETE /api/delivery?pageId=...&token=...   cancel
 *
 * Delivery is date-based because the daily cron only runs one sweep. The API
 * accepts `scheduledDate` (YYYY-MM-DD) and stores that date's 03:00 UTC sweep
 * instant. Vercel may run the sweep up to 59 minutes later, which is why the
 * UI describes a morning window rather than an exact time. `scheduledAt` is
 * still accepted for older clients and reduced to its date part.
 *
 * Ownership is the card's edit token, exactly like theme/music edits. The
 * public card link cannot schedule or cancel anything.
 */

function tokensMatch(expected, provided) {
    if (typeof provided !== 'string' || provided.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
    return diff === 0;
}

function cleanEmail(value) {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase().slice(0, 255);
}

function requestedDeliveryDate(body) {
    const explicit = String(body?.scheduledDate || '').trim();
    if (explicit) return explicit;

    // Backwards compatibility: the old UI sent a full ISO timestamp. Keep the
    // calendar date the creator picked instead of shifting it into UTC.
    const legacy = String(body?.scheduledAt || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(legacy)) return legacy.slice(0, 10);
    return '';
}

async function authorize(pageId, token) {
    if (!pageId) return { error: 'Missing card.', status: 400 };
    const page = await prisma.birthdayPage.findUnique({
        where: { id: pageId },
        select: { id: true, editToken: true, isVip: true, recipientName: true },
    });
    if (!page) return { error: 'Card not found.', status: 404 };
    if (page.editToken && !tokensMatch(page.editToken, token)) {
        return { error: 'You are not allowed to manage this card.', status: 403 };
    }
    return { page };
}

function serialize(delivery) {
    if (!delivery) return null;
    return {
        id: delivery.id,
        scheduledAt: delivery.scheduledAt,
        scheduledDate: deliveryDateString(delivery.scheduledAt),
        timezone: delivery.timezone,
        recipientEmail: delivery.recipientEmail,
        recipientName: delivery.recipientName,
        creatorEmail: delivery.creatorEmail,
        channel: delivery.channel,
        status: delivery.status,
        sentAt: delivery.sentAt,
        error: delivery.error,
    };
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageId = String(searchParams.get('pageId') || '').trim();
        const token = String(searchParams.get('token') || '');
        const auth = await authorize(pageId, token);
        if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

        const delivery = await prisma.cardDelivery.findUnique({ where: { pageId } });
        return NextResponse.json({
            success: true,
            isVip: !!auth.page.isVip,
            delivery: serialize(delivery),
        });
    } catch (error) {
        console.error('Delivery read error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Could not load the schedule.' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const pageId = String(body?.pageId || '').trim();
        const token = String(body?.editToken || '');
        const auth = await authorize(pageId, token);
        if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

        // Scheduled delivery is part of VIP. This is a product gate, not a
        // security boundary: the edit token already proves ownership.
        if (!auth.page.isVip) {
            return NextResponse.json({ success: false, error: 'Scheduled delivery is a VIP feature. Unlock VIP first.' }, { status: 402 });
        }

        const scheduledDate = requestedDeliveryDate(body);
        const scheduledAt = deliverySweepForDate(scheduledDate);
        if (!scheduledAt) {
            return NextResponse.json({ success: false, error: 'Choose a valid delivery date.' }, { status: 400 });
        }

        const now = Date.now();
        if (scheduledDate < todayInDeliveryZone()) {
            return NextResponse.json({ success: false, error: 'Choose today or a future date.' }, { status: 400 });
        }
        if (scheduledDate < nextDeliveryDate()) {
            return NextResponse.json(
                { success: false, error: "Today's delivery window has already passed. Choose tomorrow or a later date." },
                { status: 400 }
            );
        }
        if (scheduledAt.getTime() > now + 366 * 24 * 60 * 60 * 1000) {
            return NextResponse.json({ success: false, error: 'Choose a delivery date within the next year.' }, { status: 400 });
        }

        const recipientEmail = cleanEmail(body?.recipientEmail);
        const creatorEmail = cleanEmail(body?.creatorEmail);
        if (recipientEmail && !isValidEmail(recipientEmail)) {
            return NextResponse.json({ success: false, error: 'Enter a valid recipient email, or leave it blank.' }, { status: 400 });
        }
        if (creatorEmail && !isValidEmail(creatorEmail)) {
            return NextResponse.json({ success: false, error: 'Enter a valid email for your delivery reminder.' }, { status: 400 });
        }
        if (!recipientEmail && !creatorEmail) {
            return NextResponse.json(
                { success: false, error: 'Add the recipient email for automatic delivery, or your own email for a send reminder.' },
                { status: 400 }
            );
        }

        const timezone = typeof body?.timezone === 'string' && body.timezone.trim()
            ? body.timezone.trim().slice(0, 60)
            : 'Asia/Kolkata';
        const channel = recipientEmail ? 'email' : 'whatsapp_assist';
        const recipientName = typeof body?.recipientName === 'string' && body.recipientName.trim()
            ? body.recipientName.trim().slice(0, 80)
            : auth.page.recipientName;

        const delivery = await prisma.cardDelivery.upsert({
            where: { pageId },
            update: {
                scheduledAt,
                timezone,
                recipientEmail: recipientEmail || null,
                recipientName,
                creatorEmail: creatorEmail || null,
                channel,
                status: 'scheduled',
                attempts: 0,
                sentAt: null,
                error: null,
            },
            create: {
                pageId,
                scheduledAt,
                timezone,
                recipientEmail: recipientEmail || null,
                recipientName,
                creatorEmail: creatorEmail || null,
                channel,
            },
        });

        return NextResponse.json({ success: true, delivery: serialize(delivery) });
    } catch (error) {
        console.error('Delivery save error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Could not save the schedule.' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pageId = String(searchParams.get('pageId') || '').trim();
        const token = String(searchParams.get('token') || '');
        const auth = await authorize(pageId, token);
        if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

        const existing = await prisma.cardDelivery.findUnique({ where: { pageId }, select: { id: true } });
        if (!existing) return NextResponse.json({ success: true, delivery: null });

        const delivery = await prisma.cardDelivery.update({
            where: { pageId },
            data: { status: 'cancelled' },
        });
        return NextResponse.json({ success: true, delivery: serialize(delivery) });
    } catch (error) {
        console.error('Delivery cancel error:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Could not cancel the schedule.' }, { status: 500 });
    }
}
