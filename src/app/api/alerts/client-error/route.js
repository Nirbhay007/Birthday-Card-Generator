import { NextResponse } from 'next/server';
import { sendEmailAlert } from '@/lib/alerts';

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { error, stack, url, digest } = body;

        let path = 'page';
        try {
            if (url) path = new URL(url, 'https://birthday.nirbhay.online').pathname;
        } catch { }

        const title = `Page Crash: ${path}`;
        const message = `
<strong>Error:</strong> ${error || 'Unknown client/render error'}<br/>
${digest ? `<strong>Next.js Digest:</strong> ${digest}<br/>` : ''}
<strong>URL:</strong> ${url || 'Unknown'}<br/>
${stack ? `<pre style="background:#222;padding:10px;border-radius:6px;overflow-x:auto;font-size:11px;color:#fca5a5;margin-top:12px;">${stack.slice(0, 1000)}</pre>` : ''}
        `.trim();

        await sendEmailAlert({
            title,
            message,
            level: 'critical',
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Alert reporting error:', err);
        return NextResponse.json({ success: false }, { status: 200 });
    }
}

