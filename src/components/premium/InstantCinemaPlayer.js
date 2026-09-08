'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import confetti from 'canvas-confetti';
import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    SkipBack,
    Heart,
    Sparkles,
    ScrollText,
    X,
    Lock,
} from 'lucide-react';
import CinemaCanvas from './CinemaCanvas';
import CandleBlower from '@/components/CandleBlower';
import { BIRTHDAY_OPENED_EVENT } from '@/lib/music';

gsap.registerPlugin(useGSAP);

const SCENE_DURATIONS = [6500, 7500, 8500, 12000]; // ms per scene

export default function InstantCinemaPlayer({
    to = 'Aisha',
    from = 'Your Person',
    photoUrl = null,
    quote = null,
    letter = '',
    age = null,
    theme = 'gold',
    unlocked = false,
    giftMode = false,
    onUnlock = null,
    onCloseToScroll = null,
    onClose = null,
}) {
    // In the actual viewer's link (giftMode), recipients receive the full tribute without teaser cut-offs or paywalls:
    const isTeaser = !giftMode && !unlocked;
    const [currentScene, setCurrentScene] = useState(0);
    const [showPaywallScene, setShowPaywallScene] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState([0, 0, 0, 0]);
    const [heartBurst, setHeartBurst] = useState(0);
    const [loveCount, setLoveCount] = useState(0);
    const [candleBlown, setCandleBlown] = useState(false);

    const sceneContainerRef = useRef(null);
    const timerRef = useRef(null);
    const sceneStartRef = useRef(0);
    const elapsedBeforePauseRef = useRef(0);

    const handleDismiss = useCallback(() => {
        if (onClose) onClose();
        else if (onCloseToScroll) onCloseToScroll();
    }, [onClose, onCloseToScroll]);

    // Escape key listener to close cinema player
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleDismiss();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleDismiss]);

    // Heartfelt fallback quote if none provided
    const displayQuote =
        quote ||
        `"Some people make life feel lighter, warmer, and so much more meaningful just by being in it. That is what you have always done for me."`;

    // Trigger birthday music on mount
    useEffect(() => {
        try {
            window.dispatchEvent(new CustomEvent(BIRTHDAY_OPENED_EVENT));
        } catch {}
    }, []);

    // Scene transition helper
    const goToScene = useCallback((sceneIndex) => {
        if (isTeaser && sceneIndex >= 2) {
            setShowPaywallScene(true);
            setIsPlaying(false);
            return;
        }
        setShowPaywallScene(false);
        const target = Math.max(0, Math.min(3, sceneIndex));
        setCurrentScene(target);
        elapsedBeforePauseRef.current = 0;
        sceneStartRef.current = Date.now();
        setProgress((prev) => {
            const next = [...prev];
            for (let i = 0; i < 4; i++) {
                if (i < target) next[i] = 100;
                else if (i === target) next[i] = 0;
                else next[i] = 0;
            }
            return next;
        });
        setHeartBurst((h) => h + 1);
    }, [isTeaser]);

    // Next / Prev
    const nextScene = useCallback(() => {
        if (isTeaser && currentScene >= 1) {
            setShowPaywallScene(true);
            setIsPlaying(false);
            return;
        }
        if (currentScene < 3) {
            goToScene(currentScene + 1);
        } else {
            setIsPlaying(false);
        }
    }, [currentScene, goToScene, isTeaser]);

    const prevScene = useCallback(() => {
        if (showPaywallScene) {
            setShowPaywallScene(false);
            goToScene(1);
            setIsPlaying(true);
            return;
        }
        if (currentScene > 0) goToScene(currentScene - 1);
        else goToScene(0);
    }, [currentScene, goToScene, showPaywallScene]);

    // Timeline progress ticker
    useEffect(() => {
        if (!isPlaying || showPaywallScene || (currentScene === 3 && candleBlown)) {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
            return;
        }

        const duration = SCENE_DURATIONS[currentScene];

        const tick = () => {
            const elapsed = Date.now() - sceneStartRef.current + elapsedBeforePauseRef.current;
            const pct = Math.min(100, (elapsed / duration) * 100);

            setProgress((prev) => {
                const next = [...prev];
                next[currentScene] = pct;
                return next;
            });

            if (elapsed >= duration) {
                if (isTeaser && currentScene >= 1) {
                    setProgress((prev) => {
                        const next = [...prev];
                        next[0] = 100;
                        next[1] = 100;
                        return next;
                    });
                    setShowPaywallScene(true);
                    setIsPlaying(false);
                } else if (currentScene < 3) {
                    nextScene();
                } else {
                    setIsPlaying(false);
                }
            } else {
                timerRef.current = requestAnimationFrame(tick);
            }
        };

        sceneStartRef.current = Date.now();
        timerRef.current = requestAnimationFrame(tick);

        return () => {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
        };
    }, [isPlaying, currentScene, nextScene, candleBlown, isTeaser, showPaywallScene]);

    // Play / Pause toggle
    const togglePlay = () => {
        if (showPaywallScene) {
            setShowPaywallScene(false);
            goToScene(0);
            setIsPlaying(true);
            return;
        }
        if (isPlaying) {
            elapsedBeforePauseRef.current += Date.now() - sceneStartRef.current;
            setIsPlaying(false);
        } else {
            if (currentScene === 3 && progress[3] >= 100) {
                goToScene(0);
            }
            sceneStartRef.current = Date.now();
            setIsPlaying(true);
        }
    };

    // GSAP Scene Transitions
    useGSAP(
        () => {
            const scope = sceneContainerRef.current;
            if (!scope) return;

            // Kill any active tweens on transition
            gsap.killTweensOf(scope.querySelectorAll('.prm-cin-item'));

            // Animate items into view
            gsap.fromTo(
                scope.querySelectorAll('.prm-cin-item'),
                {
                    opacity: 0,
                    y: 28,
                    scale: 0.94,
                    filter: 'blur(8px)',
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1.1,
                    stagger: 0.22,
                    ease: 'power3.out',
                }
            );

            // Subtle Ken Burns slow push-in on Scene 2 portrait
            const portraitImg = scope.querySelector('.prm-cin-portrait-img');
            if (portraitImg) {
                gsap.fromTo(
                    portraitImg,
                    { scale: 1, rotation: -0.5 },
                    { scale: 1.1, rotation: 0.5, duration: 7.5, ease: 'sine.inOut' }
                );
            }

            // Light leak sweep effect
            const leak = scope.querySelector('.prm-cin-light-leak');
            if (leak) {
                gsap.fromTo(
                    leak,
                    { xPercent: -100, opacity: 0 },
                    { xPercent: 120, opacity: 0.55, duration: 2.2, ease: 'power2.inOut' }
                );
            }
        },
        { scope: sceneContainerRef, dependencies: [currentScene] }
    );

    // Candle blow handler
    const handleCandleBlown = () => {
        setCandleBlown(true);
        setHeartBurst((h) => h + 2);
        try {
            confetti({
                particleCount: 160,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#f2c14e', '#fb7185', '#38bdf8', '#a855f7', '#ffffff'],
            });
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 60,
                    spread: 70,
                    origin: { x: 0.1, y: 0.7 },
                });
                confetti({
                    particleCount: 100,
                    angle: 120,
                    spread: 70,
                    origin: { x: 0.9, y: 0.7 },
                });
            }, 300);
        } catch {}
    };

    const handleShowerLove = () => {
        setLoveCount((c) => c + 1);
        setHeartBurst((h) => h + 1);
        try {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#fb7185', '#f43f5e', '#fda4af'],
            });
        } catch {}
    };

    return (
        <div className="prm-cin-theater fixed inset-0 z-50 flex flex-col justify-between bg-[#04020a] text-white overflow-hidden select-none">
            {/* Interactive Canvas UI Layer */}
            <CinemaCanvas heartBurstTrigger={heartBurst} theme={theme} />

            {/* Cinematic Light Leak */}
            <div
                className="prm-cin-light-leak pointer-events-none absolute inset-0 z-10 opacity-30 bg-gradient-to-r from-transparent via-[#f2c14e]/20 to-transparent mix-blend-screen"
                aria-hidden="true"
            />

            {/* Top Letterbox Bar & Timeline Header */}
            <header className="relative z-20 w-full pt-[max(1rem,env(safe-area-inset-top))] pb-2 px-4 sm:px-8 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-sm">
                {/* 4-Segment Instagram/Cinema Progress Timeline */}
                <div className="max-w-2xl mx-auto flex items-center gap-2 mb-3">
                    {[0, 1, 2, 3].map((idx) => {
                        const isLockedSeg = isTeaser && idx >= 2;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => goToScene(idx)}
                                className={`relative flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden transition-all hover:h-2.5 ${
                                    isLockedSeg ? 'bg-white/10' : 'bg-white/15'
                                }`}
                                aria-label={`Jump to scene ${idx + 1}${isLockedSeg ? ' (Locked)' : ''}`}
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-[#f2c14e] via-[#fb7185] to-[#f43f5e] transition-all duration-100 ease-linear rounded-full"
                                    style={{ width: `${progress[idx]}%` }}
                                />
                                {isLockedSeg && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-60">
                                        <Lock className="w-2 h-2 text-amber-200" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Top Control Bar */}
                <div className="max-w-4xl mx-auto flex items-center justify-between text-xs tracking-wider">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2c14e]/15 border border-[#f2c14e]/30 text-[#f7dc9a] font-bold uppercase tracking-widest text-[10px]">
                            <Sparkles className="w-3 h-3 text-[#f2c14e]" />
                            {isTeaser
                                ? showPaywallScene
                                    ? '✦ Preview Finished · Locked ✦'
                                    : `15s Teaser Preview · Scene ${currentScene + 1}/2`
                                : `Cinema Tribute · Scene ${currentScene + 1}/4`}
                        </span>
                        <span className="hidden sm:inline text-white/50 font-medium">
                            {showPaywallScene
                                ? 'Unlock for Full Tribute'
                                : ['Overture', 'The Memory', 'Heartstrings', 'Grand Wish'][currentScene]}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {onCloseToScroll && (
                            <button
                                type="button"
                                onClick={onCloseToScroll}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 font-medium text-xs border border-white/10 transition-colors backdrop-blur-md cursor-pointer"
                                title="Switch to Letter Scroll View"
                            >
                                <ScrollText className="w-3.5 h-3.5 text-[#f2c14e]" />
                                <span className="hidden sm:inline">Letter Scroll</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white/90 hover:text-white transition-colors border border-white/15 cursor-pointer"
                            title="Close Cinema (Esc)"
                            aria-label="Close Cinema"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Cinema Viewport (Scene Switcher) */}
            <main
                ref={sceneContainerRef}
                className="relative z-20 flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-center justify-start sm:justify-center px-4 sm:px-8 py-4 text-center max-w-4xl mx-auto w-full"
            >
                {/* ═══════════════════════════════════════════════════════════
                    TEASER PAYWALL CURTAIN (LOCKED PREVIEW SCENE)
                ═══════════════════════════════════════════════════════════ */}
                {showPaywallScene && (
                    <div className="prm-cin-item flex flex-col items-center justify-center space-y-5 max-w-lg mx-auto w-full px-4 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="relative group">
                            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#f2c14e]/40 via-[#fb7185]/35 to-[#a855f7]/35 blur-2xl opacity-90 animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#f2c14e] via-[#d97706] to-[#78350f] p-0.5 shadow-[0_15px_40px_rgba(242,193,78,0.5)] flex items-center justify-center">
                                <div className="w-full h-full rounded-full bg-[#180928] flex items-center justify-center border border-[#f2c14e]/40">
                                    <Lock className="w-9 h-9 text-[#f2c14e]" />
                                </div>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f2c14e]/15 border border-[#f2c14e]/30 text-[#f7dc9a] font-black uppercase tracking-widest text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-[#f2c14e]" />
                            15-Second Free Preview Complete
                        </div>

                        <div className="space-y-2">
                            <h2 className="prm-serif text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                                The rest of <span className="prm-gold-text">{to}</span>’s tribute is sealed.
                            </h2>
                            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                                The personal handwritten letter & interactive candle blowout ceremony with confetti unlock when you send this gift.
                            </p>
                        </div>

                        <div className="w-full max-w-xs space-y-3 pt-2">
                            {onUnlock && (
                                <button
                                    type="button"
                                    onClick={onUnlock}
                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#f2c14e] via-[#fb7185] to-[#f43f5e] text-[#241031] font-black text-sm sm:text-base shadow-[0_12px_35px_rgba(242,193,78,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                    <Lock className="w-4 h-4" /> Unlock Full Tribute · ₹49
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPaywallScene(false);
                                    goToScene(0);
                                    setIsPlaying(true);
                                }}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 font-bold text-xs sm:text-sm border border-white/15 transition-all cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-[#f2c14e]" /> Replay 15s Preview
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    SCENE 1: THE OVERTURE & DEDICATION
                ═══════════════════════════════════════════════════════════ */}
                {!showPaywallScene && currentScene === 0 && (
                    <div className="flex flex-col items-center justify-center space-y-6 max-w-xl my-auto">
                        <div className="prm-cin-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs uppercase tracking-[0.3em] text-[#f7dc9a]">
                            <Sparkles className="w-3.5 h-3.5 text-[#f2c14e]" /> A Cinematic Gift
                        </div>

                        <h1 className="prm-cin-item prm-serif text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                            For the one who lights up <br />
                            <span className="prm-gold-text italic">every single room.</span>
                        </h1>

                        <div className="prm-cin-item prm-serif text-4xl sm:text-6xl font-black prm-gold-text tracking-wide drop-shadow-[0_0_35px_rgba(242,193,78,0.45)]">
                            Happy Birthday, {to}!
                        </div>

                        <p className="prm-cin-item text-sm sm:text-lg text-white/70 max-w-md font-light leading-relaxed">
                            Crafted with pure love and devotion by <span className="text-[#f7dc9a] font-semibold">{from}</span>.
                            Sit back and let this moment belong entirely to you.
                        </p>

                        <div className="prm-cin-item pt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => goToScene(1)}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-sm shadow-[0_12px_35px_rgba(242,193,78,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                            >
                                Enter The Memory <SkipForward className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    SCENE 2: THE STARLIGHT MEMORY (KEN BURNS 3D PORTRAIT)
                ═══════════════════════════════════════════════════════════ */}
                {!showPaywallScene && currentScene === 1 && (
                    <div className="flex flex-col items-center justify-center space-y-5 max-w-xl my-auto">
                        <div className="prm-cin-item text-xs font-bold uppercase tracking-[0.25em] text-[#f7dc9a]">
                            ✦ The Eternal Memory ✦
                        </div>

                        {/* 3D Double-Bezel Frame with Ken Burns Zoom */}
                        <div className="prm-cin-item relative group mx-auto">
                            {/* Ambient Glow Aura */}
                            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-[#f2c14e]/35 via-[#fb7185]/20 to-[#38bdf8]/30 blur-2xl opacity-80" />

                            <div className="relative w-60 h-72 sm:w-72 sm:h-96 max-h-[46vh] sm:max-h-[55vh] rounded-[2rem] p-3 bg-gradient-to-b from-[#f2c14e]/40 via-white/10 to-[#f2c14e]/20 border border-[#f2c14e]/50 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                                <div className="relative w-full h-full rounded-[1.4rem] overflow-hidden border border-white/20 bg-black/40">
                                    <img
                                        src={photoUrl || '/sample-memory.jpg'}
                                        alt={`Special memory of ${to}`}
                                        onError={(e) => {
                                            e.currentTarget.src = '/sample-memory.jpg';
                                        }}
                                        className="prm-cin-portrait-img w-full h-full object-cover will-change-transform"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                                    {/* Bottom Plaque inside Portrait */}
                                    <div className="absolute bottom-3 inset-x-3 text-center bg-black/60 backdrop-blur-md py-2 px-3 rounded-xl border border-white/15">
                                        <p className="prm-serif text-xs font-semibold text-[#f7dc9a] tracking-wide">
                                            ✦ Cherished with {to} ✦
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dedication Plaque below Photo */}
                        <div className="prm-cin-item max-w-md bg-white/[0.04] border border-[#f2c14e]/25 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
                            <p className="prm-serif italic text-sm sm:text-base text-[#f7dc9a] leading-relaxed">
                                {displayQuote}
                            </p>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    SCENE 3: HEARTSTRINGS (KINETIC POETRY & PERSONAL LETTER)
                ═══════════════════════════════════════════════════════════ */}
                {!showPaywallScene && currentScene === 2 && (
                    <div className="flex flex-col items-center justify-center space-y-6 max-w-xl my-auto">
                        <div className="prm-cin-item text-xs font-bold uppercase tracking-[0.25em] text-[#f7dc9a]">
                            ✦ Words From The Heart ✦
                        </div>

                        <div className="prm-cin-item prm-serif text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                            &ldquo;You don’t just exist in my world — <br />
                            <span className="prm-gold-text">you make it a brighter place.</span>&rdquo;
                        </div>

                        {/* Kinetic Letter Scroll Box */}
                        <div className="prm-cin-item w-full max-w-lg bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-lg shadow-2xl text-left">
                            <p className="prm-serif text-sm sm:text-base text-white/90 leading-relaxed italic mb-4">
                                Dearest {to},
                            </p>
                            <p className="prm-serif text-sm sm:text-base text-white/80 leading-relaxed whitespace-pre-line">
                                {letter ||
                                    `Thank you for being the calm in my storms, the laughter on ordinary days, and the person whose smile turns everything around. I hope this year brings you every piece of happiness you so effortlessly give to everyone around you.`}
                            </p>
                            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                                <span className="text-xs tracking-widest uppercase text-white/50">With endless love</span>
                                <span className="prm-serif font-bold text-[#f7dc9a] text-sm sm:text-base">{from} 💜</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    SCENE 4: GRAND WISH FINALE & CANDLE BLOWOUT
                ═══════════════════════════════════════════════════════════ */}
                {!showPaywallScene && currentScene === 3 && (
                    <div className="flex flex-col items-center justify-center space-y-5 max-w-xl w-full my-auto">
                        <div className="prm-cin-item text-xs font-bold uppercase tracking-[0.25em] text-[#f7dc9a]">
                            ✦ The Grand Wish ✦
                        </div>

                        <h2 className="prm-cin-item prm-serif text-2xl sm:text-4xl font-extrabold leading-tight">
                            Close your eyes, <span className="prm-gold-text">{to}</span>. <br />
                            Make your deepest wish.
                        </h2>

                        {/* Candle Blower Component */}
                        <div className="prm-cin-item w-full max-w-md bg-black/40 border border-[#f2c14e]/30 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-[0_20px_60px_rgba(242,193,78,0.25)]">
                            <CandleBlower
                                age={age}
                                recipientName={to}
                                onBlow={handleCandleBlown}
                            />
                        </div>

                        {/* Interactive Shower Love & Share */}
                        <div className="prm-cin-item flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleShowerLove}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white font-extrabold text-sm shadow-[0_10px_30px_rgba(251,113,133,0.4)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                            >
                                <Heart className="w-4 h-4 fill-current animate-bounce" />
                                {loveCount > 0 ? `Love Sent · ${loveCount} ❤️` : 'Shower Love'}
                            </button>

                            <button
                                type="button"
                                onClick={() => goToScene(0)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white/90 font-bold text-sm border border-white/15 backdrop-blur-md transition-all cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4 text-[#f2c14e]" /> Replay Film
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Letterbox Bar & Player Controls */}
            <footer className="relative z-20 w-full pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] px-4 sm:px-8 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    {/* Previous Scene Button */}
                    <button
                        type="button"
                        onClick={prevScene}
                        disabled={currentScene === 0 && !showPaywallScene}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors text-white"
                        aria-label="Previous Scene"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>

                    {/* Play / Pause Toggle */}
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="p-3.5 rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-bold shadow-[0_8px_25px_rgba(242,193,78,0.4)] hover:scale-110 active:scale-95 transition-transform"
                        aria-label={showPaywallScene ? 'Replay Preview' : isPlaying ? 'Pause Cinema' : 'Play Cinema'}
                    >
                        {showPaywallScene ? (
                            <RotateCcw className="w-5 h-5 text-[#241031]" />
                        ) : isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                    </button>

                    {/* Next Scene Button */}
                    <button
                        type="button"
                        onClick={nextScene}
                        disabled={currentScene === 3 || showPaywallScene}
                        className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors text-white"
                        aria-label="Next Scene"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>

                {/* Subtitle prompt */}
                <p className="text-center text-[11px] text-white/40 tracking-wider mt-2 font-medium">
                    ✦ Tap anywhere on the canvas to send starlight hearts ✦
                </p>
            </footer>
        </div>
    );
}
