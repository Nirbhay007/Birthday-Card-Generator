'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Heart, ChevronDown, Sparkles, Infinity as InfinityIcon, Gift } from 'lucide-react';
import CandleBlower from '@/components/CandleBlower';
import { BIRTHDAY_OPENED_EVENT } from '@/lib/music';
import Starfield from './Starfield';
import Reveal from './Reveal';
import PremiumLocker from './PremiumLocker';
import Marquee from './Marquee';
import Magnetic from './Magnetic';
import { OCCASIONS, fill } from './occasions';
import { TONES } from './relationships';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

function useTypewriter(text, start, speed = 85) {
    const [out, setOut] = useState('');
    // Render-phase reset when the name changes (no setState-in-effect).
    const [prev, setPrev] = useState(text);
    if (prev !== text) {
        setPrev(text);
        setOut('');
    }
    useEffect(
        () => {
            if (!start) return;
            let i = 0;
            const t = setInterval(() => {
                i += 1;
                setOut(text.slice(0, i));
                if (i >= text.length) clearInterval(t);
            }, speed);
            return () => clearInterval(t);
        },
        [text, start, speed]
    );
    return out;
}

function burst(big = false) {
    try {
        confetti({ particleCount: big ? 220 : 120, spread: big ? 100 : 75, origin: { y: 0.6 }, disableForReducedMotion: true, colors: ['#f2c14e', '#fff7dd', '#fb7185', '#c084fc'] });
        if (big) {
            setTimeout(() => {
                confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true });
                confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true });
            }, 350);
        }
    } catch {}
}

export default function PremiumExperience({
    to = 'Aisha',
    from = 'Your Person',
    message = '',
    age = null,
    deck = null,
    custom = null,
    tone = null,
    unlocked = false,
    giftMode = false,
    onUnlockRequest,
    audioSlot = null,
}) {
    const D = deck || OCCASIONS.birthday;
    const T = tone || TONES.romantic;
    const ctx = { to, from };
    const ageBit = age ? fill(D.letterCloseAge, ctx).replaceAll('{age}', String(age)) : '';
    // Giver's own words win over templates whenever present.
    const customReasons = (custom?.reasons || [])
        .filter((r) => r && (String(r.t || '').trim() || String(r.d || '').trim()))
        .slice(0, 3)
        .map((r, i) => ({
            e: ['🌟', '💛', '✨'][i % 3],
            t: String(r.t || '').trim() || `Reason ${i + 1}`,
            d: String(r.d || '').trim(),
        }));
    const reasonsList = customReasons.length ? customReasons : D.reasons;
    const customVows = (custom?.vows || []).map((v) => String(v || '').trim()).filter(Boolean).slice(0, 3);
    const vowsList = customVows.length ? customVows : D.vows;
    const letterText = message || String(custom?.letter || '').trim() || fill(D.letterMid, ctx);
    const [unsealed, setUnsealed] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [loves, setLoves] = useState(0);
    // Preloader veil: SSR shows it; reduced-motion visitors skip it on first
    // paint (hydration covered by suppressHydrationWarning on the gate).
    const [veil, setVeil] = useState(() => {
        try {
            return typeof window === 'undefined' || !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        } catch {
            return false;
        }
    });
    const rootRef = useRef(null);
    const sealRef = useRef(null);
    const countRef = useRef(null);
    const veilRef = useRef(null);
    const ritualRunning = useRef(false);
    const typedTo = useTypewriter(to, unsealed, 95);

    const unseal = () => {
        setUnsealed(true);
        try { window.dispatchEvent(new CustomEvent(BIRTHDAY_OPENED_EVENT)); } catch {}
        burst();
    };

    // Wax-seal breaking ritual: squash → shatter → universe opens.
    const sealRitual = () => {
        if (ritualRunning.current) return;
        try {
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
                unseal();
                return;
            }
            const seal = sealRef.current;
            if (!seal) {
                unseal();
                return;
            }
            ritualRunning.current = true;
            gsap.timeline({ onComplete: unseal })
                .to(seal, { scale: 1.28, duration: 0.28, ease: 'power2.in' })
                .to(seal, { scale: 0, rotation: 140, opacity: 0, duration: 0.5, ease: 'expo.in' }, '>-0.04')
                .to('.prm-envelope-flash', { opacity: 1, duration: 0.18, ease: 'power1.out' }, '<');
        } catch {
            unseal();
        }
    };

    // Preloader: counter 000→100, then the curtain lifts off the gate.
    useGSAP(
        () => {
            if (unsealed || !veil) return;
            const num = countRef.current;
            const veilEl = veilRef.current;
            if (!veilEl) {
                setVeil(false);
                return;
            }
            const o = { v: 0 };
            const tl = gsap.timeline({ onComplete: () => setVeil(false) });
            tl.fromTo('.prm-veil-bar', { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);
            tl.to(o, {
                v: 100,
                duration: 1.6,
                ease: 'power2.inOut',
                onUpdate: () => {
                    if (num) num.textContent = String(Math.round(o.v)).padStart(3, '0');
                },
            }, 0)
                .to('.prm-veil-inner', { yPercent: -30, opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.1')
                .to(veilEl, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.05');
            return () => {
                tl.kill();
            };
        },
        { scope: rootRef, dependencies: [unsealed, veil] }
    );
    // Scroll choreography: scrubbed hero exit, masked title reveals, letter
    // line-reads, clip-path rises, and a pinned horizontal Reasons gallery.
    // Static choreography (never touches edited text): hero exit, card
    // rises, and the pinned Reasons gallery. Re-created only when the page
    // structure itself changes (unseal / unlock / card count).
    useGSAP(
        () => {
            if (!unsealed) return;
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

            // Showcase-style hero exit: the arrival scales into the sky.
            const heroInner = document.querySelector('.prm-hero-inner');
            if (heroInner) {
                gsap.to(heroInner, {
                    scale: 1.18,
                    opacity: 0.08,
                    y: -90,
                    ease: 'none',
                    scrollTrigger: { trigger: '.prm-hero', start: 'top top', end: 'bottom top', scrub: true },
                });
            }

            gsap.utils.toArray('.prm-gsap-rise').forEach((el) => {
                gsap.from(el, {
                    y: 70,
                    opacity: 0,
                    scale: 0.96,
                    clipPath: 'inset(10% 5% 10% 5% round 32px)',
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 88%' },
                });
            });

            // Desktop-only pinned horizontal scroll for the Reasons gallery.
            const mm = gsap.matchMedia();
            mm.add('(min-width: 1024px)', () => {
                const track = document.querySelector('.prm-reasons-track');
                const section = document.querySelector('.prm-reasons-pin');
                if (!track || !section) return;
                const getX = () => Math.max(0, track.scrollWidth - window.innerWidth);
                const tween = gsap.to(track, {
                    x: () => -getX(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: () => `+=${getX()}`,
                        pin: true,
                        scrub: 1,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });
                return () => {
                    tween.scrollTrigger?.kill();
                    tween.kill();
                    gsap.set(track, { x: 0 });
                };
            });

            return () => {
                mm.revert();
            };
        },
        { scope: rootRef, dependencies: [unsealed, unlocked, reasonsList.length] }
    );

    // Letter reading animation: SplitText RESTRUCTURES the DOM, so it must
    // re-run whenever the letter text itself changes (age, names, edits,
    // occasion). Isolated here so re-splitting never disturbs the pin above.
    // Titles deliberately use IO Reveals instead — SplitText on React-managed
    // text that changes is what froze the page.
    const introText = fill(T.letterIntro || D.letterIntro || 'Some people make life feel lighter, warmer, and so much more meaningful just by being around. That is what you have always done for me.', ctx);
    const letterSig = `${introText}||${letterText}||${ageBit}`;

    // Edited text changes section heights above scroll triggers (letter grows,
    // cards added). Re-measure shortly after typing stops, or entrances and
    // the pin fire at stale positions. Timer-only effect, no setState.
    useEffect(() => {
        if (!unsealed) return;
        const t = setTimeout(() => {
            try { ScrollTrigger.refresh(); } catch {}
        }, 400);
        return () => clearTimeout(t);
    }, [unsealed, unlocked, letterSig, reasonsList.length]);

    // Webfont swaps reflow lines after first paint; re-measure once loaded.
    useEffect(() => {
        if (!unsealed) return;
        try {
            document.fonts?.ready
                ?.then(() => {
                    try { ScrollTrigger.refresh(); } catch {}
                })
                .catch(() => {});
        } catch {}
    }, [unsealed, unlocked]);

    useGSAP(
        () => {
            if (!unsealed || !unlocked) return;
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
            let split = null;
            const letter = document.querySelector('.prm-gsap-letter');
            if (letter) {
                try {
                    split = new SplitText(letter, { type: 'lines', linesClass: 'prm-gsap-line' });
                    gsap.from(split.lines, {
                        opacity: 0.12,
                        y: 14,
                        duration: 0.7,
                        ease: 'power2.out',
                        stagger: 0.08,
                        scrollTrigger: { trigger: letter, start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
                    });
                } catch {}
            }
            return () => {
                try { split?.revert(); } catch {}
            };
        },
        { scope: rootRef, dependencies: [unsealed, unlocked, letterSig] }
    );

    const showerLove = () => {
        const id = Date.now() + Math.random();
        setHearts((h) => [...h.slice(-14), id]);
        setLoves((c) => c + 1);
        setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1600);
        if (loves % 5 === 4) burst();
    };

    const scrollToId = (id) => {
        try { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    };

    return (
        <div ref={rootRef} className="prm-root prm-body relative">
            {/* ── GATE: the sealed envelope ─────────────────────────── */}
            {!unsealed && (
                <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden" suppressHydrationWarning>
                    <div className="absolute inset-0" aria-hidden="true"><Starfield /></div>
                    {/* Preloader curtain */}
                    {veil && (
                        <div ref={veilRef} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070412]">
                            <div className="prm-veil-inner flex flex-col items-center px-6">
                                <p className="prm-eyebrow mb-6">✦ Sealing your universe ✦</p>
                                <p className="prm-serif font-extrabold leading-none text-[clamp(4rem,18vw,8rem)] prm-gold-text tabular-nums">
                                    <span ref={countRef}>000</span>
                                </p>
                                <div className="mt-6 h-px w-48 bg-white/10 overflow-hidden" aria-hidden="true">
                                    <div className="prm-veil-bar h-full w-full origin-left bg-gradient-to-r from-[#f2c14e] to-[#fb7185]" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="relative z-10 max-w-lg w-full">
                        <p className="prm-eyebrow mb-6">✦ A special surprise ✦</p>
                        <h1 className="prm-serif text-3xl sm:text-5xl font-extrabold mb-3 break-words">
                            {to}, this was made just for you.
                        </h1>
                        <p className="prm-lead mb-10">
                            {from} put together something special from the heart.
                            Full of memories, honest words, and love. Tap the seal to step inside.
                        </p>
                        <div className="prm-envelope relative rounded-[2rem] px-6 py-10 sm:p-12 overflow-hidden">
                            <div className="prm-envelope-flash absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_50%_45%,rgba(247,220,154,0.85),transparent_65%)]" aria-hidden="true" />
                            <Magnetic strength={34} className="relative mx-auto block w-fit">
                                <button ref={sealRef} type="button" onClick={sealRitual} className="prm-seal mx-auto relative" aria-label={`Break the seal and open ${to}'s surprise`}>
                                    <span className="prm-serif text-4xl sm:text-5xl text-white/95 font-extrabold select-none" aria-hidden="true">
                                        {to.charAt(0) || '♥'}
                                    </span>
                                </button>
                            </Magnetic>
                            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#f7dc9a] animate-pulse">
                                👆 Tap the seal to unseal
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {unsealed && (
                <>
                    {/* ── ACT I (free): arrival ─────────────────────── */}
                    <section className="prm-hero prm-act relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
                        <div className="absolute inset-0" aria-hidden="true"><Starfield /></div>
                        <div className="prm-hero-inner relative z-10 max-w-3xl mx-auto">
                            <Reveal><p className="prm-eyebrow mb-6">✦ Act I · The Arrival ✦</p></Reveal>
                            <Reveal delay={120}>
                                <p className="prm-serif italic text-lg sm:text-2xl text-[#f7dc9a] mb-4">{D.heroKicker}</p>
                            </Reveal>
                            <h2 className="prm-serif prm-h-display prm-gold-text min-h-[1.15em] px-4 break-words" aria-label={`Happy Birthday ${to}`}>
                                <span className="prm-caret">{typedTo}</span>
                                <span className="sr-only">{to}</span>
                            </h2>
                            <Reveal delay={250}>
                                <p className="prm-lead max-w-xl mx-auto mt-6">
                                    {fill(D.heroSub, ctx)}
                                </p>
                            </Reveal>
                            <Reveal delay={400}>
                                <button
                                    type="button"
                                    onClick={() => scrollToId(unlocked ? 'prm-letter' : 'prm-locker')}
                                    className="mt-10 inline-flex flex-col items-center gap-2 text-[#f7dc9a] font-bold text-sm tracking-widest uppercase hover:opacity-80 transition-opacity"
                                >
                                    {unlocked ? 'Continue the journey' : 'See what’s sealed inside'}
                                    <ChevronDown className="w-6 h-6 prm-scroll-cue" aria-hidden="true" />
                                </button>
                            </Reveal>
                        </div>
                    </section>

                    {/* Kinetic ribbon between arrival and the vault */}
                    <Marquee items={D.marquee1.map((s) => fill(s, ctx))} />

                    {/* ── LOCKER (locked state) ─────────────────────── */}
                    {!unlocked && (
                        <div id="prm-locker">
                            <PremiumLocker to={to} giftMode={giftMode} onUnlock={onUnlockRequest} />
                        </div>
                    )}

                    {/* ── ACTS II–V (unlocked) ──────────────────────── */}
                    {unlocked && (
                        <>
                            {/* ACT II · The Letter */}
                            <section id="prm-letter" className="prm-act relative px-5 sm:px-8 py-24 sm:py-32">
                                <div className="max-w-2xl mx-auto">
                                    <Reveal className="text-center"><p className="prm-eyebrow mb-6">✦ Act II · The Letter ✦</p></Reveal>
                                    <Reveal>
                                        <h3 className="prm-serif prm-h-act text-center mb-10">
                                            A letter <span className="prm-gold-text">from the heart</span>
                                        </h3>
                                    </Reveal>
                                    <Reveal delay={200}>
                                        <article className="prm-paper rounded-2xl p-5 sm:p-12 prm-drift">
                                            <p className="prm-serif text-lg sm:text-xl leading-relaxed">
                                                Dear {to},
                                            </p>
                                            {/* key= remounts this block on any text change, handing SplitText
                                                a clean DOM every time. Without it, React edits detached nodes
                                                SplitText removed, revert() restores stale text, and the letter
                                                freezes (this is what broke age typing). */}
                                            <div key={letterSig} className="prm-gsap-letter prm-serif text-base sm:text-lg leading-[1.9] mt-4 space-y-4">
                                                <p>
                                                    {introText}
                                                </p>
                                                <p className="whitespace-pre-line">
                                                    {letterText}
                                                </p>
                                                <p>
                                                    {D.letterCloseMain}{ageBit}.
                                                </p>
                                            </div>
                                            <p className="prm-serif italic text-right mt-8 text-lg">
                                                {T.signOff}, {from} 💜
                                            </p>
                                        </article>
                                    </Reveal>
                                </div>
                            </section>

                            <div className="prm-divider max-w-3xl mx-auto" aria-hidden="true" />

                            {/* ACT III · Reasons (horizontal pin on desktop) */}
                            <section className="prm-act prm-reasons-pin relative lg:h-screen lg:flex lg:flex-col lg:justify-center overflow-hidden py-24 sm:py-32 lg:py-0">
                                <div className="max-w-4xl lg:max-w-none mx-auto lg:mx-0 text-center w-full px-5 sm:px-8">
                                    <Reveal><p className="prm-eyebrow mb-6">✦ Act III · The Reasons ✦</p></Reveal>
                                    <Reveal>
                                        <h3 className="prm-serif prm-h-act mb-4">
                                            {D.reasonsTitleMain} <span className="prm-gold-text">{D.reasonsTitleAccent}</span>
                                        </h3>
                                    </Reveal>
                                    <Reveal delay={200}>
                                        <p className="prm-lead max-w-xl mx-auto mb-10">{D.reasonsSub} <span className="hidden lg:inline">Keep scrolling. The gallery moves sideways.</span></p>
                                    </Reveal>
                                </div>
                                <div className="prm-reasons-track flex flex-col gap-4 sm:gap-5 lg:flex-row lg:gap-6 lg:w-max lg:px-[8vw] px-5 sm:px-8 max-w-4xl lg:max-w-none mx-auto lg:mx-0 text-left">
                                    {reasonsList.map((r) => (
                                        <div key={r.t} className="prm-card rounded-2xl p-6 lg:p-8 lg:w-[26rem] lg:shrink-0">
                                            <div className="text-3xl lg:text-4xl mb-3" aria-hidden="true">{r.e}</div>
                                            <h4 className="prm-serif text-xl lg:text-2xl font-bold text-[#f7dc9a] mb-2">{r.t}</h4>
                                            <p className="text-sm lg:text-base leading-relaxed text-[#cfc4e8]">{fill(r.d, ctx)}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="prm-divider max-w-3xl mx-auto" aria-hidden="true" />

                            {/* ACT IV · Vows */}
                            <section className="prm-act relative px-5 sm:px-8 py-24 sm:py-32 text-center">
                                <div className="max-w-2xl mx-auto">
                                    <Reveal><p className="prm-eyebrow mb-6">✦ Act IV · The Vows ✦</p></Reveal>
                                    <Reveal>
                                        <h3 className="prm-serif prm-h-act mb-4">
                                            {T.vowsTitleMain || D.vowsTitleMain} <span className="prm-gold-text">{T.vowsTitleAccent || D.vowsTitleAccent}</span>
                                        </h3>
                                    </Reveal>
                                    <div className="mt-10 space-y-4 text-left">
                                        {vowsList.map((v, i) => (
                                            <Reveal key={i} delay={i * 140}>
                                                <div className="prm-card rounded-2xl p-5 sm:p-6 flex gap-4 items-start">
                                                    <span className="prm-serif text-3xl font-extrabold prm-gold-text shrink-0" aria-hidden="true">
                                                        {['I', 'II', 'III'][i]}
                                                    </span>
                                                    <p className="prm-serif italic text-base sm:text-lg leading-relaxed pt-1">{v}</p>
                                                </div>
                                            </Reveal>
                                        ))}
                                    </div>
                                    <Reveal delay={200}>
                                        <p className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#f7dc9a]">
                                            <InfinityIcon className="w-4 h-4" aria-hidden="true" /> A promise for every tomorrow.
                                        </p>
                                    </Reveal>
                                </div>
                            </section>

                            <div className="prm-divider max-w-3xl mx-auto" aria-hidden="true" />

                            <Marquee items={D.marquee2.map((s) => fill(s, ctx))} />

                            {/* ACT V · Finale */}
                            <section className="prm-act relative px-5 sm:px-8 py-24 sm:py-32 text-center overflow-hidden">
                                <div className="absolute inset-0 opacity-60" aria-hidden="true"><Starfield density={0.6} /></div>
                                <div className="relative z-10 max-w-3xl mx-auto">
                                    <Reveal><p className="prm-eyebrow mb-6">✦ Act V · The Finale ✦</p></Reveal>
                                    <Reveal>
                                        <h3 className="prm-serif prm-h-act mb-4">
                                            {fill(D.finaleTitleMain, ctx)} <span className="prm-gold-text">{fill(D.finaleTitleAccent, ctx)}</span>
                                        </h3>
                                    </Reveal>
                                    <div className="prm-gsap-rise mt-8 rounded-[2rem] border border-[rgba(242,193,78,0.3)] bg-[rgba(255,255,255,0.04)] backdrop-blur-md p-4 sm:p-8">
                                        <CandleBlower age={age} recipientName={to} />
                                    </div>
                                    <Reveal delay={260}>
                                        <div className="mt-10">
                                            <div className="relative inline-block">
                                                <button
                                                    type="button"
                                                    onClick={showerLove}
                                                    className="prm-shimmer-btn inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-base shadow-[0_20px_60px_rgba(242,193,78,0.35)] transition-transform hover:scale-105 active:scale-95"
                                                    aria-label={`Shower ${to} with love`}
                                                >
                                                    <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
                                                    {loves > 0 ? `Shower love · ${loves}` : 'Shower them with love'}
                                                </button>
                                                {hearts.map((id) => (
                                                    <span
                                                        key={id}
                                                        className="absolute left-1/2 -top-2 text-2xl pointer-events-none"
                                                        style={{ animation: 'smoke-rise 1.5s ease-out forwards', marginLeft: `${(id % 60) - 30}px` }}
                                                        aria-hidden="true"
                                                    >
                                                        💜
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#b9aed4]">
                                                <Sparkles className="w-3.5 h-3.5 text-[#f2c14e]" aria-hidden="true" />
                                                Made with all my heart by {from}
                                            </p>
                                            <Link
                                                href="/"
                                                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f7dc9a] underline decoration-dotted underline-offset-4 hover:opacity-80"
                                            >
                                                <Gift className="w-4 h-4" aria-hidden="true" /> Make one this magical. Free to start
                                            </Link>
                                        </div>
                                    </Reveal>
                                </div>
                            </section>
                        </>
                    )}
                </>
            )}

            {audioSlot}
        </div>
    );
}
