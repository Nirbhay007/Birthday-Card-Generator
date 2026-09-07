'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Cinematic cursor aura: a soft gold glow trailing the pointer (desktop,
 * fine pointers only). Rendered nowhere else — zero mobile cost.
 */
export default function CursorGlow() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return () => {};
        if (!window.matchMedia?.('(pointer: fine)').matches) return () => {};
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {};
        gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 1 });
        const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });
        const move = (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };
        window.addEventListener('mousemove', move, { passive: true });
        return () => window.removeEventListener('mousemove', move);
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[5] h-72 w-72 rounded-full opacity-0"
            style={{ background: 'radial-gradient(circle, rgba(242,193,78,0.14) 0%, rgba(251,113,133,0.06) 45%, transparent 70%)' }}
        />
    );
}
