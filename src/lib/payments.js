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

export const PREMIUM_PRICE_INR = {
    amount: 49,
    currency: 'INR',
    label: '₹49',
    method: 'upi',
    // Display-only anchoring (server charges `amount` — never the MRP).
    mrp: 199,
    mrpLabel: '₹199',
    off: '75% OFF',
    saveLabel: 'Save ₹150',
};
export const PREMIUM_PRICE_INTL = {
    amount: 1,
    currency: 'USD',
    label: '$1',
    method: 'card',
    // Display-only anchoring (server charges `amount` — never the MRP).
    mrp: 3,
    mrpLabel: '$3',
    off: '67% OFF',
    saveLabel: 'Save $2',
};

export const VIP_CARD_PRICE_INR = {
    amount: 29,
    currency: 'INR',
    label: '₹29',
    method: 'upi',
    mrp: 99,
    mrpLabel: '₹99',
    off: '70% OFF',
    saveLabel: 'Save ₹70',
};

export const VIP_CARD_PRICE_INTL = {
    amount: 1,
    currency: 'USD',
    label: '$1',
    method: 'card',
    mrp: 3,
    mrpLabel: '$3',
    off: '67% OFF',
    saveLabel: 'Save $2',
};

/**
 * Best-effort home-country detection. Timezone is the strongest free signal
 * (locale/language can lie when the user prefers English). Anything that is
 * not clearly India is treated as international — safer for FX compliance.
 */
export function detectRegion(timeZone) {
    try {
        const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (/asia\/kolkata|asia\/calcutta/i.test(tz)) return 'IN';
    } catch { }
    return 'INTL';
}

export function getPremiumPrice(region) {
    return region === 'IN' ? PREMIUM_PRICE_INR : PREMIUM_PRICE_INTL;
}

export function getVipCardPrice(region) {
    return region === 'IN' ? VIP_CARD_PRICE_INR : VIP_CARD_PRICE_INTL;
}

/**
 * Buyer receipt details (email / phone) kept only in this browser.
 *
 * Why: Razorpay forces a mandatory contact step before payment methods. If we
 * already have the buyer's details, we can prefill it and skip a screen. The
 * same value is stored on the PremiumOrder row at creation, so support can
 * reach a buyer even when the modal never completes.
 */
const BUYER_CONTACT_KEY = 'bgen-buyer-contact-v1';

function cleanContactPart(value, max) {
    if (typeof value !== 'string') return '';
    return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

export function loadBuyerContact() {
    if (typeof window === 'undefined') return { name: '', email: '', phone: '' };
    try {
        const parsed = JSON.parse(localStorage.getItem(BUYER_CONTACT_KEY) || '{}');
        return {
            name: cleanContactPart(parsed?.name, 80),
            email: cleanContactPart(parsed?.email, 120),
            phone: cleanContactPart(parsed?.phone, 40),
        };
    } catch {
        return { name: '', email: '', phone: '' };
    }
}

export function saveBuyerContact(contact = {}) {
    const clean = {
        name: cleanContactPart(contact.name, 80),
        email: cleanContactPart(contact.email, 120),
        phone: cleanContactPart(contact.phone, 40),
    };
    if (typeof window === 'undefined') return clean;
    try {
        if (!clean.name && !clean.email && !clean.phone) localStorage.removeItem(BUYER_CONTACT_KEY);
        else localStorage.setItem(BUYER_CONTACT_KEY, JSON.stringify(clean));
    } catch { }
    return clean;
}

/** "email · phone" summary for the order row and support views. */
export function formatBuyerContact(contact = {}) {
    return [cleanContactPart(contact.email, 120), cleanContactPart(contact.phone, 40)]
        .filter(Boolean)
        .join(' / ') || null;
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
export async function createPremiumOrder(region, { tier = 'universe', pageId = null, snapshotUrl = null, buyerContact = null } = {}) {
    const r = await fetch('/api/premium/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            region: region === 'INTL' ? 'INTL' : 'IN',
            tier,
            pageId,
            snapshotUrl,
            ...(buyerContact ? { buyerContact } : {}),
        }),
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

/**
 * Best-effort failure report. Uses sendBeacon so a failure that happens as the
 * tab is closing (common on mobile) still reaches the server. Never throws and
 * never blocks the checkout UI.
 */
function reportCheckoutFailure(order, { code, reason, method } = {}) {
    try {
        const orderId = order?.orderId;
        const token = order?.pollToken;
        if (!orderId || !token) return;

        const body = JSON.stringify({
            orderId,
            token,
            code: code || 'PAYMENT_FAILED',
            reason: reason || null,
            method: method || null,
        });

        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            try {
                const blob = new Blob([body], { type: 'application/json' });
                if (navigator.sendBeacon('/api/premium/failure', blob)) return;
            } catch { }
        }
        fetch('/api/premium/failure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => { });
    } catch { }
}

/**
 * How often to re-check whether Razorpay's checkout iframe is still mounted
 * after a decline. `payment.failed` deliberately does not reject the promise
 * (the buyer gets one retry), but if the SDK closes the modal without firing
 * `ondismiss`, nothing else would ever settle it. Watching the iframe lets us
 * settle on close without cutting a live retry short.
 */
const FAILURE_RECHECK_MS = 15_000;

function checkoutFrameMounted() {
    if (typeof document === 'undefined') return false;
    try {
        return !!document.querySelector('iframe[src*="api.razorpay.com/v1/checkout/public"]');
    } catch {
        return false;
    }
}

export async function openRazorpayCheckout({ order, keyId, buyerName = '', buyerEmail = '', buyerPhone = '', region = 'IN' }) {
    const Razorpay = await loadRazorpay();
    return new Promise((resolve, reject) => {
        let settled = false;
        let lastFailure = null;
        let failureTimer = null;

        const finish = (fn, value) => {
            if (settled) return;
            settled = true;
            if (failureTimer) {
                clearTimeout(failureTimer);
                failureTimer = null;
            }
            fn(value);
        };

        const settleFailure = () => {
            failureTimer = null;
            if (settled || !lastFailure) return;

            // Still on screen: the buyer may be correcting their card details
            // or retrying, so wait. Only settle once the modal has gone away.
            if (checkoutFrameMounted()) {
                failureTimer = setTimeout(settleFailure, FAILURE_RECHECK_MS);
                return;
            }

            const err = new Error(lastFailure.message);
            err.code = lastFailure.code;
            err.razorpay = lastFailure.raw;
            finish(reject, err);
        };

        const rzp = new Razorpay({
            key: keyId,
            order_id: order.orderId,
            amount: order.amount,
            currency: order.currency,
            name: 'BirthdayGen Premium',
            description: 'Premium Birthday Universe: lifetime access',
            prefill: {
                name: buyerName,
                ...(buyerEmail ? { email: buyerEmail } : {}),
                ...(buyerPhone ? { contact: buyerPhone } : {}),
            },
            theme: { color: '#7c3aed', backdrop_color: 'rgba(7,4,18,0.8)' },
            retry: { enabled: true, max_count: 1 },
            timeout: 600,
            // UPI first at home (verifiable via Razorpay, unlike raw intents),
            // cards everywhere; wallets/netbanking as backup in India.
            config: region === 'IN'
                ? { display: { blocks: { upi: { name: 'UPI', instruments: [{ method: 'upi' }] }, card: { name: 'Card', instruments: [{ method: 'card' }] }, other: { name: 'More', instruments: [{ method: 'netbanking' }, { method: 'wallet' }] } }, sequence: ['block.upi', 'block.card', 'block.other'], preferences: { show_default_blocks: false } } }
                : undefined,
            handler: (resp) => finish(resolve, resp), // verify server-side via /api/premium/verify
            modal: {
                ondismiss: () => {
                    // A concrete failure was already recorded for this attempt;
                    // don't let the close event overwrite it with DISMISSED.
                    if (lastFailure) {
                        const err = new Error(lastFailure.message);
                        err.code = lastFailure.code;
                        err.razorpay = lastFailure.raw;
                        finish(reject, err);
                        return;
                    }
                    reportCheckoutFailure(order, {
                        code: 'DISMISSED',
                        reason: 'Checkout window closed before payment completed',
                    });
                    const err = new Error('Payment window closed. No money moved.');
                    err.code = 'DISMISSED';
                    finish(reject, err);
                },
            },
        });

        rzp.on('payment.failed', (e) => {
            const raw = e?.error || {};
            const code = String(raw.code || raw.reason || 'PAYMENT_FAILED').slice(0, 60);
            const reason = String(raw.description || raw.reason || 'Payment failed').replace(/\s+/g, ' ').trim().slice(0, 300);
            const method = typeof raw.method === 'string' ? raw.method : null;

            lastFailure = {
                code,
                reason,
                method,
                raw,
                message: `${reason}${/[.!?]$/.test(reason) ? '' : '.'} No money moved — you can try another card.`,
            };

            reportCheckoutFailure(order, { code, reason, method });

            // Do NOT reject here: Razorpay keeps its modal open and offers one
            // retry. The promise settles on success (handler), on close
            // (ondismiss), or — if the SDK closes without firing ondismiss —
            // when settleFailure sees the iframe disappear.
            if (failureTimer) clearTimeout(failureTimer);
            failureTimer = setTimeout(settleFailure, FAILURE_RECHECK_MS);
        });

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

/**
 * Poll /api/premium/order/status until the order is paid or we give up.
 *
 * Used for UPI recovery — mobile browsers frequently kill background tabs
 * when the user switches to their UPI app to authorise payment. The Razorpay
 * JS callback never fires, but the server-side webhook confirms capture.
 * This poller bridges the gap.
 *
 * @param {string}         orderId     Razorpay order ID (e.g. order_Tj3R9Sb6D4kUHz)
 * @param {Object}         opts
 * @param {string}         opts.token        Per-order pollToken issued by /api/premium/order
 * @param {number}         opts.maxAttempts  Max number of polls (default 20 → ~60 s)
 * @param {number}         opts.intervalMs   Delay between polls in ms (default 3000)
 * @param {AbortSignal}    opts.signal       Optional AbortSignal to cancel early
 * @returns {Promise<{paid: true, unlockKey: string, pageId?: string} | null>}
 */
export async function pollOrderStatus(orderId, { token = '', maxAttempts = 20, intervalMs = 3000, signal } = {}) {
    for (let i = 0; i < maxAttempts; i++) {
        if (signal?.aborted) return null;
        try {
            const qs = `orderId=${encodeURIComponent(orderId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
            const r = await fetch(`/api/premium/order/status?${qs}`);
            const d = await r.json();
            if (d.paid && d.unlockKey) return d;
        } catch {}
        if (i < maxAttempts - 1) {
            await new Promise((resolve) => {
                const t = setTimeout(resolve, intervalMs);
                if (signal) {
                    const onAbort = () => { clearTimeout(t); resolve(); };
                    signal.addEventListener('abort', onAbort, { once: true });
                }
            });
        }
    }
    return null;
}
