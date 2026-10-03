'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Cinematic atmosphere (all VIP cards): drifting aurora ribbons + twinkling stars.
 * Canvas-based for GPU-friendly compositing. Pauses when the tab is hidden,
 * respects prefers-reduced-motion, caps DPR for perf.
 */
export default function ProAtmosphere({ variant = 'holo' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let raf = 0;
        let w = 0;
        let h = 0;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        const palette = variant === 'aurora'
            ? ['rgba(52,211,153,', 'rgba(14,165,233,', 'rgba(110,231,183,']
            : ['rgba(125,211,252,', 'rgba(167,139,250,', 'rgba(244,114,182,'];

        const stars = Array.from({ length: 60 }).map(() => ({
            x: Math.random(),
            y: Math.random(),
            r: 0.4 + Math.random() * 1.4,
            p: Math.random() * Math.PI * 2,
            s: 0.5 + Math.random() * 1.5,
        }));

        const resize = () => {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const render = (t) => {
            raf = requestAnimationFrame(render);
            const time = t * 0.001;
            ctx.clearRect(0, 0, w, h);

            // aurora ribbons
            for (let i = 0; i < 3; i++) {
                const baseY = h * (0.2 + i * 0.22);
                ctx.beginPath();
                ctx.moveTo(-20, baseY);
                for (let x = 0; x <= w + 20; x += 24) {
                    const y = baseY + Math.sin(x * 0.004 + time * (0.4 + i * 0.2) + i * 2) * (28 + i * 14);
                    ctx.lineTo(x, y);
                }
                ctx.strokeStyle = `${palette[i]}${0.10 + 0.05 * Math.sin(time + i)})`;
                ctx.lineWidth = 46 - i * 10;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // stars
            for (const s of stars) {
                const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.s + s.p));
                ctx.beginPath();
                ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${(0.25 * tw + 0.08).toFixed(3)})`;
                ctx.fill();
            }
        };

        if (!reduced) {
            raf = requestAnimationFrame(render);
        } else {
            // static frame only
            ctx.clearRect(0, 0, w, h);
        }

        const onVis = () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else if (!reduced) raf = requestAnimationFrame(render);
        };
        document.addEventListener('visibilitychange', onVis);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [variant]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full"
        />
    );
}
