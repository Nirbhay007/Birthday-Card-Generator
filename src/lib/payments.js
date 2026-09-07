/**
 * Premium paywall — pricing, geo-detection & checkout entry points.
 *
 * Model: ₹49 in India · $1 everywhere else, both via Razorpay Checkout
 * (UPI + cards + netbanking, auto FX settlement to your Indian bank).
 * Needs RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (server) + NEXT_PUBLIC_RAZORPAY_KEY_ID
 * (client); without them checkout degrades to clearly-labelled test mode.
 */

export const PREMIUM_PRODUCT = {
    id: 'birthday-premium-universe',
    name: 'Premium Birthday Universe',
};

export const PREMIUM_PRICE_INR = { amount: 49, currency: 'INR', label: '₹49', method: 'upi' };
export const PREMIUM_PRICE_INTL = { amount: 1, currency: 'USD', label: '$1', method: 'card' };

/**
 * Best-effort home-country detection. Timezone is the strongest free signal
 * (locale/language can lie when the user prefers English). Anything that is
 * not clearly India is treated as international — safer for FX compliance.
 */
export function detectRegion(timeZone) {
    try {
        const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (/asia\/kolkata|asia\/calcutta/i.test(tz)) return 'IN';
    } catch {}
    return 'INTL';
}

export function getPremiumPrice(region) {
    return region === 'IN' ? PREMIUM_PRICE_INR : PREMIUM_PRICE_INTL;
}

export function buildPremiumUpiUrl(payeeId, note = 'BirthdayGen Premium') {
    const params = new URLSearchParams({
        pa: payeeId,
        pn: 'BirthdayGen',
        cu: 'INR',
        am: String(PREMIUM_PRICE_INR.amount),
        tn: note,
    });
    return `upi://pay?${params.toString()}`;
}

/**
 * International card checkout via Razorpay (supports 100+ currencies with
 * auto FX settlement to your Indian bank account).
 *
 * Setup: set NEXT_PUBLIC_RAZORPAY_KEY_ID (+ server-side RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET for /api/premium/verify). Until then this rejects with
 * a human-readable message and the UI falls back to test-mode unlock.
 */
let razorpayLoading = null;

function loadRazorpay() {
    if (typeof window === 'undefined') return Promise.reject(new Error('Checkout needs a browser.'));
    if (window.Razorpay) return Promise.resolve(window.Razorpay);
    if (!razorpayLoading) {
        razorpayLoading = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.async = true;
            s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay failed to load.')));
            s.onerror = () => reject(new Error('Could not reach Razorpay. Check your connection.'));
            document.body.appendChild(s);
        });
    }
    return razorpayLoading;
}

/**
 * Best-way checkout (2026): server creates the ORDER (price fixed server-side),
 * Razorpay Checkout collects UPI / cards / netbanking, server verifies the
 * signature. Client never decides the amount.
 *
 * @param {'IN'|'INTL'} region
 * @returns {Promise<{orderId, paymentId, signature}>} — POST to /api/premium/verify
 * @throws {Error} with `code === 'TEST_MODE'` when server keys are missing.
 */
export async function createPremiumOrder(region) {
    const r = await fetch('/api/premium/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: region === 'INTL' ? 'INTL' : 'IN' }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 503 || d.testMode) {
        const err = new Error(d.error || 'Live payments are not connected yet.');
        err.code = 'TEST_MODE';
        throw err;
    }
    if (!d.success || !d.orderId) throw new Error(d.error || 'Could not start checkout.');
    return d;
}

export async function openRazorpayCheckout({ order, keyId, buyerName = '', buyerEmail = '', region = 'IN' }) {
    const Razorpay = await loadRazorpay();
    return new Promise((resolve, reject) => {
        const rzp = new Razorpay({
            key: keyId,
            order_id: order.orderId,
            amount: order.amount,
            currency: order.currency,
            name: 'BirthdayGen Premium',
            description: 'Premium Birthday Universe — lifetime access',
            prefill: { name: buyerName, email: buyerEmail },
            theme: { color: '#7c3aed', backdrop_color: 'rgba(7,4,18,0.8)' },
            retry: { enabled: true, max_count: 1 },
            timeout: 600,
            // UPI first at home (verifiable via Razorpay, unlike raw intents),
            // cards everywhere; wallets/netbanking as backup in India.
            config: region === 'IN'
                ? { display: { blocks: { upi: { name: 'UPI', instruments: [{ method: 'upi' }] }, card: { name: 'Card', instruments: [{ method: 'card' }] }, other: { name: 'More', instruments: [{ method: 'netbanking' }, { method: 'wallet' }] } }, sequence: ['block.upi', 'block.card', 'block.other'], preferences: { show_default_blocks: false } } }
                : undefined,
            handler: (resp) => resolve(resp), // verify server-side via /api/premium/verify
            modal: { ondismiss: () => reject(new Error('Payment window closed. No money moved.')) },
        });
        rzp.on('payment.failed', (e) => reject(new Error(e?.error?.description || 'Payment failed. No money moved.')));
        rzp.open();
    });
}

export async function verifyPremiumPayment(payload) {
    let r;
    try {
        r = await fetch('/api/premium/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch {
        // Network died AFTER a possible Razorpay success: the money may have
        // moved. Never invite a retry here — point at support instead.
        const err = new Error(
            'We lost connection while confirming. If money left your account, do NOT pay again. WhatsApp us your payment ID below and we will unlock you.'
        );
        err.code = 'VERIFY_UNKNOWN';
        throw err;
    }
    const d = await r.json().catch(() => ({}));
    if (!d.success) throw new Error(d.error || 'Verification failed.');
    return d;
}
