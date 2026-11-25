/**
 * Razorpay key resolution shared by order creation and checkout resume.
 *
 * The key id is public by design; the secret never leaves the server. Prefer
 * runtime server env vars (`RAZORPAY_KEY_ID` from Worker `vars` or Cloudflare
 * context) before falling back to build-time `NEXT_PUBLIC_RAZORPAY_KEY_ID` so
 * a dev build can never leak a test key id alongside a live secret.
 */
const cfContextSymbol = Symbol.for('__cloudflare-context__');

function cleanEnvValue(value) {
    return typeof value === 'string'
        ? value.trim().replace(/^["']|["']$/g, '')
        : '';
}

export function resolveRazorpayKeys() {
    const cfEnv = globalThis[cfContextSymbol]?.env || {};
    const keyId = cleanEnvValue(
        cfEnv.RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID ||
        cfEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    );
    const secret = cleanEnvValue(cfEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET);
    if (!keyId || !secret) return { keyId: null, secret: null };

    return { keyId, secret };
}
