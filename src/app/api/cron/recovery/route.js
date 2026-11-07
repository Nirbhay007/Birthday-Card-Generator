import { NextResponse } from 'next/server';
import { runRecovery } from '@/lib/recovery';

/**
 * GET /api/cron/recovery — daily abandoned-checkout sweep.
 *
 * Runs once a day at 06:00 UTC. Sends at most one email per unpaid order,
 * between 24 hours and 7 days after it was created. Protected by CRON_SECRET
 * in production; `?dryRun=1` reports what would be sent without claiming or
 * emailing anything.
 */
export const maxDuration = 60;

export async function GET(request) {
    const secret = (process.env.CRON_SECRET || '').trim();
    const authHeader = request.headers.get('authorization') || '';

    if (!secret && process.env.NODE_ENV === 'production') {
        console.error('[Recovery] CRON_SECRET is not set; refusing to run in production.');
        return NextResponse.json({ success: false, error: 'CRON_SECRET is not configured.' }, { status: 503 });
    }
    if (secret && authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dryRun = ['1', 'true'].includes(searchParams.get('dryRun'));

    try {
        const result = await runRecovery({ dryRun });
        if (result.failed > 0) console.error('[Recovery] completed with failures:', result.failures);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('[Recovery] run failed:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Recovery run failed.' }, { status: 500 });
    }
}
