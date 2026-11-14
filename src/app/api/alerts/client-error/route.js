import { NextResponse } from 'next/server';
import { sendEmailAlert } from '@/lib/alerts';

// Common benign errors caused by browser translation (Google Translate),
// browser extensions, in-app webviews, network drops, or autoplay policies.
const IGNORED_ERROR_PATTERNS = [
    // External DOM mutations (Google Translate, Grammarly, Password Managers, ChatGPT/Instagram webview)
    /not a child of this node/i,
    /removeChild/i,
    /insertBefore/i,
    /appendChild/i,

    // Layout observer benign notifications
    /ResizeObserver loop/i,

    // Browser extensions
    /chrome-extension:\/\//i,
    /moz-extension:\/\//i,
    /safari-extension:\/\//i,

    // Network interrupts / aborts / ad blockers
    /AbortError/i,
    /operation was aborted/i,
    /NetworkError/i,
    /Failed to fetch/i,
    /Load failed/i,

    // Audio autoplay policy
    /play\(\) failed/i,
    /NotAllowedError/i,

    // Storage restrictions in private/incognito mode
    /QuotaExceededError/i,
];

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { error, stack, url, digest } = body;

        const errorStr = String(error || '');
        const stackStr = String(stack || '');
        const combined = `${errorStr} ${stackStr}`;

        // Filter out known client-side false positives
        if (IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(combined))) {
            return NextResponse.json({ success: true, ignored: true });
        }

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

