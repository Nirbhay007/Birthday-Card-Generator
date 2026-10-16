'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Images, Lock, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * MemoryAlbum — the photo chapter.
 *
 * Why it exists: every other chapter of the universe is written by the giver.
 * The album is the one place where the *recipient's own life* looks back at
 * them. Locked, it is a deck of sealed polaroids (blurred, taped, untouchable).
 * Unlocked, it is a real album: cream instant-film cards that lift off the page,
 * scroll-snap on phones, and open into a full-screen lightbox on tap.
 *
 * Media honesty: remote photos may be CORS-restricted elsewhere, but plain
 * <img> rendering is always fine; if a single photo 404s we swap in a gradient
 * placeholder rather than breaking the deck.
 */

const THEME_ACCENTS = {
    gold: '#f2c14e',
    aurora: '#34d399',
    rose: '#fda4af',
    cyan: '#5eead4',
    sunset: '#fbbf24',
};

function Polaroid({ src, alt, caption, accent, index, locked, onOpen, interactive }) {
    const [broken, setBroken] = useState(!src);
    const tilt = ((index % 3) - 1) * 2.2; // -2.2 / 0 / +2.2 deg

    const content = (
        <>
            {/* Tape strip */}
            <span className="pointer-events-none absolute -top-2.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3 rounded-[3px] border border-white/25 bg-white/20 backdrop-blur-sm" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[0.6rem] bg-[#0d0618]" style={{ aspectRatio: '4 / 5' }}>
                {!broken && src ? (
                    <img
                        src={src}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        onError={() => setBroken(true)}
                        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] ${locked ? 'blur-[3px] scale-105' : ''}`}
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a1748] via-[#160b29] to-[#070412]"
                        aria-hidden="true"
                    >
                        <Sparkles className="h-8 w-8 opacity-40" style={{ color: accent }} />
                    </div>
                )}
                {/* Soft inner shade keeps the cream frame from washing the image out */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" aria-hidden="true" />
                {locked && (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/55 backdrop-blur-sm">
                            <Lock className="h-3.5 w-3.5 text-[#f7dc9a]" aria-hidden="true" />
                        </span>
                    </div>
                )}
            </div>
            <figcaption className="mt-2.5 pb-1 text-center font-serif text-[11px] italic leading-snug text-[#3c2f1a]">
                {caption || '\u00A0'}
            </figcaption>
        </>
    );

    const frameClass = `prm-album-card group relative shrink-0 rounded-[0.9rem] bg-[#f4eddc] p-2.5 pb-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.55)] ring-1 ring-black/20 transition-transform duration-500 will-change-transform ${
        locked ? 'cursor-not-allowed' : interactive ? 'cursor-zoom-in hover:-translate-y-2 hover:rotate-0 hover:scale-[1.03]' : ''
    }`;

    if (locked) {
        return (
            <figure className={frameClass} style={{ transform: `rotate(${tilt}deg)` }} aria-hidden="true">
                {content}
            </figure>
        );
    }
    return (
        <figure className={frameClass} style={{ transform: `rotate(${tilt}deg)` }}>
            <button
                type="button"
                onClick={onOpen}
                className="block w-full text-left"
                aria-label={`Open photo: ${caption || alt}`}
                style={{ touchAction: 'manipulation' }}
            >
                {content}
            </button>
        </figure>
    );
}

export default function MemoryAlbum({
    photos = [],
    captions = [],
    to = 'You',
    unlocked = false,
    onUnlock = null,
    theme = 'gold',
}) {
    const accent = THEME_ACCENTS[theme] || THEME_ACCENTS.gold;
    const [lightbox, setLightbox] = useState(-1);
    const trackRef = useRef(null);
    const sectionRef = useRef(null);
    const safePhotos = (photos || []).filter((p) => typeof p === 'string' && p).slice(0, 12);

    const close = useCallback(() => setLightbox(-1), []);
    const step = useCallback(
        (dir) => {
            setLightbox((i) => (i < 0 ? i : (i + dir + safePhotos.length) % safePhotos.length));
        },
        [safePhotos.length]
    );

    // Lightbox: Esc/arrow keys + scroll lock while open.
    useEffect(() => {
        if (lightbox < 0) return;
        const onKey = (e) => {
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') step(1);
            else if (e.key === 'ArrowLeft') step(-1);
        };
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [lightbox, close, step]);

    // Scatter-in reveal, once, when the deck scrolls into view.
    useGSAP(
        () => {
            const section = sectionRef.current;
            const track = trackRef.current;
            if (!section || !track) return;
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
            const cards = track.querySelectorAll('.prm-album-card');
            if (!cards.length) return;
            const ctx = gsap.context(() => {
                gsap.from(cards, {
                    opacity: 0,
                    y: 60,
                    scale: 0.9,
                    rotate: (i) => (i % 2 ? 9 : -9),
                    duration: 0.9,
                    stagger: 0.12,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: section, start: 'top 78%', once: true },
                });
            }, section);
            return () => ctx.revert();
        },
        { dependencies: [unlocked, safePhotos.length] }
    );

    // ── LOCKED: the sealed deck ─────────────────────────────────────────
    if (!unlocked) {
        const teaser = safePhotos.length ? safePhotos.slice(0, 3) : [null, null, null];
        return (
            <section ref={sectionRef} className="prm-act relative px-5 sm:px-8 py-16 sm:py-24 overflow-hidden" aria-label="Sealed memory album">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="prm-eyebrow mb-5">✦ The Memory Album ✦</p>
                    <h3 className="prm-serif prm-h-act mb-3">
                        {safePhotos.length ? `${safePhotos.length} moments,` : 'Their moments,'} <span className="prm-gold-text">sealed inside</span>
                    </h3>
                    <p className="prm-lead text-sm sm:text-base max-w-xl mx-auto mb-10">
                        Every photo you add becomes an instant-film card in the album. Blindfolded here,
                        alive after unlock. {to} flips through them one by one.
                    </p>

                    <div ref={trackRef} className="relative flex items-center justify-center gap-3 sm:gap-6 mb-10" aria-hidden="true">
                        {teaser.map((src, i) => (
                            <div key={i} className={i === 1 ? 'w-36 sm:w-44' : i === 0 ? 'hidden sm:block w-28 sm:w-36' : 'hidden sm:block w-28 sm:w-36'}>
                                <div style={{ transform: `rotate(${((i % 3) - 1) * 4}deg)` }}>
                                    <Polaroid src={src} alt="" caption={i === 1 ? '✦ ✦ ✦' : ''} accent={accent} index={i} locked interactive={false} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative -mt-24 sm:-mt-28 max-w-md mx-auto">
                        <div className="prm-locker-card rounded-3xl p-5 sm:p-7 text-center backdrop-blur-xl">
                            <span className="mx-auto -mt-12 mb-4 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#f2c14e] to-[#b45309] shadow-[0_14px_40px_rgba(242,193,78,0.45)]">
                                <Images className="h-5 w-5 text-[#241031]" aria-hidden="true" />
                            </span>
                            <p className="prm-serif text-lg sm:text-xl font-bold mb-2">The album opens with the gift.</p>
                            <p className="text-xs sm:text-sm text-[#c4b6db] leading-relaxed mb-5">
                                Blurred photos stay blurred until you unlock. Then each card opens full-screen,
                                with your captions under them.
                            </p>
                            {onUnlock && (
                                <button
                                    type="button"
                                    onClick={onUnlock}
                                    className="prm-shimmer-btn w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-sm shadow-[0_16px_45px_rgba(242,193,78,0.4)] transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                                >
                                    <Lock className="h-4 w-4" aria-hidden="true" /> Add photos &amp; unlock the album
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ── UNLOCKED with nothing inside: stay silent ───────────────────────
    if (!safePhotos.length) return null;

    return (
        <section ref={sectionRef} id="prm-album" className="prm-act relative px-5 sm:px-8 py-20 sm:py-28 overflow-hidden" aria-label="Memory album">
            <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
                <p className="prm-eyebrow mb-5" style={{ color: accent }}>✦ The Memory Album ✦</p>
                <h3 className="prm-serif prm-h-act mb-3">
                    Moments with <span className="prm-gold-text">{to}</span>, developed in love
                </h3>
                <p className="prm-lead text-sm sm:text-base max-w-xl mx-auto">
                    Tap any card to hold it close. {safePhotos.length === 1 ? 'One memory' : `${safePhotos.length} memories`}, kept like this forever.
                </p>
            </div>

            {/* Phone: snap-scroll rail · Desktop: centred deck */}
            <div
                ref={trackRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 px-1 sm:px-4 lg:snap-none lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0"
                style={{ scrollPaddingLeft: '10vw' }}
            >
                {safePhotos.map((src, i) => (
                    <div key={`${src}-${i}`} className="w-[70vw] max-w-[260px] snap-center shrink-0 lg:w-[240px]">
                        <Polaroid
                            src={src}
                            alt={`Memory ${i + 1} of ${to}`}
                            caption={captions[i] || ''}
                            accent={accent}
                            index={i}
                            locked={false}
                            interactive
                            onOpen={() => setLightbox(i)}
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox — portaled to <body> so no section stacking context or
                overflow clip can trap it under the floating chrome. */}
            {lightbox >= 0 && safePhotos[lightbox] && createPortal(
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Photo viewer"
                    onClick={close}
                >
                    <button
                        type="button"
                        onClick={close}
                        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/25 transition-colors cursor-pointer"
                        aria-label="Close photo viewer"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <figure className="relative max-h-full max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="mx-auto overflow-hidden rounded-2xl border border-white/15 bg-[#0d0618] shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
                            <img
                                src={safePhotos[lightbox]}
                                alt={`Memory ${lightbox + 1} of ${to}`}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                                className="mx-auto max-h-[74vh] w-auto object-contain"
                            />
                        </div>
                        <figcaption className="mt-3 text-center font-serif italic text-sm text-[#f7dc9a]">
                            {captions[lightbox] || `✦ A moment with ${to} ✦`}
                        </figcaption>

                        {safePhotos.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => step(-1)}
                                    className="absolute left-2 sm:-left-16 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-white hover:bg-white/20 transition-colors cursor-pointer"
                                    aria-label="Previous photo"
                                >
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => step(1)}
                                    className="absolute right-2 sm:-right-16 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-white hover:bg-white/20 transition-colors cursor-pointer"
                                    aria-label="Next photo"
                                >
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </>
                        )}
                        <p className="mt-2 text-center text-[11px] tracking-[0.25em] uppercase text-white/40 font-bold">
                            {lightbox + 1} / {safePhotos.length}
                        </p>
                    </figure>
                </div>,
                document.body
            )}
        </section>
    );
}
