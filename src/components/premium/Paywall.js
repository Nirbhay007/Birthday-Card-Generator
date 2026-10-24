'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Loader2, FlaskConical, Globe2, MapPin, Mail, Images, Film, Link2, ShieldCheck, Check, Lock } from 'lucide-react';
import {
    detectRegion,
    getPremiumPrice,
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

function validEmail(value) {
    return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
    return !value || /^[+()\d][\d\s().-]{5,24}$/.test(value);
}

/**
 * One-button checkout. Server creates a tamper-proof order, Razorpay collects
 * UPI/cards/netbanking, server verifies the signature, universe unlocks.
 * Test mode appears only when server keys are missing.
 *
 * Conversion notes (measured, not guessed): 238 paywall opens a week produce
 * ~4 checkout taps, so the decision point itself is the leak. This wall now
 * shows exactly what is inside (comparison + inclusions), keeps the price
 * honest, and re-offers the same button in a sticky mobile bar the moment the
 * main button scrolls out of view.
 */
export default function Paywall({ onUnlocked }) {
    // Lazy init keeps SSR deterministic (server TZ → INTL, i.e. $1 for
    // crawlers); suppressHydrationWarning below lets the client region win.
    const [region, setRegion] = useState(() => detectRegion());
    const [status, setStatus] = useState({ phase: 'idle', message: '' });
    const [testMode, setTestMode] = useState(false);
    const [showStickyCta, setShowStickyCta] = useState(false);
    const [contact, setContact] = useState({ name: '', email: '', phone: '' });
    const [contactOpen, setContactOpen] = useState(false);
    const [contactError, setContactError] = useState('');
    const opened = useRef(false);
    const sectionRef = useRef(null);
    const ctaRef = useRef(null);
    const price = getPremiumPrice(region);
    const verifying = status.phase === 'verifying';

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

    // ---- UPI RECOVERY ----
    // If the browser died during a UPI app switch, the pending order is still
    // in localStorage. Poll the server to see if the webhook already confirmed
    // payment, and auto-unlock if so.  Runs only once on mount.
    const recoveredRef = useRef(false);
    useEffect(() => {
        if (recoveredRef.current) return;
        recoveredRef.current = true;
        (async () => {
            let raw;
            try { raw = localStorage.getItem(PENDING_ORDER_KEY); } catch { return; }
            if (!raw) return;
            let pending;
            try { pending = JSON.parse(raw); } catch { try { localStorage.removeItem(PENDING_ORDER_KEY); } catch {} return; }
            const { orderId, pollToken, ts } = pending || {};
            if (!orderId || !pollToken || Date.now() - (ts || 0) > 10 * 60 * 1000) {
                try { localStorage.removeItem(PENDING_ORDER_KEY); } catch {}
                return;
            }
            setStatus({ phase: 'verifying', message: 'Checking your previous payment…' });
            const result = await pollOrderStatus(orderId, { token: pollToken, maxAttempts: 10, intervalMs: 2000 });
            if (result?.unlockKey) {
                try { localStorage.removeItem(PENDING_ORDER_KEY); } catch {}
                track('premium_unlock');
                onUnlocked?.({ testMode: false, unlockKey: result.unlockKey, receiptKept: true });
            } else {
                try { localStorage.removeItem(PENDING_ORDER_KEY); } catch {}
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
        } catch {}
        return () => {
            try {
                window.dispatchEvent(new CustomEvent('bgen:paywall_sticky', { detail: { visible: false } }));
            } catch {}
        };
    }, [showStickyCta]);

    const fail = (message) => setStatus({ phase: 'error', message });
    const checkout = async () => {
        if (verifying) return;

        // This counts every checkout attempt, including the sticky re-offer.
        track('paywall_cta_click');

        const email = contact.email.trim();
        const phone = contact.phone.trim();
        if (!validEmail(email)) {
            setContactOpen(true);
            setContactError('That email looks incomplete. Fix it or leave it blank.');
            return;
        }
        if (!validPhone(phone)) {
            setContactOpen(true);
            setContactError('That phone number looks incomplete. Fix it or leave it blank.');
            return;
        }
        setContactError('');
        const savedContact = saveBuyerContact({ ...contact, email, phone });
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
            try { localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify({ orderId: order.orderId, pollToken: order.pollToken, ts: Date.now() })); } catch {}
            track('checkout_start', { amount: region === 'IN' ? 49 : 1 });
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
                try { localStorage.removeItem(PENDING_ORDER_KEY); } catch {}
                track('premium_unlock');
                onUnlocked?.({ testMode: false, unlockKey: receipt.unlockKey || null, receiptKept: !!receipt.unlockKey });
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
                // via UPI.  Give the background poll a few more seconds to catch it.
                setStatus({ phase: 'verifying', message: 'Checking payment status…' });
                const pollResult = await Promise.race([
                    poll,
                    new Promise((r) => setTimeout(() => r(null), 15_000)),
                ]);
                abort.abort();
                if (pollResult?.unlockKey) {
                    try { localStorage.removeItem(PENDING_ORDER_KEY); } catch {}
                    track('premium_unlock');
                    onUnlocked?.({ testMode: false, unlockKey: pollResult.unlockKey, receiptKept: true });
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
                <Reveal><p className="prm-eyebrow mb-6">✦ The smallest big decision ✦</p></Reveal>
                <Reveal delay={120}>
                    <h2 className="prm-serif prm-h-act mb-4">
                        <span className="block">Less than a</span>
                        <span className="block prm-gold-text">pizza slice.</span>
                        <span className="block">Remembered for years.</span>
                    </h2>
                </Reveal>
                <Reveal delay={200}>
                    <p className="prm-lead text-sm sm:text-base mb-8">
                        You will forget the {price.label} by tomorrow. But they will remember how you
                        made them feel today, and revisit this surprise whenever they need a reminder
                        of how much they are loved.
                    </p>
                </Reveal>

                <Reveal delay={260}>
                    <div className="prm-locker-card rounded-[1.75rem] p-5 sm:p-9">
                        {/* Region toggle */}
                        <div className="inline-flex rounded-full border border-[rgba(242,193,78,0.3)] p-1 mb-7 text-sm font-bold" role="group" aria-label="Billing region">
                            {[
                                { id: 'IN', label: 'India · ₹49', icon: MapPin },
                                { id: 'INTL', label: 'Worldwide · $1', icon: Globe2 },
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
                        <p className="text-sm font-bold text-[#7ee2a8] mb-8">{price.saveLabel} today · less than a pizza slice · less than chai for two</p>

                        {/* Optional receipt details. Collapsed by default so a
                            first-time buyer sees one button, not a form. When
                            present, Razorpay skips its mandatory contact step
                            and support can recover an interrupted checkout. */}
                        <div className="mb-3 text-left">
                            {!contactOpen ? (
                                <button
                                    type="button"
                                    onClick={() => { setContactOpen(true); setContactError(''); }}
                                    className="mx-auto flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#b9aed4] hover:text-white transition-colors"
                                >
                                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                                    {contact.email || contact.phone
                                        ? `Receipt to ${contact.email || contact.phone} · Edit`
                                        : 'Add email for the receipt (optional)'}
                                </button>
                            ) : (
                                <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-3.5 space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#b9aed4]">Receipt details · optional</p>
                                        <button
                                            type="button"
                                            onClick={() => { setContactOpen(false); setContactError(''); }}
                                            className="text-[11px] font-bold text-[#b9aed4] hover:text-white"
                                        >
                                            Hide
                                        </button>
                                    </div>
                                    <label className="block">
                                        <span className="sr-only">Email for receipt</span>
                                        <input
                                            type="email"
                                            value={contact.email}
                                            onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            inputMode="email"
                                            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-[#7f7597] focus:outline-none focus:ring-2 focus:ring-[#f2c14e]/60"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="sr-only">Phone for receipt and recovery (optional)</span>
                                        <input
                                            type="tel"
                                            value={contact.phone}
                                            onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                                            placeholder="Phone with country code (optional)"
                                            autoComplete="tel"
                                            inputMode="tel"
                                            className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-[#7f7597] focus:outline-none focus:ring-2 focus:ring-[#f2c14e]/60"
                                        />
                                    </label>
                                    {contactError && (
                                        <p role="alert" className="text-[11px] font-semibold text-[#fda4af]">{contactError}</p>
                                    )}
                                    <p className="text-[10px] leading-relaxed text-[#9f94b8]">
                                        Only used for your receipt and to recover this unlock. Never shown on the card.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Magnetic strength={26} className="block">
                                <button
                                    ref={ctaRef}
                                    type="button"
                                    onClick={checkout}
                                    disabled={verifying}
                                    className="prm-shimmer-btn w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-base transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                                >
                                    {verifying
                                        ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                                        : <Zap className="w-5 h-5" aria-hidden="true" />}
                                    {`Unlock everything for ${price.label} · ${price.saveLabel.toLowerCase()}`}
                                </button>
                            </Magnetic>

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
                                </ul>
                            </div>
                            <div className="rounded-2xl border border-[#f2c14e]/35 bg-[rgba(242,193,78,0.07)] p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f7dc9a] mb-2.5">Premium universe · {price.label}</p>
                                <ul className="space-y-1.5 text-xs text-[#fbf3e2]">
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#f2c14e] shrink-0 mt-0.5" aria-hidden="true" /> Everything above, plus…</li>
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#f2c14e] shrink-0 mt-0.5" aria-hidden="true" /> Letter, 6 reasons, 3 vows</li>
                                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 text-[#f2c14e] shrink-0 mt-0.5" aria-hidden="true" /> Photo album (12 memories)</li>
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
                Right padding keeps it clear of the floating mute button. */}
            {showStickyCta && (
                <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[rgba(242,193,78,0.35)] bg-[rgba(7,4,18,0.92)] backdrop-blur-md px-3 pl-4 pr-20 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <button
                        type="button"
                        onClick={checkout}
                        disabled={verifying}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-sm shadow-[0_-8px_30px_rgba(242,193,78,0.25)] disabled:opacity-60"
                    >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Zap className="w-4 h-4" aria-hidden="true" />}
                        {`Unlock everything · ${price.label}`}
                    </button>
                    <p className="mt-1.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9aed4]">
                        One-time · Magic link · Refund promise
                    </p>
                </div>
            )}
        </section>
    );
}
