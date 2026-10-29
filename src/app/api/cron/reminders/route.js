import { NextResponse } from 'next/server';
import { runReminders } from '@/lib/reminders';

/**
 * GET /api/cron/reminders — daily annual-birthday reminder sweep.
 *
 * Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET` (set in
 * vercel.json). In production the secret is required: without it this route
 * refuses to run, so the endpoint can never be used as an open email trigger.
 * Local development may run without a secret; `?dryRun=1` reports what would
 * be sent without writing or emailing anything.
 */

export const maxDuration = 60;

export async function GET(request) {
    const secret = (process.env.CRON_SECRET || '').trim();
    const authHeader = request.headers.get('authorization') || '';

    if (!secret && process.env.NODE_ENV === 'production') {
        console.error('[Reminders] CRON_SECRET is not set; refusing to run in production.');
        return NextResponse.json(
            { success: false, error: 'CRON_SECRET is not configured.' },
            { status: 503 }
        );
    }
    if (secret && authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dryRunParam = searchParams.get('dryRun');
    const dryRun = dryRunParam === '1' || dryRunParam === 'true';

    try {
        const result = await runReminders({ dryRun });
        if (result.failed > 0) {
            console.error('[Reminders] completed with failures:', result.failures);
        }
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('[Reminders] run failed:', error?.message || error);
        return NextResponse.json({ success: false, error: 'Reminder run failed.' }, { status: 500 });
    }
}
