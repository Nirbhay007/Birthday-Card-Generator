'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, Heart } from 'lucide-react';
import { getHumanDedication } from './CinemaTeaserCard';

export default function StarlightMemoryPortrait({
    to = 'Someone Special',
    rel = '',
    photoUrl = null,
    locked = false,
    customDedication = null,
    className = '',
}) {
    const frameRef = useRef(null);
    const dedication = customDedication || getHumanDedication(rel);

    const handlePointerMove = (e) => {
        const frame = frameRef.current;
        if (!frame) return;
        const rect = frame.getBoundingClientRect();
        const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width / 2;
        const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height / 2;
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;
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
        const frame = frameRef.current;
        if (!frame) return;
        gsap.to(frame, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.45)',
        });
    };

    return (
        <div
            className={`relative w-full max-w-[320px] sm:max-w-[340px] mx-auto cursor-pointer select-none touch-pan-y ${className}`}
            style={{ perspective: '950px' }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerLeave}
        >
            {/* Ambient Multi-hued Starlight Glow */}
            <div
                className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-[#f2c14e]/35 via-[#c084fc]/30 to-[#fb7185]/35 blur-2xl opacity-85 -z-10 animate-pulse"
                style={{ animationDuration: '4s' }}
            />

            <div
                ref={frameRef}
                className="relative overflow-hidden rounded-3xl border-2 border-[#f2c14e]/60 bg-[#160b29]/95 p-3 shadow-2xl backdrop-blur-md transition-transform"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Specular Light Sweep */}
                <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"
                    aria-hidden="true"
                />

                {/* Photo viewport */}
                <div className="relative aspect-[4/4.3] rounded-2xl overflow-hidden bg-black/60">
                    <img
                        src={photoUrl || '/sample-memory.jpg'}
                        alt={`Memory portrait for ${to}`}
                        onError={(e) => {
                            e.currentTarget.src = '/sample-memory.jpg';
                        }}
                        className={`w-full h-full object-cover ${locked ? 'filter brightness-90' : ''}`}
                    />

                    {!photoUrl && (
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/20 text-[#f7dc9a] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-[#f2c14e]" />
                            <span>Starlight Portrait</span>
                        </div>
                    )}

                    {/* Wax Seal Stamp badge */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-gradient-to-r from-[#8b1e2a] to-[#68111d] text-amber-200 border border-amber-300/50 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-xl">
                        <span aria-hidden="true">💌</span>
                        <span>Wax Sealed</span>
                    </div>
                </div>

                {/* Dedication Text */}
                <div className="pt-3.5 pb-1 px-1 text-center">
                    <p className="text-xs sm:text-sm italic text-[#f7dc9a] font-serif leading-snug">
                        &ldquo;{dedication}&rdquo;
                    </p>
                    <p className="text-[10px] text-[#9f94b8] mt-1.5 font-semibold uppercase tracking-wider">
                        For {to} {rel ? `(${rel})` : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
