/**
 * Calendar-day helpers for card dates.
 *
 * `birthdayDate` is stored as UTC midnight of the chosen calendar day, so it
 * must never be compared as an instant: 2026-11-01T00:00Z already reads as
 * "late yesterday" for a buyer in India at 05:30 on Nov 1. Compare calendar
 * days instead, in the app's primary market timezone, so the whole birthday
 * still counts as "today".
 */

const CARD_TIMEZONE = 'Asia/Kolkata';

export function calendarDay(date, timeZone = CARD_TIMEZONE) {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(d);
    } catch {
        return d.toISOString().slice(0, 10);
    }
}

/**
 * True while the occasion is today or still ahead. Undated cards stay
 * eligible because there is no occasion to be late for.
 */
export function isBirthdayRelevant(birthdayDate, now = new Date()) {
    if (!birthdayDate) return true;
    const day = calendarDay(birthdayDate);
    if (!day) return true;
    return calendarDay(now) <= day;
}
