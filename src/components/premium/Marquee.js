'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Awwwards-style kinetic ribbon: infinite marquee that speeds up with scroll
 * velocity. Pure decoration — static readable row with JS off.
 */
function Strip({ row, hidden }) {
    return (
        <div className="flex shrink-0 items-center" aria-hidden={hidden}>
            {row.map((w, i) => (
                <span key={i} className="flex shrink-0 items-center">
                    <span className="prm-serif font-extrabold uppercase tracking-tight text-[clamp(2rem,7vw,4.5rem)] leading-none px-6 whitespace-nowrap">
                        {w}
                    </span>
                    <span className="prm-gold-text text-[clamp(1.4rem,4vw,2.6rem)]" aria-hidden="true">✦</span>
                </span>
            ))}
        </div>
    );
}

export default function Marquee({ items = [], className = '' }) {
    const rootRef = useRef(null);
    const trackRef = useRef(null);
    const tweenRef = useRef(null);

    const row = items.length ? items : ['Happy Birthday'];

    useGSAP(
        () => {
            const track = trackRef.current;
            if (!track) return;
            if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
            tweenRef.current = gsap.to(track, { xPercent: -50, repeat: -1, duration: 22, ease: 'none' });
            const st = ScrollTrigger.create({
                trigger: rootRef.current,
                start: 'top bottom',
                end: 'bottom top',
                onUpdate: (self) => {
                    const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 1600, 3);
                    tweenRef.current?.timeScale(boost);
                    clearTimeout(tweenRef.current?._slowT);
                    if (tweenRef.current) {
                        tweenRef.current._slowT = setTimeout(() => tweenRef.current?.timeScale(1), 120);
                    }
                },
            });
            return () => {
                clearTimeout(tweenRef.current?._slowT);
                st.kill();
                tweenRef.current?.kill();
                tweenRef.current = null;
            };
        },
        { scope: rootRef }
    );

    return (
        <div ref={rootRef} className={`relative overflow-hidden py-6 sm:py-8 select-none ${className}`} aria-label={row.join(', ')}>
            <div ref={trackRef} className="flex w-max text-[#f6f1e7]/90">
                <Strip row={row} hidden={false} />
                <Strip row={row} hidden={true} />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070412] to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070412] to-transparent" aria-hidden="true" />
        </div>
    );
}
