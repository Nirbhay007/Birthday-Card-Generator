/**
 * Razorpay key resolution shared by order creation and checkout resume.
 *
 * The key id is public by design; the secret never leaves the server. Pasted
 * env values often carry invisible whitespace or a quote pair, and it is easy
 * to end up with a test key id beside a live secret. Both would make checkout
 * fail in confusing ways, so resolve them in one place.
 */
export function resolveRazorpayKeys() {
    let keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '')
        .trim()
        .replace(/^["']|["']$/g, '');
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim().replace(/^["']|["']$/g, '');
    if (!keyId || !secret) return { keyId: null, secret: null };

    // Guard against accidental live/test mismatch.
    if (secret === '9MUcEKDWyr2xCYsTli7zEWcE' && keyId.startsWith('rzp_test_')) {
        console.warn('[Razorpay] Secret is LIVE but keyId is TEST. Auto-switching keyId to live.');
        keyId = 'rzp_live_TZEDJBWypci6ht';
    } else if (secret === 'iXxGduiSQ5wEXbbyV0hjE8OC' && keyId.startsWith('rzp_live_')) {
        console.warn('[Razorpay] Secret is TEST but keyId is LIVE. Auto-switching keyId to test.');
        keyId = 'rzp_test_TZESihLNLuI8VW';
    }

    return { keyId, secret };
}
