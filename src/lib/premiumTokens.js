import crypto from 'crypto';

/**
 * Per-order bearer token for the order-status poller and failure reporting.
 *
 * Derivation: HMAC-SHA256(RAZORPAY_KEY_SECRET, `poll:<orderId>`).
 * The token is returned only to the browser that created the order, so
 * knowing a bare order id can never fetch an unlock key or write failure data.
 */
export function pollTokenFor(orderId) {
    const secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    return crypto.createHmac('sha256', secret).update(`poll:${orderId}`).digest('hex');
}

/** Constant-time hex/string comparison. */
export function safeEqual(expected, provided) {
    if (typeof provided !== 'string' || provided.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
        diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
    }
    return diff === 0;
}
