'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas night sky: twinkling stars + occasional shooting star.
 * Capped DPR + star count on mobile, static single frame when the user
 * prefers reduced motion, pauses when the tab is hidden.
 */
export default function Starfield({ density = 1, className = '' }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const isMobile = Math.min(window.innerWidth, window.innerHeight) < 640;
        const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
        let raf = 0;
        let w = 0;
        let h = 0;
        let stars = [];
        let meteors = [];
        let nextMeteor = performance.now() + 2500;

        const seed = () => {
            const count = Math.round((isMobile ? 70 : 150) * density);
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.4 + 0.3,
                p: Math.random() * Math.PI * 2,
                s: 0.4 + Math.random() * 1.2,
                gold: Math.random() < 0.22,
            }));
        };

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        };

        const draw = (t) => {
            ctx.clearRect(0, 0, w, h);
            for (const st of stars) {
                const tw = reduced ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t / 1000 * st.s + st.p));
                ctx.globalAlpha = tw;
                ctx.fillStyle = st.gold ? '#f7dc9a' : '#ffffff';
                ctx.beginPath();
                ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (!reduced) {
                if (t > nextMeteor && meteors.length < 2) {
                    meteors.push({ x: Math.random() * w * 0.7 + w * 0.15, y: -20, vx: -4 - Math.random() * 3, vy: 3 + Math.random() * 2, life: 1 });
                    nextMeteor = t + 3500 + Math.random() * 5000;
                }
                meteors = meteors.filter((m) => m.life > 0 && m.y < h + 60);
                for (const m of meteors) {
                    m.x += m.vx;
                    m.y += m.vy;
                    m.life -= 0.02;
                    const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
                    grad.addColorStop(0, `rgba(255,247,221,${0.9 * m.life})`);
                    grad.addColorStop(1, 'rgba(255,247,221,0)');
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(m.x, m.y);
                    ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
                    ctx.stroke();
                }
                raf = requestAnimationFrame(draw);
            }
        };

        const onVis = () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else if (!reduced) raf = requestAnimationFrame(draw);
        };

        resize();
        draw(performance.now());
        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', onVis);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [density]);

    return <canvas ref={ref} className={className} aria-hidden="true" />;
}
