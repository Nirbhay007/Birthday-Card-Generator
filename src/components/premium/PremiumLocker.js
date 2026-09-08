'use client';

import { Lock, Mail, Sparkles, Flame, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

/**
 * The velvet rope: a blurred glimpse of the sealed acts + the emotional
 * case for unlocking. Everything here is giver-facing copy engineered to
 * make the price feel trivial next to the feeling.
 */
export default function PremiumLocker({ to = 'them', priceLabel = '₹49', giftMode = false, onUnlock }) {
    return (
        <section className="prm-act relative px-5 sm:px-8 py-24 sm:py-32 overflow-hidden" aria-label="Locked premium acts">
            {/* Blurred ghost of what's inside */}
            <div className="max-w-2xl mx-auto prm-lock-blur select-none" aria-hidden="true">
                <div className="prm-paper rounded-2xl p-8 sm:p-12">
                    <p className="prm-serif text-xl">Dear {to},</p>
                    <div className="mt-4 space-y-3">
                        <div className="h-4 rounded bg-[#3d2c17]/15 prm-redact w-full" />
                        <div className="h-4 rounded bg-[#3d2c17]/15 prm-redact w-11/12" />
                        <div className="h-4 rounded bg-[#3d2c17]/15 prm-redact w-full" />
                        <div className="h-4 rounded bg-[#3d2c17]/15 prm-redact w-4/6" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-2xl border border-[rgba(242,193,78,0.25)] bg-white/5 p-4">
                            <div className="h-8 w-8 rounded-full bg-[#f2c14e]/30 mb-2" />
                            <div className="h-3 rounded bg-white/15 prm-redact w-4/5 mb-1.5" />
                            <div className="h-3 rounded bg-white/10 prm-redact w-3/5" />
                        </div>
                    ))}
                </div>
            </div>

            {/* The lock card */}
            <div className="relative -mt-40 sm:-mt-48 max-w-xl mx-auto px-1">
                <Reveal>
                    <div className="prm-locker-card rounded-[1.75rem] p-5 sm:p-10 text-center">
                        <div className="mx-auto -mt-14 sm:-mt-16 mb-5 w-16 h-16 rounded-full bg-gradient-to-br from-[#f2c14e] to-[#b45309] flex items-center justify-center shadow-[0_16px_50px_rgba(242,193,78,0.5)]">
                            <Lock className="w-7 h-7 text-[#241031]" aria-hidden="true" />
                        </div>
                        <p className="prm-eyebrow mb-4">🔒 4 acts still sealed</p>
                        <p className="mb-4"><span className="prm-offer-badge">🎉 Launch offer · 75% off</span></p>
                        <h3 className="prm-serif text-2xl sm:text-4xl font-extrabold leading-tight mb-4">
                            The part that makes them <span className="prm-gold-text prm-glitch" data-text="cry happy tears">cry happy tears</span> is behind this lock.
                        </h3>
                        <p className="prm-lead text-sm sm:text-base mb-6">
                            A free card says <em>“I remembered.”</em> This says <em>“you are the best
                            thing that ever happened to me, and I stayed up all night proving it.”</em> Which
                            one does {to} deserve?
                        </p>
                        <ul className="text-left text-sm sm:text-[0.95rem] space-y-3 mb-8 max-w-sm mx-auto">
                            {[
                                { icon: Mail, text: 'The Letter. Everything you feel but never say out loud' },
                                { icon: Sparkles, text: 'The Reasons. Six illustrated reasons they are unforgettable' },
                                { icon: Flame, text: 'The Finale. Vows, candles, and a sky full of stars' },
                            ].map((r) => (
                                <li key={r.text} className="flex items-start gap-3">
                                    <r.icon className="w-5 h-5 mt-0.5 shrink-0 text-[#f2c14e]" aria-hidden="true" />
                                    <span className="text-[#e9e2f5]">{r.text}</span>
                                </li>
                            ))}
                        </ul>
                        <Magnetic strength={30} className="block sm:inline-block">
                            {giftMode ? (
                                <Link
                                    href="/premium"
                                    className="prm-shimmer-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-base sm:text-lg shadow-[0_20px_60px_rgba(242,193,78,0.4)] transition-transform hover:scale-[1.03] active:scale-95"
                                >
                                    Make your own universe
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onUnlock}
                                    className="prm-shimmer-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-base sm:text-lg shadow-[0_20px_60px_rgba(242,193,78,0.4)] transition-transform hover:scale-[1.03] active:scale-95"
                                >
                                    Unlock everything · <s className="prm-strike">₹199</s> {priceLabel}
                                </button>
                            )}
                        </Magnetic>
                        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#b9aed4]">
                            <BadgeCheck className="w-4 h-4 text-[#7ee2a8]" aria-hidden="true" />
                            One-time payment · Theirs forever · Happy-tears guarantee
                        </p>
                        <p className="mt-1.5 text-xs font-bold text-[#7ee2a8]">$1 worldwide · less than a pizza slice</p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
