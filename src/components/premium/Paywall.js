'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Loader2, FlaskConical, Globe2, MapPin, Smartphone } from 'lucide-react';
import { detectRegion, getPremiumPrice, buildPremiumUpiUrl, createPremiumOrder, openRazorpayCheckout, verifyPremiumPayment } from '@/lib/payments';
import { UPI_ID } from '@/lib/support.mjs';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

function track(event, extra = {}) {
    try {
        fetch('/api/support/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, path: typeof window !== 'undefined' ? window.location.pathname : null, ...extra }),
        }).catch(() => {});
    } catch {}
}

/**
 * One-button checkout. Server creates a tamper-proof order, Razorpay collects
 * UPI/cards/netbanking, server verifies the signature, universe unlocks.
 * Test mode appears only when server keys are missing.
 */
export default function Paywall({ onUnlocked }) {
    // Lazy init keeps SSR deterministic (server TZ → INTL, i.e. $1 for
    // crawlers); suppressHydrationWarning below lets the client region win.
    const [region, setRegion] = useState(() => detectRegion());
    const [status, setStatus] = useState({ phase: 'idle', message: '' });
    const [testMode, setTestMode] = useState(false);
    const opened = useRef(false);
    const price = getPremiumPrice(region);

    useEffect(() => {
        if (opened.current) return;
        opened.current = true;
        track('paywall_open');
    }, []);

    const fail = (message) => setStatus({ phase: 'error', message });
    const checkout = async () => {
        setStatus({ phase: 'verifying', message: 'Contacting secure checkout…' });
        try {
            const order = await createPremiumOrder(region);
            track('checkout_start', { amount: region === 'IN' ? 49 : 1 });
            setStatus({ phase: 'verifying', message: 'Opening secure checkout…' });
            const resp = await openRazorpayCheckout({ order, keyId: order.keyId, region });
            setStatus({ phase: 'verifying', message: 'Confirming your payment…' });
            const receipt = await verifyPremiumPayment({
                provider: 'razorpay',
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
            });
            track('premium_unlock');
            onUnlocked?.({ testMode: false, unlockKey: receipt.unlockKey || null, receiptKept: !!receipt.unlockKey });
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

    const payDirectUpi = () => {
        track('checkout_start', { amount: 49 });
        try { window.location.href = buildPremiumUpiUrl(UPI_ID, 'BirthdayGen Premium'); } catch {}
    };

    const confirmDirectUpi = async () => {
        setStatus({ phase: 'verifying', message: 'Unlocking…' });
        try {
            await verifyPremiumPayment({ provider: 'upi' });
            track('premium_unlock');
            onUnlocked?.({ testMode: true, unlockKey: null });
        } catch (e) {
            fail(e?.message || 'Something went wrong.');
        }
    };

    return (
        <section id="prm-paywall" className="prm-act relative px-5 sm:px-8 py-24 sm:py-32" aria-label="Unlock premium">
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

                        <div className="space-y-3">
                            <Magnetic strength={26} className="block">
                                <button
                                    type="button"
                                    onClick={checkout}
                                    disabled={status.phase === 'verifying'}
                                    className="prm-shimmer-btn w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-base transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                                >
                                    {status.phase === 'verifying'
                                        ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                                        : <Zap className="w-5 h-5" aria-hidden="true" />}
                                    {`Unlock everything for ${price.label} · ${price.saveLabel.toLowerCase()}`}
                                </button>
                            </Magnetic>

                            {region === 'IN' && !testMode && (
                                <details className="text-left rounded-2xl border border-white/10 px-4 py-3">
                                    <summary className="text-xs font-bold text-[#b9aed4] cursor-pointer hover:text-white inline-flex items-center gap-1.5">
                                        <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                                        Checkout won&apos;t open? Pay ₹49 directly in your UPI app
                                    </summary>
                                    <div className="pt-3 space-y-2.5">
                                        <button
                                            type="button"
                                            onClick={payDirectUpi}
                                            className="w-full px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-colors"
                                        >
                                            Open GPay, PhonePe or Paytm for ₹49
                                        </button>
                                        <button
                                            type="button"
                                            onClick={confirmDirectUpi}
                                            className="w-full px-5 py-3 rounded-xl border border-[rgba(242,193,78,0.45)] text-[#f7dc9a] font-bold text-sm hover:bg-[rgba(242,193,78,0.1)] transition-colors"
                                        >
                                            I&apos;ve paid, now unlock my universe
                                        </button>
                                    </div>
                                </details>
                            )}

                            {testMode && (
                                <button
                                    type="button"
                                    onClick={simulate}
                                    disabled={status.phase === 'verifying'}
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

                        <ul className="mt-6 text-left text-[13px] leading-relaxed text-[#e9e2f5] space-y-2 max-w-sm mx-auto">
                            <li>✉️ The letter, 6 reasons, vows + candle finale — all 5 acts</li>
                            <li>🔗 Private magic link · works on any device · never expires</li>
                            <li>💜 Happy-tears promise — loved twice or we refund you</li>
                        </ul>

                        <p className="mt-6 text-xs leading-relaxed text-[#b9aed4]">
                            Secured by Razorpay {region === 'IN' ? '(UPI, cards, netbanking)' : '(cards worldwide)'}. One payment, no subscription, no account.
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
