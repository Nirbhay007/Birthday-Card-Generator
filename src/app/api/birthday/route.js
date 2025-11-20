import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { recipientName, birthdayDate, message, theme, photos } = body;

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
