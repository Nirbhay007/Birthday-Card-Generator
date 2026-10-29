/**
 * Pure birthday-reminder date math. No database, no email, easy to test.
 *
 * `birthdayDate` comes from an <input type="date"> and is stored at UTC
 * midnight, so every calculation here uses UTC calendar days. That keeps the
 * "7 days before" window stable regardless of the server's local timezone.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const REMINDER_WINDOW_DAYS = 7;

/**
 * A card created two days before a birthday should not fire a reminder
 * immediately. Only birthdays at least this far after creation qualify, so
 * the creator has actually had time to forget.
 */
export const MIN_LEAD_DAYS = 30;

function utcDay(value) {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Feb 29 in a non-leap year falls back to the last valid day of February. */
function clampUtcDay(year, month, day) {
    const date = new Date(Date.UTC(year, month, day));
    if (date.getUTCMonth() !== month) {
        return new Date(Date.UTC(year, month + 1, 0));
    }
    return date;
}

/**
 * The next occurrence of the birthday's month/day on or after today (UTC).
 * Returns a Date at UTC midnight, or null for an invalid input.
 */
export function nextBirthdayOccurrence(birthdayDate, now = new Date()) {
    if (birthdayDate === null || birthdayDate === undefined || birthdayDate === '') return null;
    const source = birthdayDate instanceof Date ? birthdayDate : new Date(birthdayDate);
    const today = utcDay(now);
    if (!today || Number.isNaN(source.getTime())) return null;

    const month = source.getUTCMonth();
    const day = source.getUTCDate();
    const thisYear = clampUtcDay(today.getUTCFullYear(), month, day);
    if (thisYear.getTime() >= today.getTime()) return thisYear;
    return clampUtcDay(today.getUTCFullYear() + 1, month, day);
}

/** Whole days from today (UTC) to the next birthday. 0 means today. */
export function daysUntilBirthday(birthdayDate, now = new Date()) {
    const occurrence = nextBirthdayOccurrence(birthdayDate, now);
    const today = utcDay(now);
    if (!occurrence || !today) return null;
    return Math.round((occurrence.getTime() - today.getTime()) / DAY_MS);
}

/**
 * Decide whether a page is due for a reminder right now.
 *
 * @param {object} page  BirthdayPage fields: birthdayDate, reminderEmail,
 *                       reminderOptOutAt, reminderSentFor, createdAt.
 * @param {Date} now
 * @returns {{due: boolean, reason: string, occurrence?: Date, daysUntil?: number,
 *            birthdayYear?: number}}
 */
export function getReminderState(page, now = new Date()) {
    if (!page || typeof page !== 'object') return { due: false, reason: 'missing_page' };

    const email = typeof page.reminderEmail === 'string' ? page.reminderEmail.trim() : '';
    if (!email) return { due: false, reason: 'missing_email' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { due: false, reason: 'invalid_email' };
    if (page.reminderOptOutAt) return { due: false, reason: 'opted_out' };

    const occurrence = nextBirthdayOccurrence(page.birthdayDate, now);
    if (!occurrence) return { due: false, reason: 'missing_date' };
    const today = utcDay(now);
    const daysUntil = Math.round((occurrence.getTime() - today.getTime()) / DAY_MS);
    const birthdayYear = occurrence.getUTCFullYear();

    if (daysUntil > REMINDER_WINDOW_DAYS) {
        return { due: false, reason: 'outside_window', occurrence, daysUntil, birthdayYear };
    }

    if (page.reminderSentFor === birthdayYear) {
        return { due: false, reason: 'already_sent', occurrence, daysUntil, birthdayYear };
    }

    const createdAt = page.createdAt ? new Date(page.createdAt) : null;
    const createdDay = createdAt && !Number.isNaN(createdAt.getTime()) ? utcDay(createdAt) : null;
    if (createdDay) {
        // Compare UTC calendar days, not milliseconds: a card made 30 days
        // before the birthday should qualify even if it was made in the
        // afternoon.
        const leadDays = Math.round((occurrence.getTime() - createdDay.getTime()) / DAY_MS);
        if (leadDays < MIN_LEAD_DAYS) {
            return { due: false, reason: 'too_new', occurrence, daysUntil, birthdayYear };
        }
    }

    return { due: true, reason: 'due', occurrence, daysUntil, birthdayYear };
}
