'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Gift, Mic, Heart } from 'lucide-react';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const SCENES = [
    {
        id: 'gift',
        step: '01',
        icon: Gift,
        title: 'Send the surprise',
        body: 'Share one link on WhatsApp. They tap it and a gift box opens with their name on it.',
        visual: (
            <div data-theme="royal" className="theme-card w-full max-w-xs rounded-3xl p-6 text-center" style={{ color: 'var(--text-primary)' }}>
                <span className="text-[11px] font-semibold uppercase tracking-widest opacity-60">You have a gift</span>
                <div className="theme-gift-box mx-auto mt-5 grid h-28 w-28 place-items-center rounded-3xl">
                    <Gift className="h-11 w-11 text-white" strokeWidth={1.75} />
                </div>
                <p className="mt-5 text-2xl leading-none" style={{ fontFamily: 'var(--font-heading)' }}>Ananya</p>
                <div className="mx-auto mt-4 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold">
                    Tap to open
                </div>
            </div>
        ),
    },
    {
        id: 'candles',
        step: '02',
        icon: Mic,
        title: 'They make a wish',
        body: 'Real mic magic: they blow into the phone and the candles go out, confetti included.',
        visual: (
            <div className="w-full max-w-xs rounded-3xl border border-ink/[0.06] bg-white p-7 shadow-soft">
                <div className="flex items-end justify-center gap-7">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span
                                className="flame-flicker mb-1 block h-6 w-3 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200"
                                style={{ animationDelay: `${i * 0.3}s` }}
                            />
                            <span className="h-16 w-5 rounded-t-md bg-gradient-to-b from-brand-300 to-brand-500" />
                        </div>
                    ))}
                </div>
                <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700">
                    <Mic className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Blow into your mic — the flames listen
                </div>
            </div>
        ),
    },
    {
        id: 'memories',
        step: '03',
        icon: Heart,
        title: 'They relive your memories',
        body: 'Your message, favourite photos and a song they know — looping on their screen, not in a chat thread.',
        visual: (
            <div className="w-full max-w-xs rounded-3xl border border-ink/[0.06] bg-white p-5 shadow-soft">
                <div className="relative">
                    <Image
                        src="/sample-memory.jpg"
                        alt="A favourite photo inside the birthday memory gallery"
                        width={400}
                        height={240}
                        className="h-44 w-full rounded-2xl object-cover"
                    />
                    <span className="absolute -bottom-3 right-4 flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md">
                        <Heart className="h-3 w-3 fill-white" strokeWidth={0} />
                        12 hearts
                    </span>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-muted">
                    “Happy birthday, Ananya. Here is to more midnight cake and terrible dancing.”
                </p>
                <div className="mt-4 flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                        <Heart key={i} className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                    ))}
                </div>
            </div>
        ),
    },
];

/**
 * Three-scene product story. On desktop each scene is a full-bleed sticky
 * "sheet" that sweeps up and covers the previous one (GSAP scrub), whose
 * content scales down and dims as it recedes. Sheets stay opaque, so scenes
 * never ghost through each other. On mobile and with reduced motion it
 * degrades to plain stacked cards — no pinning, no hijacking.
 */
export default function JourneyPin() {
    const root = useRef(null);

    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
            const slides = gsap.utils.toArray('.journey-slide', root.current);
            slides.forEach((slide, i) => {
                if (i === slides.length - 1) return;
                // Recede the scene content, never the sheet itself: the sheet
                // stays opaque so earlier scenes can't ghost through it.
                const scene = slide.querySelector('.journey-scene');
                gsap.fromTo(
                    scene,
                    { scale: 1, opacity: 1 },
                    {
                        scale: 0.94,
                        opacity: 0.5,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: slides[i + 1],
                            start: 'top bottom',
                            // Nav is h-16 (64px) and slides stick flush below it.
                            end: 'top top+=64',
                            scrub: 0.4,
                            invalidateOnRefresh: true,
                        },
                    }
                );
            });
        });
        return () => mm.revert();
    }, { scope: root });

    return (
        <section id="how-it-works" ref={root} className="scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 ">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600">How it works</span>
                <h2 className="mt-3 mb-10 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Thirty seconds of setup. A moment they replay for years.
                </h2>
            </div>

            <div className="">
                {SCENES.map((scene, i) => {
                    const Icon = scene.icon;
                    return (
                        <div
                            key={scene.id}
                            className="journey-slide md:sticky md:top-16 md:flex md:min-h-[calc(100svh-4rem)] md:items-center md:rounded-t-[2rem] md:bg-paper md:shadow-[0_-28px_56px_-40px_rgba(21,17,31,0.28)]"
                            style={{ zIndex: i + 1 }}
                        >
                            <div className="journey-scene mx-auto w-full max-w-6xl px-4 sm:px-6">
                                <div className="grid items-center gap-8 py-8 md:grid-cols-2 md:gap-16 md:py-12">
                                    <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                                                <Icon className="h-5 w-5" strokeWidth={1.75} />
                                            </span>
                                            <span className="font-display text-sm font-bold text-ink/40">{scene.step}</span>
                                        </div>
                                        <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                                            {scene.title}
                                        </h3>
                                        <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{scene.body}</p>
                                    </div>
                                    <div className={`flex justify-center ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                                        {scene.visual}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
