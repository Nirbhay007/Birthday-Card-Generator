/**
 * Donation config + UPI helpers (pure logic, unit-tested in Node).
 * Override the payee without a deploy: NEXT_PUBLIC_UPI_ID + NEXT_PUBLIC_UPI_NAME.
 */

export const UPI_ID =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_UPI_ID) ||
    'nirbhaysinghbe1-2@okhdfcbank';

export const UPI_PAYEE_NAME =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_UPI_NAME) ||
    'BirthdayGen';

export const SUPPORT_AMOUNTS = [29, 99, 249];

export function buildUpiUrl(payeeId = UPI_ID, amount, note = 'Support BirthdayGen') {
    const params = new URLSearchParams({
        pa: payeeId,
        pn: UPI_PAYEE_NAME,
        cu: 'INR',
        tn: note,
    });
    const n = typeof amount === 'number' ? amount : parseInt(amount, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 100000) {
        params.set('am', String(Math.trunc(n)));
    }
    return `upi://pay?${params.toString()}`;
}

export function upiQrUrl(upiUrl, size = 200) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiUrl)}`;
}
