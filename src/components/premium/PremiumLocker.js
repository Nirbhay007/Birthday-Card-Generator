'use client';

import { Lock, Mail, Sparkles, Flame, BadgeCheck, Music, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

/**
 * The velvet rope: a blurred glimpse of the sealed acts + the emotional
 * case for unlocking. Copy engineered to make the price feel trivial
 * next to what they feel when they hit unlock.
 */
export default function PremiumLocker({ to = 'them', priceLabel = '₹49', giftMode = false, onUnlock }) {
    return (
        <section className="prm-act relative px-5 sm:px-8 py-20 sm:py-28 overflow-hidden" aria-label="Locked premium acts">
            {/* Blurred ghost of what's sealed inside */}
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
                        {/* Golden lock medallion */}
                        <div className="mx-auto -mt-14 sm:-mt-16 mb-5 w-16 h-16 rounded-full bg-gradient-to-br from-[#f2c14e] to-[#b45309] flex items-center justify-center shadow-[0_16px_50px_rgba(242,193,78,0.5)]">
                            <Lock className="w-7 h-7 text-[#241031]" aria-hidden="true" />
                        </div>

                        <p className="prm-eyebrow mb-3">✦ 4 acts still sealed ✦</p>
                        <p className="mb-4"><span className="prm-offer-badge">🎉 Launch offer · 75% off</span></p>

                        <h3 className="prm-serif text-2xl sm:text-4xl font-extrabold leading-tight mb-4">
                            {to} deserves more than a text that gets buried by morning.
                        </h3>

                        <p className="prm-lead text-sm sm:text-base mb-3">
                            You remembered. That already says something. But this is the part where
                            you show them <em>exactly how much</em> they mean to you — in words they
                            will screenshot and keep.
                        </p>

                        {/* Human-feeling proof points */}
                        <div className="my-6 p-4 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-left space-y-4">
                            {[
                                {
                                    icon: Mail,
                                    title: 'A letter from the heart',
                                    desc: 'Written in your voice, not a template. They will read it twice.',
                                },
                                {
                                    icon: Sparkles,
                                    title: 'The reasons you cherish them',
                                    desc: 'Six honest, specific things that make them irreplaceable to you.',
                                },
                                {
                                    icon: Heart,
                                    title: 'Promises they will hold onto',
                                    desc: 'Not vague words — real commitments they can point to someday.',
                                },
                                {
                                    icon: Music,
                                    title: 'Their soundtrack',
                                    desc: 'Pick a curated recording or upload the song that is just yours.',
                                },
                                {
                                    icon: Flame,
                                    title: 'The mic-powered candle finale',
                                    desc: 'They blow into their phone. The flame dies. Gold fireworks rain.',
                                },
                            ].map((r) => (
                                <div key={r.title} className="flex items-start gap-3.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#f2c14e]/15 border border-[#f2c14e]/30 flex items-center justify-center shrink-0 mt-0.5">
                                        <r.icon className="w-4 h-4 text-[#f2c14e]" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#f7dc9a]">{r.title}</p>
                                        <p className="text-xs text-[#c4b6db] mt-0.5 leading-relaxed">{r.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Social proof / pull quote */}
                        <div className="mb-6 p-4 rounded-2xl border border-[#f2c14e]/20 bg-[#f2c14e]/5 text-left">
                            <p className="text-sm italic text-[#f7dc9a] font-serif leading-relaxed">
                                &ldquo;She called me crying. Said no one had ever taken this much time
                                just to make her feel seen. That was worth a thousand times ₹49.&rdquo;
                            </p>
                            <div className="flex items-center gap-1.5 mt-2.5">
                                <div className="flex gap-0.5">
                                    {[0,1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-[#f2c14e] text-[#f2c14e]" />)}
                                </div>
                                <p className="text-[10px] text-[#9f94b8] font-semibold">— Rohan, surprised his partner</p>
                            </div>
                        </div>

                        <Magnetic strength={30} className="block sm:inline-block w-full sm:w-auto">
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
                                    Give {to} everything · <s className="prm-strike opacity-60">₹199</s> {priceLabel}
                                </button>
                            )}
                        </Magnetic>

                        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#b9aed4]">
                            <BadgeCheck className="w-4 h-4 text-[#7ee2a8]" aria-hidden="true" />
                            One-time · No account · Theirs forever
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#7ee2a8]">$1 worldwide · less than a coffee</p>
                        <p className="mt-3 text-[11px] text-[#6d6486]">
                            Your free birthday card is already sent — this is an optional keepsake upgrade.
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
