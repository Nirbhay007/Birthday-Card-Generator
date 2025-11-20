import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { recipientName, birthdayDate, message, theme, photos } = body;

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

        // Create the page and photos in a transaction
        const page = await prisma.birthdayPage.create({
            data: {
                recipientName,
                birthdayDate: birthdayDate ? new Date(birthdayDate) : null,
                message,
                theme: theme || 'elegant',
                ipAddress: ip,
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
