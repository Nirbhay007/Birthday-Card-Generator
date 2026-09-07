'use client';

import { useEffect, useRef } from 'react';

/**
 * Scroll-reveal wrapper (the universal fallback that works in every browser:
 * IntersectionObserver adds .is-visible once, CSS does the rest).
 * Decorative only — content is fully readable with JS off (SSR renders it,
 * .prm-reveal starts hidden only when JS runs... see note).
 *
 * Note: to avoid hiding content when the observer can't run, we add the
 * hidden starting state from JS (no-JS users see everything).
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.classList.add('prm-reveal');
        if (delay) el.style.setProperty('--prm-d', `${delay}ms`);
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            el.classList.add('is-visible');
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-visible');
                        io.unobserve(e.target);
                    }
                }
            },
            { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [delay]);

    return (
        <Tag ref={ref} className={className} {...rest}>
            {children}
        </Tag>
    );
}
