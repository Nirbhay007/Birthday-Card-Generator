'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Lock, Mail, Sparkles, Flame, BadgeCheck, Music, Heart, Star, Images, Film } from 'lucide-react';
import Link from 'next/link';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

/**
 * The velvet rope: try-to-open sealed previews of what is inside, plus the
 * emotional case for unlocking. The "sealed" interaction is deliberate: a
 * tap physically fails (wax wobble + a wink), which makes the lock feel real
 * instead of decorative. Copy engineered to make the price feel trivial
 * next to what they feel when they hit unlock.
 */

const SEALED_TABS = [
    {
        id: 'letter',
        label: 'The Letter',
        icon: Mail,
        title: 'Dear {to},',
        body: (
            <div className="space-y-2.5">
                <div className="h-3.5 rounded bg-[#3d2c17]/20 prm-redact w-full" />
                <div className="h-3.5 rounded bg-[#3d2c17]/20 prm-redact w-11/12" />
                <div className="h-3.5 rounded bg-[#3d2c17]/20 prm-redact w-full" />
                <div className="h-3.5 rounded bg-[#3d2c17]/20 prm-redact w-4/6" />
            </div>
        ),
    },
    {
        id: 'reasons',
        label: 'Why You',
        icon: Sparkles,
        title: 'Six reasons, in their own words',
        body: (
            <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-xl border border-[rgba(242,193,78,0.25)] bg-white/5 p-3">
                        <div className="h-7 w-7 rounded-full bg-[#f2c14e]/30 mb-2" />
                        <div className="h-2.5 rounded bg-white/15 prm-redact w-4/5 mb-1.5" />
                        <div className="h-2.5 rounded bg-white/10 prm-redact w-3/5" />
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'photos',
        label: 'The Album',
        icon: Images,
        title: 'Up to 12 photos, as instant-film cards',
        body: (
            <div className="flex items-center justify-center gap-3">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-16 sm:w-20 rounded-lg bg-[#f4eddc] p-1.5 pb-3 shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                        style={{ transform: `rotate(${(i - 1) * 5}deg)` }}
                    >
                        <div className="aspect-[4/5] rounded-[4px] bg-gradient-to-br from-[#2a1748] to-[#0d0618]" />
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'cinema',
        label: 'The Film',
        icon: Film,
        title: 'A 4-scene cinema with credits',
        body: (
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 w-full">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
                            <div className={`h-full rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] ${i < 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#b9aed4] font-bold">Scene 3 · Heartstrings</p>
            </div>
        ),
    },
];

const WINK_MESSAGES = [
    'Sealed with wax. It does not budge. 😉',
    'Nice try. The seal holds until unlock.',
    'Almost. This one opens after payment.',
];

export default function PremiumLocker({ to = 'them', priceLabel = '₹49', giftMode = false, onUnlock }) {
    const [tab, setTab] = useState(0);
    const [tries, setTries] = useState(0);
    const cardRef = useRef(null);
    const sealRef = useRef(null);
    const current = SEALED_TABS[tab] || SEALED_TABS[0];

    // The tap must visibly fail: a short shake and a wax pulse, then a wink.
    const tryOpen = () => {
        setTries((t) => t + 1);
        try {
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
            const card = cardRef.current;
            const seal = sealRef.current;
            if (card) {
                gsap.killTweensOf(card);
                gsap.fromTo(card, { x: 0 }, { x: 7, duration: 0.055, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'x' });
            }
            if (seal) {
                gsap.killTweensOf(seal);
                gsap.fromTo(seal, { scale: 1 }, { scale: 1.3, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'scale' });
            }
        } catch {}
    };

    return (
        <section className="prm-act relative px-5 sm:px-8 py-20 sm:py-28 overflow-hidden" aria-label="Locked premium acts">
            {/* Interactive sealed preview: the lock is an experience, not a badge */}
            <div className="max-w-2xl mx-auto mb-20 sm:mb-24">
                <div className="text-center mb-5">
                    <p className="prm-eyebrow mb-2">✦ Tap to try opening ✦</p>
                    <p className="text-xs text-[#b9aed4]">These are the real chapters, seen through wax. Go on, try.</p>
                </div>

                {/* Tab rail */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4" role="tablist" aria-label="Sealed chapters">
                    {SEALED_TABS.map((t, i) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === i}
                            onClick={() => setTab(i)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                tab === i
                                    ? 'bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] shadow-md'
                                    : 'border border-white/15 text-[#b9aed4] hover:text-white hover:border-white/35'
                            }`}
                        >
                            <t.icon className="w-3.5 h-3.5" aria-hidden="true" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* Sealed panel */}
                <button
                    type="button"
                    onClick={tryOpen}
                    className="relative block w-full text-left cursor-not-allowed"
                    aria-label={`${current.label} is sealed until unlock. Tap to try opening.`}
                >
                    <div ref={cardRef} className="relative prm-locker-card rounded-[1.5rem] p-5 sm:p-7 overflow-hidden">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <p className="prm-serif text-base sm:text-lg font-bold text-[#f7dc9a]">
                                {current.title.includes('{to}') ? current.title.replace('{to}', to) : current.title}
                            </p>
                            <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-[#f2c14e]/40 bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#f7dc9a]">
                                <Lock className="w-3 h-3" aria-hidden="true" /> Sealed
                            </span>
                        </div>
                        <div className="prm-lock-blur select-none" aria-hidden="true">
                            {current.body}
                        </div>
                        {/* Wax medallion, pulses on failed open */}
                        <span
                            ref={sealRef}
                            className="absolute -bottom-4 -right-3 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#a32638] to-[#68111d] border-2 border-amber-300/50 shadow-[0_14px_35px_rgba(0,0,0,0.6)]"
                            aria-hidden="true"
                        >
                            <span className="prm-serif text-amber-200 text-xl font-extrabold">✦</span>
                        </span>
                    </div>
                </button>

                <p className="mt-4 text-center text-xs font-bold text-[#f7dc9a] min-h-[1.25rem]" role="status" aria-live="polite">
                    {tries > 0 ? WINK_MESSAGES[(tries - 1) % WINK_MESSAGES.length] : '\u00A0'}
                </p>
            </div>

            {/* The lock card */}
            <div className="relative max-w-xl mx-auto px-1">
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
                            you show them <em>exactly how much</em> they mean to you, in words they
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
                                    desc: 'Not vague words. Real commitments they can point to someday.',
                                },
                                {
                                    icon: Images,
                                    title: 'The memory album',
                                    desc: 'Up to 12 photos as instant-film cards that open fullscreen.',
                                },
                                {
                                    icon: Film,
                                    title: 'A cinema film + keepsake image',
                                    desc: 'Four scenes with their name in the credits, plus a card to save.',
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
                            Your free birthday card is already sent. This is an optional keepsake upgrade.
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
