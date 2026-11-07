/**
 * Date-based scheduled delivery for the daily cron.
 *
 * Vercel Hobby accounts can only run cron jobs once per day, and their timing
 * precision is per-hour (±59 minutes). Delivery is therefore no longer a
 * "send at this exact minute" feature. Every card chosen for a calendar day
 * goes out in that day's single 03:00 UTC sweep (08:30–09:30 IST). The chosen
 * date is stored at the sweep instant, so a delayed or missed cron run still
 * sends the card on the next successful sweep.
 */

export const DELIVERY_SWEEP_HOUR_UTC = 3;
export const DELIVERY_SWEEP_LABEL = '8:30–9:30 AM IST';
export const DELIVERY_SWEEP_TIME_ZONE = 'Asia/Kolkata';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDeliveryDate(value) {
    return DATE_PATTERN.test(String(value || ''));
}

/** Convert a YYYY-MM-DD delivery date into its UTC sweep instant. */
export function deliverySweepForDate(dateString) {
    const value = String(dateString || '');
    if (!DATE_PATTERN.test(value)) return null;

    const hour = String(DELIVERY_SWEEP_HOUR_UTC).padStart(2, '0');
    const sweep = new Date(`${value}T${hour}:00:00.000Z`);
    if (Number.isNaN(sweep.getTime())) return null;

    // Reject impossible dates that JavaScript silently rolls over (Feb 31).
    if (sweep.toISOString().slice(0, 10) !== value) return null;
    return sweep;
}

/** The delivery date (YYYY-MM-DD) represented by a stored sweep instant. */
export function deliveryDateString(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

/** Today's calendar date in the app's primary delivery timezone (IST). */
export function todayInDeliveryZone(now = new Date()) {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: DELIVERY_SWEEP_TIME_ZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(now);
    } catch {
        return now.toISOString().slice(0, 10);
    }
}

/** The first date a new schedule can use: today before the sweep, else tomorrow. */
export function nextDeliveryDate(now = new Date()) {
    const today = todayInDeliveryZone(now);
    const todaySweep = deliverySweepForDate(today);
    if (todaySweep && now.getTime() < todaySweep.getTime()) return today;

    const tomorrow = new Date(`${today}T00:00:00.000Z`);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
}

/** Human-readable date in IST, used by the scheduler and assist email. */
export function formatDeliveryDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    try {
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeZone: DELIVERY_SWEEP_TIME_ZONE,
        }).format(date);
    } catch {
        return date.toISOString().slice(0, 10);
    }
}
