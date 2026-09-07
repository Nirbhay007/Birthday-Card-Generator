'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Magnetic hover: wrapped buttons lean toward the cursor on fine pointers.
 * No-op on touch / reduced motion (plain button underneath).
 */
export default function Magnetic({ children, strength = 26, className = '', style }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!window.matchMedia?.('(pointer: fine)').matches) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
        const move = (e) => {
            const r = el.getBoundingClientRect();
            xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * strength);
            yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * strength);
        };
        const leave = () => {
            xTo(0);
            yTo(0);
        };
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        return () => {
            el.removeEventListener('mousemove', move);
            el.removeEventListener('mouseleave', leave);
        };
    }, [strength]);

    return (
        <span ref={ref} className={`inline-block ${className}`} style={style}>
            {children}
        </span>
    );
}
