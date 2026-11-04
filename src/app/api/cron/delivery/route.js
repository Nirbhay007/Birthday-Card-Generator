import { NextResponse } from 'next/server';
import { runDeliveries } from '@/lib/deliveries';

/**
 * GET /api/cron/delivery — scheduled card delivery sweep.
 *
 * Runs every 5 minutes. Sends due cards to recipient emails, or emails the
 * creator a WhatsApp-assist link when no recipient email is known. Protected
 * by CRON_SECRET in production; `?dryRun=1` reports without sending.
 */
export const maxDuration = 60;

export async function GET(request) {
    const secret = (process.env.CRON_SECRET || '').trim();
    const authHeader = request.headers.get('authorization') || '';

    if (!secret && process.env.NODE_ENV === 'production') {
        console.error('[Delivery] CRON_SECRET is not set; refusing to run in production.');
        return NextResponse.json({ success: false, error: 'CRON_SECRET is not configured.' }, { status: 503 });
    }
    if (secret && authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dryRun = ['1', 'true'].includes(searchParams.get('dryRun'));

    try {
        const result = await runDeliveries({ dryRun });
        if (result.failed > 0) console.error('[Delivery] completed with failures:', result.failures);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('[Delivery] run failed:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Delivery run failed.' }, { status: 500 });
    }
}
