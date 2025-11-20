import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
    try {
        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        // Validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ success: false, error: 'Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.' }, { status: 400 });
        }

        if (file.size > 4.5 * 1024 * 1024) { // 4.5MB limit
            return NextResponse.json({ success: false, error: 'File size too large. Max 4.5MB allowed.' }, { status: 400 });
        }

        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name}`;

        const blob = await put(filename, file, {
            access: 'public',
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
