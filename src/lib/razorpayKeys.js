/**
 * Razorpay key resolution shared by order creation and checkout resume.
 *
 * The key id is public by design; the secret never leaves the server. Pasted
 * env values often carry invisible whitespace or a quote pair, so resolve them
 * in one place.
 *
 * Secrets are env-only. Never hardcode a key or secret here: this repository
 * is public, and a committed secret must be rotated in the Razorpay dashboard.
 */
export function resolveRazorpayKeys() {
    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '')
        .trim()
        .replace(/^["']|["']$/g, '');
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim().replace(/^["']|["']$/g, '');

    if (!keyId || !secret) return { keyId: null, secret: null };

    // A test key in production means every real checkout fails. Warn loudly,
    // but do not try to guess or swap in another key pair.
    if (process.env.NODE_ENV === 'production' && keyId.startsWith('rzp_test_')) {
        console.warn('[Razorpay] Production is using a TEST key id; live payments will not work.');
    }

    return { keyId, secret };
}
