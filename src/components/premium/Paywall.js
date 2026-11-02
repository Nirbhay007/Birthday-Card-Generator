'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
    Zap, Loader2, FlaskConical, Globe2, MapPin, Mail, Phone, Images, Film, Link2,
    ShieldCheck, Check, Lock, Crown, Sparkles, RotateCcw,
} from 'lucide-react';
import {
    detectRegion,
    getPremiumPrice,
    PREMIUM_PRICE_INR,
    PREMIUM_PRICE_INTL,
    createPremiumOrder,
    openRazorpayCheckout,
    verifyPremiumPayment,
    pollOrderStatus,
    loadBuyerContact,
    saveBuyerContact,
    formatBuyerContact,
} from '@/lib/payments';
import { track } from '@/lib/track';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

/** localStorage key for surviving browser-kill during UPI app switch. */
const PENDING_ORDER_KEY = 'bgen-premium-pending-v1';

const emptySubscribe = () => () => {};

function validEmail(value) {
    return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
    return !value || /^[+()\d][\d\s().-]{5,24}$/.test(value);
}

/**
 * One-button checkout. Server creates a tamper-proof order, Razorpay collects
 * UPI/cards/netbanking, server verifies the signature, universe unlocks.
 *
 * The wall sells the outcome visually: free card vs premium card side by side,
 * a keepsake sample, and one honest price. Contact details are inline (not
 * hidden behind an "optional" link) because they are what lets us recover an
 * interrupted UPI checkout — the single biggest leak in the funnel.
 */
export default function Paywall({ onUnlocked, recipientName = '' }) {
    // Lazy init keeps SSR deterministic (server TZ → INTL, i.e. $1 for
    // crawlers); suppressHydrationWarning below lets the client region win.
    const [region, setRegion] = useState(() => detectRegion());
    const [status, setStatus] = useState({ phase: 'idle', message: '' });
    const [testMode, setTestMode] = useState(false);
    const [showStickyCta, setShowStickyCta] = useState(false);
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [contactError, setContactError] = useState('');
    const [resume, setResume] = useState(null);
    const [resumeLoading, setResumeLoading] = useState(false);
    const opened = useRef(false);
    const contactTracked = useRef(false);
    const sectionRef = useRef(null);
    const ctaRef = useRef(null);
    const price = getPremiumPrice(region);
    const verifying = status.phase === 'verifying';
    const name = String(recipientName || '').trim();
    const shortName = name && name.length > 12 ? `${name.slice(0, 10)}…` : name;
    const who = shortName || 'them';

    useEffect(() => {
        const saved = loadBuyerContact();
        // Hydration-safe: this runs after mount, never during SSR.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved.email || saved.phone) setContact(saved);
    }, []);

    useEffect(() => {
        if (opened.current) return;
        opened.current = true;
        track('paywall_open');
    }, []);

    // ---- SIGNED RECOVERY LINK ----
    // The abandoned-checkout email links back here with the exact order id and
    // its poll token. We re-open that same order instead of creating a new one.
    const resumeCheckedRef = useRef(false);
    useEffect(() => {
        if (resumeCheckedRef.current) return;
        resumeCheckedRef.current = true;
        let q;
        try { q = new URLSearchParams(window.location.search); } catch { return; }
        const orderId = q.get('resume');
        const rt = q.get('rt');
        if (!orderId || !rt) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResumeLoading(true);
        fetch(`/api/premium/order/resume?orderId=${encodeURIComponent(orderId)}&rt=${encodeURIComponent(rt)}`)
            .then((r) => r.json())
            .then((data) => {
                if (!data?.success || data.paid || !data.keyId) return;
                setResume({ ...data.order, keyId: data.keyId, pollToken: rt });
                track('paywall_resume_shown');
            })
            .catch(() => { })
            .finally(() => setResumeLoading(false));
    }, []);

    // ---- UPI RECOVERY ----
    // If the browser died during a UPI app switch, the pending order is still
    // in localStorage. Poll the server to see if the webhook already confirmed
    // payment, and auto-unlock if so. Runs only once on mount.
    const recoveredRef = useRef(false);
    useEffect(() => {
        if (recoveredRef.current) return;
        recoveredRef.current = true;
        (async () => {
            let raw;
            try { raw = localStorage.getItem(PENDING_ORDER_KEY); } catch { return; }
            if (!raw) return;
            let pending;
            try { pending = JSON.parse(raw); } catch { try { localStorage.removeItem(PENDING_ORDER_KEY); } catch { } return; }
            const { orderId, pollToken, ts } = pending || {};
            if (!orderId || !pollToken || Date.now() - (ts || 0) > 10 * 60 * 1000) {
                try { localStorage.removeItem(PENDING_ORDER_KEY); } catch { }
                return;
            }
            setStatus({ phase: 'verifying', message: 'Checking your previous payment…' });
            const result = await pollOrderStatus(orderId, { token: pollToken, maxAttempts: 10, intervalMs: 2000 });
            if (result?.unlockKey) {
                try { localStorage.removeItem(PENDING_ORDER_KEY); } catch { }
                track('premium_unlock');
                onUnlocked?.({ testMode: false, unlockKey: result.unlockKey, receiptKept: true });
            } else {
                try { localStorage.removeItem(PENDING_ORDER_KEY); } catch { }
                setStatus({ phase: 'idle', message: '' });
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Sticky mobile CTA ----
    // The re-offer appears only between "wall is on screen" and "main button
    // is on screen": never a duplicate button, never a nag after the wall.
    useEffect(() => {
        const cta = ctaRef.current;
        const section = sectionRef.current;
        if (!cta || !section || typeof IntersectionObserver === 'undefined') return;
        let ctaVisible = false;
        let sectionVisible = false;
        const update = () => setShowStickyCta(sectionVisible && !ctaVisible);
        const ctaObs = new IntersectionObserver(([e]) => {
            ctaVisible = e.isIntersecting;
            update();
        }, { threshold: 0.55 });
        const sectionObs = new IntersectionObserver(([e]) => {
            sectionVisible = e.isIntersecting;
            update();
        }, { threshold: 0.04 });
        ctaObs.observe(cta);
        sectionObs.observe(section);
        return () => {
            ctaObs.disconnect();
            sectionObs.disconnect();
        };
    }, []);

    // Tell the rest of the page (PremiumExperience's floating Watch Cinema
    // pill) when this bar is on screen, so two CTAs never stack in one corner.
    useEffect(() => {
        try {
            window.dispatchEvent(new CustomEvent('bgen:paywall_sticky', { detail: { visible: showStickyCta } }));
        } catch { }
        return () => {
            try {
                window.dispatchEvent(new CustomEvent('bgen:paywall_sticky', { detail: { visible: false } }));
            } catch { }
        };
    }, [showStickyCta]);

    const fail = (message) => setStatus({ phase: 'error', message });

    const validateContact = () => {
        const email = contact.email.trim();
        const phone = contact.phone.trim();
        if (!validEmail(email)) {
            setContactError('That email looks incomplete. Fix it or leave it blank.');
            return null;
        }
        if (!validPhone(phone)) {
            setContactError('That phone number looks incomplete. Fix it or leave it blank.');
            return null;
        }
        setContactError('');
        const saved = saveBuyerContact({ ...contact, email, phone });
        if ((email || phone) && !contactTracked.current) {
            contactTracked.current = true;
            track('paywall_contact_added');
        }
        return saved;
    };

    const finishUnlock = (receipt) => {
        try { localStorage.removeItem(PENDING_ORDER_KEY); } catch { }
        track('premium_unlock');
        onUnlocked?.({ testMode: false, unlockKey: receipt?.unlockKey || null, receiptKept: !!receipt?.unlockKey });
    };

    const checkout = async () => {
        if (verifying) return;

        // This counts every checkout attempt, including the sticky re-offer.
        track('paywall_cta_click');

        const savedContact = validateContact();
        if (!savedContact) return;
        const buyerContact = formatBuyerContact(savedContact);

        setStatus({ phase: 'verifying', message: 'Contacting secure checkout…' });
        try {
            const snapshotUrl = typeof window !== 'undefined' ? window.location.href : '';
            let order;
            try {
                order = await createPremiumOrder(region, { snapshotUrl, buyerContact });
            } catch (orderErr) {
                if (orderErr?.code !== 'TEST_MODE') track('order_create_failed');
                throw orderErr;
            }
            // Persist order ID + poll token so we can recover if the browser dies during UPI app switch.
            try { localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId: order.orderId, pollToken: order.pollToken, ts: Date.now() })); } catch { }
            track('checkout_start', { amount: price.amount });
            setStatus({ phase: 'verifying', message: 'Opening secure checkout…' });

            // Background poll catches payments the Razorpay JS callback misses
            // (common with UPI intent on mobile: tab killed during app switch).
            const abort = new AbortController();
            const poll = pollOrderStatus(order.orderId, { token: order.pollToken, signal: abort.signal });

            let callbackOk = false;
            try {
                const resp = await openRazorpayCheckout({
                    order,
                    keyId: order.keyId,
                    region,
                    buyerEmail: savedContact.email,
                    buyerPhone: savedContact.phone,
                });
                callbackOk = true;
                abort.abort();
                setStatus({ phase: 'verifying', message: 'Confirming your payment…' });
                const receipt = await verifyPremiumPayment({
                    provider: 'razorpay',
                    orderId: resp.razorpay_order_id,
                    paymentId: resp.razorpay_payment_id,
                    signature: resp.razorpay_signature,
                    snapshotUrl,
                });
                finishUnlock(receipt);
            } catch (modalErr) {
                if (callbackOk) { fail(modalErr?.message || 'Verification failed.'); return; }

                // A concrete decline (card rejected, 3DS failed, …) means no
                // money is pending. Show the real reason immediately instead
                // of making the buyer wait through the UPI recovery window.
                if (modalErr?.code && modalErr.code !== 'DISMISSED') {
                    abort.abort();
                    fail(modalErr?.message || 'Payment failed. No money moved.');
                    return;
                }

                // Razorpay modal dismissed — the payment may still have gone through
                // via UPI. Give the background poll a few more seconds to catch it.
                setStatus({ phase: 'verifying', message: 'Checking payment status…' });
                const pollResult = await Promise.race([
                    poll,
                    new Promise((r) => setTimeout(() => r(null), 15_000)),
                ]);
                abort.abort();
                if (pollResult?.unlockKey) {
                    finishUnlock(pollResult);
                } else {
                    // Keep PENDING_ORDER_KEY for mount-recovery on next visit.
                    fail('Payment window closed. If money was deducted, it will unlock automatically when you revisit this page.');
                }
            }
        } catch (e) {
            if (e?.code === 'TEST_MODE') {
                setTestMode(true);
                setStatus({ phase: 'idle', message: '' });
            } else {
                fail(e?.message || 'Checkout failed. No money moved.');
            }
        }
    };

    // Resume the exact unpaid order from the recovery email. Same Razorpay
    // order id, same amount — no duplicate order, no double charge.
    const resumeCheckout = async () => {
        if (!resume || verifying) return;
        track('paywall_resume_click');
        const savedContact = validateContact();
        if (!savedContact) return;

        setStatus({ phase: 'verifying', message: 'Reopening your saved checkout…' });
        const abort = new AbortController();
        const poll = pollOrderStatus(resume.orderId, { token: resume.pollToken, signal: abort.signal });
        let callbackOk = false;
        try {
            const resp = await openRazorpayCheckout({
                order: resume,
                keyId: resume.keyId,
                region: resume.currency === 'INR' ? 'IN' : 'INTL',
                buyerEmail: savedContact.email,
                buyerPhone: savedContact.phone,
            });
            callbackOk = true;
            abort.abort();
            setStatus({ phase: 'verifying', message: 'Confirming your payment…' });
            const receipt = await verifyPremiumPayment({
                provider: 'razorpay',
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
                snapshotUrl: typeof window !== 'undefined' ? window.location.href : '',
            });
            finishUnlock(receipt);
        } catch (modalErr) {
            if (callbackOk) { fail(modalErr?.message || 'Verification failed.'); return; }
            if (modalErr?.code && modalErr.code !== 'DISMISSED') {
                abort.abort();
                fail(modalErr?.message || 'Payment failed. No money moved.');
                return;
            }
            setStatus({ phase: 'verifying', message: 'Checking payment status…' });
            const pollResult = await Promise.race([
                poll,
                new Promise((r) => setTimeout(r, 15_000)),
            ]);
            abort.abort();
            if (pollResult?.unlockKey) finishUnlock(pollResult);
            else fail('Payment window closed. Your saved checkout is still here — try again anytime.');
        }
    };

    const simulate = async () => {
        setStatus({ phase: 'verifying', message: 'Simulating payment…' });
        try {
            await verifyPremiumPayment({ provider: 'test' });
            track('premium_unlock');
            onUnlocked?.({ testMode: true, unlockKey: null });
        } catch (e) {
            fail(e?.message || 'Something went wrong.');
        }
    };

    // The value stack, stated once, plainly. No fake timers, no fake scarcity.
    const inside = [
        { icon: Mail, t: 'The letter, in your words', d: 'Plus 6 reasons and 3 promises. The part they screenshot.' },
        { icon: Images, t: 'The memory album', d: 'Up to 12 photos as instant-film cards that open fullscreen.' },
        { icon: Film, t: '4-scene cinema + credits', d: 'A film with their name in it, swipeable like a story.' },
        { icon: Link2, t: 'Magic link + keepsake image', d: 'Opens on any device. A 1080×1350 card they can keep forever.' },
    ];

    return (
        <section ref={sectionRef} id="prm-paywall" className="prm-act relative px-5 sm:px-8 py-24 sm:py-32" aria-label="Unlock premium">
            <div className="max-w-xl mx-auto text-center">
                <Reveal><p className="prm-eyebrow mb-6">✦ The version they screenshot ✦</p></Reveal>
                <Reveal delay={120}>
                    <h2 className="prm-serif prm-h-act mb-4">
                        <span className="block">Make {who === 'them' ? 'their day' : `${name}'s day`}</span>
                        <span className="block prm-gold-text">impossible to forget.</span>
                    </h2>
                </Reveal>
                <Reveal delay={200}>
                    <p className="prm-lead text-sm sm:text-base mb-8">
                        The free card says happy birthday. The premium one makes them feel like the main
                        character — a letter, a photo album, a little film, and a keepsake they can keep
                        forever. One payment, no subscription.
                    </p>
                </Reveal>

                {/* Before / after: show the gap, don't describe it. */}
                <Reveal delay={240}>
                    <div className="mx-auto mb-10 pt-4 grid max-w-sm grid-cols-2 items-end gap-5" aria-hidden="true">
                        <div className="text-center flex flex-col items-center">
                            <div className="vipmock vipmock-free scale-105 origin-bottom">
                                <div className="vipmock-inner">
                                    <span className="vipmock-initial">{(name || '♥').trim().charAt(0).toUpperCase() || '♥'}</span>
                                    <span className="vipmock-chip">Free</span>
                                </div>
                            </div>
                            <p className="vipmock-label mt-3.5">Today&apos;s card</p>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <div className="vipmock vipmock-vip scale-125 origin-bottom">
                                <div className="vipmock-aurora" />
                                <div className="vipmock-inner">
                                    <span className="vipmock-initial vipmock-initial-vip">{(name || '♥').trim().charAt(0).toUpperCase() || '♥'}</span>
                                    <span className="vipmock-crown">👑</span>
                                    <span className="vipmock-chip vipmock-chip-vip">Premium</span>
                                </div>
                            </div>
                            <p className="vipmock-label vipmock-label-vip mt-3.5">With Premium · {price.label}</p>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={260}>
                    <div className="prm-locker-card rounded-[1.75rem] p-5 sm:p-9">
                        {/* Region toggle */}
                        <div className="inline-flex rounded-full border border-[rgba(242,193,78,0.3)] p-1 mb-7 text-sm font-bold" role="group" aria-label="Billing region">
                            {[
                                { id: 'IN', label: `India · ${PREMIUM_PRICE_INR.label}`, icon: MapPin },
                                { id: 'INTL', label: `Worldwide · ${PREMIUM_PRICE_INTL.label}`, icon: Globe2 },
                            ].map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => { setRegion(r.id); setStatus({ phase: 'idle', message: '' }); }}
                                    aria-pressed={region === r.id}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${region === r.id ? 'bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031]' : 'text-[#b9aed4] hover:text-white'}`}
                                >
                                    <r.icon className="w-4 h-4" aria-hidden="true" /> {r.label}
                                </button>
                            ))}
                        </div>

                        <p className="prm-offer-badge mb-5">🎉 Launch offer · {price.off} ends soon</p>

                        <p className="text-lg sm:text-xl font-bold text-[#e9e2f5]">
                            <span className="prm-strike" aria-label={`Regular price ${price.mrpLabel}`}>{price.mrpLabel}</span>{' '}
                            <span className="prm-serif text-6xl sm:text-7xl font-extrabold prm-gold-text align-middle" suppressHydrationWarning>{price.label}</span>{' '}
                            <span className="prm-off-pill">{price.off}</span>
                        </p>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b9aed4] mt-3 mb-1">one-time · theirs forever</p>
                        <p className="text-sm font-bold text-[#7ee2a8] mb-6">{price.saveLabel} today · less than a pizza slice</p>

                        {/* Keepsake sample: the physical-feeling artifact they get. */}
                        <div className="mx-auto mb-6 w-full max-w-[230px] -rotate-2 rounded-2xl border border-[#f2c14e]/45 bg-gradient-to-b from-[#241540] to-[#0c0618] p-3 text-left shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
                            <p className="text-[8px] font-extrabold uppercase tracking-[0.22em] text-[#f7dc9a]">✦ A birthday keepsake ✦</p>
                            <div className="mt-2 flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-[#3a1f5c] to-[#120a21] text-3xl">
                                {(name || '♥').trim().charAt(0).toUpperCase() || '♥'}
                            </div>
                            <p className="prm-serif mt-2 text-sm font-extrabold text-[#f7dc9a]">Dear {name || 'You'},</p>
                            <p className="mt-0.5 text-[9px] leading-relaxed text-[#c4b6db]">
                                “You make ordinary days feel like celebrations.”
                            </p>
                            <p className="mt-1.5 text-[8px] text-[#9f94b8]">with all my heart, someone who loves you</p>
                        </div>

                        {/* Resume the exact checkout from the recovery email. */}
                        {resumeLoading && (
                            <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-[#b9aed4]">
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Checking your saved checkout…
                            </div>
                        )}
                        {resume && (
                            <div className="mb-4 rounded-2xl border border-[#f2c14e]/45 bg-[rgba(242,193,78,0.09)] p-3.5 text-left">
                                <p className="text-xs font-extrabold text-[#f7dc9a]">Your checkout is still saved</p>
                                <p className="mt-1 text-[11px] leading-relaxed text-[#c4b6db]">
                                    Nothing was charged. Pick up the same order — the card and your details are waiting.
                                </p>
                                <button
                                    type="button"
                                    onClick={resumeCheckout}
                                    disabled={verifying}
                                    className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] px-3 py-2.5 text-xs font-extrabold text-[#241031] disabled:opacity-60"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Finish my saved checkout
                                </button>
                            </div>
                        )}

                        {/* Inline contact: optional, but visible. This is what
                            makes receipt + abandoned-checkout recovery possible. */}
                        <div className="mb-4 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <label className="block">
                                    <span className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#b9aed4]">
                                        <Mail className="w-3 h-3" aria-hidden="true" /> Email <span className="font-normal normal-case tracking-normal text-[#8f83a8]">(optional)</span>
                                    </span>
                                    <input
                                        type="email"
                                        value={contact.email}
                                        onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                                        onFocus={() => track('paywall_contact_focus')}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        inputMode="email"
                                        className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-[#7f7597] focus:outline-none focus:ring-2 focus:ring-[#f2c14e]/60"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#b9aed4]">
                                        <Phone className="w-3 h-3" aria-hidden="true" /> Phone <span className="font-normal normal-case tracking-normal text-[#8f83a8]">(optional)</span>
                                    </span>
                                    <input
                                        type="tel"
                                        value={contact.phone}
                                        onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                                        placeholder="+91…"
                                        autoComplete="tel"
                                        inputMode="tel"
                                        className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-[#7f7597] focus:outline-none focus:ring-2 focus:ring-[#f2c14e]/60"
                                    />
                                </label>
                            </div>
                            {contactError && (
                                <p role="alert" className="mt-1.5 text-[11px] font-semibold text-[#fda4af]">{contactError}</p>
                            )}
                            <p className="mt-1.5 text-[10px] leading-relaxed text-[#9f94b8]">
                                Only for your receipt and to recover this unlock. Never shown on the card.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Magnetic strength={26} className="block">
                                <button
                                    ref={ctaRef}
                                    type="button"
                                    onClick={checkout}
                                    disabled={verifying}
                                    className="prm-shimmer-btn w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-[13px] sm:text-base transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 whitespace-nowrap"
                                >
                                    {verifying ? (
                                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" aria-hidden="true" />
                                    ) : (
                                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
                                    )}
                                    <span>{`Give ${who} the full universe · ${price.label}`}</span>
                                </button>
                            </Magnetic>
                            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9f94b8]">
                                Unlocks instantly · One-time · Refund promise
                            </p>

                            {testMode && (
                                <button
                                    type="button"
                                    onClick={simulate}
                                    disabled={verifying}
                                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs font-bold text-[#b9aed4] hover:text-white transition-colors disabled:opacity-60"
                                >
                                    <FlaskConical className="w-4 h-4" aria-hidden="true" />
                                    Live payments are not connected yet. Simulate success (test mode)
                                </button>
                            )}
                        </div>

                        {status.phase === 'error' && (
                            <p role="alert" className="mt-4 text-sm font-semibold text-[#fda4af] bg-[rgba(225,29,72,0.12)] border border-[rgba(225,29,72,0.35)] rounded-xl px-4 py-3">
                                {status.message}
                            </p>
                        )}
                        {status.phase === 'verifying' && status.message && (
                            <p role="status" className="mt-4 text-sm font-semibold text-[#f7dc9a]">{status.message}</p>
                        )}

                        {/* Free vs premium: name exactly what changes */}
                        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9f94b8] mb-2.5">Free card</p>
                                <ul className="space-y-1.5 text-xs text-[#b9aed4]">
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#7ee2a8] shrink-0 mt-0.5" aria-hidden="true" /> Birthday page + name</li>
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#7ee2a8] shrink-0 mt-0.5" aria-hidden="true" /> Candle wish + confetti</li>
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#7ee2a8] shrink-0 mt-0.5" aria-hidden="true" /> First 3 photos</li>
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-[#f2c14e]/35 bg-[rgba(242,193,78,0.07)] p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f7dc9a] mb-2.5">Premium universe · {price.label}</p>
                                <ul className="space-y-1.5 text-xs text-[#fbf3e2]">
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#f2c14e] shrink-0 mt-0.5" aria-hidden="true" /> Everything above, plus…</li>
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#f2c14e] shrink-0 mt-0.5" aria-hidden="true" /> Letter, 6 reasons, 3 vows</li>
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#f2c14e] shrink-0 mt-0.5" aria-hidden="true" /> Full photo album (12 memories)</li>
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#f2c14e] shrink-0 mt-0.5" aria-hidden="true" /> Cinema film + keepsake image</li>
                                </ul>
                            </div>
                        </div>

                        {/* Value stack, plain-spoken */}
                        <div className="mt-5 space-y-3.5 text-left">
                            {inside.map((r) => (
                                <div key={r.t} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#f2c14e]/15 border border-[#f2c14e]/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <r.icon className="w-4 h-4 text-[#f2c14e]" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#f7dc9a]">{r.t}</p>
                                        <p className="text-xs text-[#c4b6db] mt-0.5 leading-relaxed">{r.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trust row */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                            {[
                                { icon: ShieldCheck, label: 'Razorpay secured' },
                                { icon: Zap, label: 'Unlocks instantly' },
                                { icon: Lock, label: 'No account, no app' },
                                { icon: Link2, label: 'Link never expires' },
                            ].map((c) => (
                                <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-[#cfc4e8]">
                                    <c.icon className="w-3.5 h-3.5 text-[#7ee2a8]" aria-hidden="true" /> {c.label}
                                </span>
                            ))}
                        </div>

                        <p className="mt-5 text-xs leading-relaxed text-[#b9aed4]">
                            {region === 'IN' ? 'UPI, cards, netbanking via Razorpay' : 'Cards worldwide via Razorpay'}. One payment,
                            no subscription. Love it or we refund you, no questions.
                        </p>
                    </div>
                </Reveal>
            </div>

            {/* Sticky mobile re-offer: same checkout, reachable with a thumb.
                Portaled to <body> so no ancestor container/content-visibility can trap or misplace it. */}
            {mounted && showStickyCta && createPortal(
                <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[rgba(242,193,78,0.35)] bg-[rgba(7,4,18,0.95)] backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_36px_rgba(0,0,0,0.8)]">
                    <button
                        type="button"
                        onClick={resume ? resumeCheckout : checkout}
                        disabled={verifying}
                        className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-3.5 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-xs sm:text-sm shadow-[0_-8px_30px_rgba(242,193,78,0.25)] disabled:opacity-60 transition-transform active:scale-95 whitespace-nowrap"
                    >
                        {verifying ? (
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                        ) : (
                            <Sparkles className="w-4 h-4 shrink-0 text-[#241031]" aria-hidden="true" />
                        )}
                        <span>
                            {resume ? `Finish saved checkout · ${price.label}` : `Give ${who} the full universe · ${price.label}`}
                        </span>
                    </button>
                    <p className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9aed4]">
                        One-time · Magic link · Refund promise
                    </p>
                </div>,
                document.body
            )}
        </section>
    );
}
