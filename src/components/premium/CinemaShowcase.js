'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Sparkles, ArrowRight, Heart, Volume2, ShieldCheck } from 'lucide-react';
import CelestialCanvas from './CelestialCanvas';

const RELATIONSHIP_PRESETS = [
    { id: 'Partner', label: '❤️ Partner', name: 'Aanya', quote: 'To the person who makes ordinary days feel like poetry.' },
    { id: 'Mom', label: '🌸 Mom', name: 'Mom', quote: 'To the woman whose love gave me roots and whose courage gave me wings.' },
    { id: 'Best Friend', label: '⚡ Best Friend', name: 'Rohan', quote: 'For the one who knows all my messy stories and still answers on the first ring.' },
    { id: 'Sister', label: '✨ Sister', name: 'Pooja', quote: 'My first best friend, forever confidante, and keeper of all childhood secrets.' },
    { id: 'Husband', label: '💍 Husband', name: 'Vikram', quote: 'To my favorite teammate, my best friend, and the love of my life.' },
    { id: 'Dad', label: '🌟 Dad', name: 'Papa', quote: 'For the quiet sacrifices, the steady hands, and warmth that made home feel safe.' },
];

export default function CinemaShowcase() {
    const [selectedRel, setSelectedRel] = useState(RELATIONSHIP_PRESETS[0]);
    const photoFrameRef = useRef(null);

    const handlePointerMove = (e) => {
        const frame = photoFrameRef.current;
        if (!frame) return;
        const rect = frame.getBoundingClientRect();
        const x = (e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
        const y = (e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
        const rx = -(y / (rect.height / 2)) * 10;
        const ry = (x / (rect.width / 2)) * 10;
        gsap.to(frame, {
            rotateX: rx,
            rotateY: ry,
            transformPerspective: 950,
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    const handlePointerLeave = () => {
        const frame = photoFrameRef.current;
        if (!frame) return;
        gsap.to(frame, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.45)',
        });
    };

    return (
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#f2c14e]/40 bg-[#090414] text-[#fbf7ee] shadow-2xl p-6 sm:p-10 lg:p-12 my-12">
            {/* Background Stardust & Constellations */}
            <CelestialCanvas density={40} speed={0.2} />

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* Top Badge */}
                <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#f2c14e]/40 bg-[#f2c14e]/10 px-4 py-1.5 text-xs font-extrabold text-[#f7dc9a] backdrop-blur-md shadow-inner mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-[#f2c14e]" />
                        <span>The Private Cinema Keepsake · ₹49 ($1 worldwide)</span>
                    </div>
                </div>

                {/* Main Heading */}
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Don’t just wish them.<br />
                        <span className="bg-gradient-to-r from-[#f7dc9a] via-[#f2c14e] to-[#fb7185] bg-clip-text text-transparent">
                            Give them happy tears.
                        </span>
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-[#c4b6db] leading-relaxed">
                        A wax-sealed envelope, floating starlit memory portrait, three honest reasons you cherish them, and an interactive candle finale they will re-read at 2 AM.
                    </p>
                </div>

                {/* Relationship Selector Tabs */}
                <div className="mb-8">
                    <p className="text-center text-[11px] font-extrabold uppercase tracking-widest text-[#9f94b8] mb-3">
                        Choose who you want to surprise:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {RELATIONSHIP_PRESETS.map((preset) => {
                            const active = selectedRel.id === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setSelectedRel(preset)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                        active
                                            ? 'bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] shadow-md scale-105'
                                            : 'bg-white/5 border border-white/10 text-[#d2c7e2] hover:bg-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Two-column layout: 3D Photo on Left, The 4 Acts on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left: 3D Floating Portrait */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div
                            className="relative w-full max-w-[320px] mx-auto cursor-pointer"
                            style={{ perspective: '950px' }}
                            onPointerMove={handlePointerMove}
                            onPointerLeave={handlePointerLeave}
                        >
                            {/* Ambient Glow */}
                            <div
                                className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#f2c14e]/40 via-[#c084fc]/30 to-[#fb7185]/40 blur-2xl opacity-80 -z-10 animate-pulse"
                                style={{ animationDuration: '4s' }}
                            />

                            <div
                                ref={photoFrameRef}
                                className="relative overflow-hidden rounded-3xl border-2 border-[#f2c14e]/60 bg-[#160b29]/95 p-3 shadow-2xl backdrop-blur-md transition-transform"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/50">
                                    <img
                                        src="/sample-memory.jpg"
                                        alt={`Cinema Memory for ${selectedRel.name}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Wax Seal Stamp badge */}
                                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-gradient-to-r from-[#8b1e2a] to-[#68111d] text-amber-200 border border-amber-300/50 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-xl">
                                        <span aria-hidden="true">💌</span>
                                        <span>Wax Sealed</span>
                                    </div>
                                </div>

                                <div className="pt-3 pb-1 text-center">
                                    <p className="text-xs sm:text-sm italic text-[#f7dc9a] font-serif leading-snug">
                                        &ldquo;{selectedRel.quote}&rdquo;
                                    </p>
                                    <p className="text-[10px] text-[#9f94b8] mt-1.5 font-semibold uppercase tracking-wider">
                                        For {selectedRel.name} ({selectedRel.id})
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-[11px] text-[#9f94b8] mt-3">
                            👆 Hover or touch to feel the 3D starlight memory depth
                        </p>
                    </div>

                    {/* Right: The 4 Acts */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#f2c14e] flex items-center gap-1.5">
                                    <span>💌</span> Act I: The Mystery Envelope
                                </span>
                                <p className="text-xs text-[#dcd2ec] mt-1.5 leading-relaxed">
                                    A custom wax seal bearing their initial that cracks open with an authentic seal-breaking sound.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#f2c14e] flex items-center gap-1.5">
                                    <span>🌌</span> Act II: Starlight Memory Art
                                </span>
                                <p className="text-xs text-[#dcd2ec] mt-1.5 leading-relaxed">
                                    Their favorite photo floats inside interactive starlight, illuminated with a tailored dedication.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#f2c14e] flex items-center gap-1.5">
                                    <span>💜</span> Act III: Three Honest Reasons
                                </span>
                                <p className="text-xs text-[#dcd2ec] mt-1.5 leading-relaxed">
                                    Deep, human, un-robotic words about why they matter so deeply to your life.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#f2c14e] flex items-center gap-1.5">
                                    <span>🎂</span> Act IV: The Candle Blowout
                                </span>
                                <p className="text-xs text-[#dcd2ec] mt-1.5 leading-relaxed">
                                    They blow into their phone mic to extinguish the flame, launching celebratory gold fireworks.
                                </p>
                            </div>
                        </div>

                        {/* CTA + Reassurance */}
                        <div className="pt-2 space-y-3">
                            <Link
                                href={`/premium?for=${encodeURIComponent(selectedRel.id.toLowerCase())}&to=${encodeURIComponent(selectedRel.name)}`}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f2c14e] via-[#f7dc9a] to-[#fb7185] px-7 py-4 text-sm sm:text-base font-extrabold text-[#241031] shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                            >
                                <span>Preview {selectedRel.name}&apos;s Cinema (Free to Try)</span>
                                <ArrowRight className="w-5 h-5 text-[#241031]" />
                            </Link>

                            <div className="flex items-center justify-between text-[11px] text-[#9f94b8] px-1">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#f2c14e]" /> Free card creator stays 100% free
                                </span>
                                <span>No account needed · Instant delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
