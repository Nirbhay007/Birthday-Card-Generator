'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import CelestialCanvas from './CelestialCanvas';

// Curated human dedications tailored to relationships — zero robotic or AI corporate phrasing.
const HUMAN_DEDICATIONS = {
    partner: 'To the person who makes ordinary days feel like poetry.',
    husband: 'To my favorite teammate, my best friend, and the love of my life.',
    wife: 'To the woman who holds my whole world together with grace and love.',
    boyfriend: 'To the one who gives me butterflies, makes me laugh, and holds my heart.',
    girlfriend: 'To the one who brings sunshine, laughter, and so much sweetness to my days.',
    mom: 'To the woman whose love gave me roots and whose courage gave me wings.',
    dad: 'For the quiet sacrifices, the steady hands, and the warmth that made home feel safe.',
    sister: 'My first best friend, forever confidante, and the keeper of all our childhood secrets.',
    brother: 'From fighting over the smallest things to having each other’s backs through life.',
    bestfriend: 'For the one who knows all my messy stories and still answers on the first ring.',
    friend: 'For someone whose loyalty, humor, and genuine presence make life so much better.',
    son: 'Watching you grow into the person you are today is the greatest pride of my life.',
    daughter: 'To my little star who brings more light into this world than words could ever say.',
    grandma: 'For the softest hugs, the warmest stories, and a lifetime of unconditional love.',
    grandpa: 'For the wisdom, the gentle smiles, and the lessons I will carry forever.',
};

export function getHumanDedication(rel) {
    if (!rel) return 'For someone whose kindness makes the whole world a little softer.';
    const key = rel.toLowerCase().replace(/\s+/g, '');
    return HUMAN_DEDICATIONS[key] || 'For someone whose presence brings so much genuine warmth into the room.';
}

export default function CinemaTeaserCard({
    recipientName = '',
    senderName = '',
    relationship = '',
    photoSrc = null,
    compact = false,
}) {
    const cardRef = useRef(null);
    const photoFrameRef = useRef(null);
    const name = String(recipientName || '').trim() || 'Someone Special';
    const dedication = useMemo(() => getHumanDedication(relationship), [relationship]);

    const handlePointerMove = (e) => {
        const frame = photoFrameRef.current;
        if (!frame) return;
        const rect = frame.getBoundingClientRect();
        const x = (e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2;
        const y = (e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2;
        const rx = -(y / (rect.height / 2)) * 9;
        const ry = (x / (rect.width / 2)) * 9;
        gsap.to(frame, {
            rotateX: rx,
            rotateY: ry,
            transformPerspective: 900,
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

    const premiumUrl = useMemo(() => {
        const p = new URLSearchParams();
        const safeTo = String(recipientName || '').trim();
        const safeFrom = String(senderName || '').trim();
        const safeRel = String(relationship || '').trim();
        if (safeTo) p.set('to', safeTo);
        if (safeFrom) p.set('from', safeFrom);
        if (safeRel) p.set('for', safeRel.toLowerCase());
        if (photoSrc && (photoSrc.startsWith('http://') || photoSrc.startsWith('https://') || photoSrc.startsWith('/'))) {
            p.set('photo', photoSrc);
        }
        p.set('mode', 'cinema');
        const qs = p.toString();
        return `/premium${qs ? `?${qs}` : ''}`;
    }, [recipientName, senderName, relationship, photoSrc]);

    const handleLinkClick = () => {
        if (photoSrc) {
            try {
                sessionStorage.setItem('prm_cinema_temp_photo', photoSrc);
            } catch {}
        }
    };

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden rounded-3xl border border-[#f2c14e]/30 bg-[#0a0515] text-[#fbf7ee] shadow-2xl transition-all ${
                compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8'
            }`}
            style={{
                background: 'radial-gradient(ellipse at 50% 0%, #20103a 0%, #0c0618 65%, #05020b 100%)',
            }}
        >
            {/* Interactive Canvas Stardust & Particle Field */}
            <CelestialCanvas density={compact ? 24 : 36} speed={0.25} />

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#f2c14e]/40 bg-[#f2c14e]/10 px-3 py-1 text-[11px] font-bold text-[#f7dc9a] mb-4 backdrop-blur-sm shadow-inner">
                    <Sparkles className="w-3 h-3 text-[#f2c14e]" />
                    <span>Private Cinema Keepsake · ₹49</span>
                </div>

                {/* Emotional Heading */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Deliver {name}&apos;s surprise like a <span className="bg-gradient-to-r from-[#f7dc9a] via-[#f2c14e] to-[#fb7185] bg-clip-text text-transparent">cinematic movie</span>
                </h3>

                <p className="text-xs sm:text-sm text-[#c9bddf] max-w-md mt-1.5 leading-relaxed">
                    A wax-sealed mystery envelope, floating starlight memory art, and blowable candle finale they will re-read at 2 AM.
                </p>

                {/* 3D Hologram / Starlit Hero Photo Frame */}
                <div
                    className="relative my-5 w-full max-w-[280px] sm:max-w-[300px] mx-auto cursor-pointer"
                    style={{ perspective: '900px' }}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                >
                    {/* Ambient Colored Backlight (samples photo / gold glow) */}
                    <div
                        className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#f2c14e]/35 via-[#c084fc]/25 to-[#fb7185]/35 blur-xl opacity-75 -z-10 animate-pulse"
                        style={{ animationDuration: '4s' }}
                    />

                    <div
                        ref={photoFrameRef}
                        className="relative overflow-hidden rounded-2xl border-2 border-[#f2c14e]/60 bg-[#160b29]/90 p-2 shadow-2xl backdrop-blur-md transition-transform"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Specular Light Sweep */}
                        <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"
                            aria-hidden="true"
                        />

                        <div className="relative aspect-[4/4.2] rounded-xl overflow-hidden bg-black/40">
                            <img
                                src={photoSrc || '/sample-memory.jpg'}
                                alt={`Hero preview for ${name}`}
                                className="w-full h-full object-cover"
                            />
                            {!photoSrc && (
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    Sample · Your photo appears here
                                </div>
                            )}

                            {/* Wax Seal Ribbon Badge at bottom right */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-gradient-to-r from-[#8b1e2a] to-[#68111d] text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-lg">
                                <span aria-hidden="true">💌</span>
                                <span>Wax Sealed</span>
                            </div>
                        </div>

                        {/* Handwritten Emotional Dedication */}
                        <div className="pt-3 pb-1 px-1 text-center">
                            <p className="text-[11px] sm:text-xs italic text-[#f7dc9a] font-serif leading-snug">
                                &ldquo;{dedication}&rdquo;
                            </p>
                            <p className="text-[10px] text-[#9f94b8] mt-1 font-semibold uppercase tracking-wider">
                                For {name} {relationship ? `(${relationship})` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4 Cinematic Acts Pills */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-md text-left my-2">
                    {[
                        { act: 'Act I', desc: 'Wax-sealed envelope you open with a tap' },
                        { act: 'Act II', desc: 'Floating starlit memory portrait' },
                        { act: 'Act III', desc: 'Three reasons why you cherish them' },
                        { act: 'Act IV', desc: 'Interactive microphone candle blowout' },
                    ].map((item) => (
                        <div
                            key={item.act}
                            className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-sm"
                        >
                            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#f2c14e]">
                                {item.act}
                            </span>
                            <span className="block text-[11px] text-[#d6cce7] leading-snug mt-0.5">
                                {item.desc}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Unforced Action Button & Reassurance */}
                <div className="mt-5 w-full max-w-md space-y-2">
                    <Link
                        href={premiumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLinkClick}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c14e] via-[#f7dc9a] to-[#fb7185] px-6 py-3 text-sm font-extrabold text-[#241031] shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                        <span>Preview {name}&apos;s Cinema (Free to Try)</span>
                        <ArrowRight className="w-4 h-4 text-[#241031]" />
                    </Link>

                    <p className="text-[11px] text-[#9f94b8] leading-tight">
                        ✨ Your free birthday card is 100% free to send forever. This is an optional keepsake if you want to make them tear up.
                    </p>
                </div>
            </div>
        </div>
    );
}
