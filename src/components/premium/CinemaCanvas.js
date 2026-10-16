'use client';

import React, { useEffect, useRef } from 'react';

/**
 * CinemaCanvas — the living backdrop of the theatre.
 *
 * Design constraints learned the hard way:
 * - The theatre's header/main/footer sit in z-20 layers on TOP of the canvas,
 *   so canvas-level pointer listeners never fire where the user actually taps.
 *   Interactive listeners therefore live on the PARENT element, with events
 *   from real controls (buttons, links, inputs) filtered out, and the canvas
 *   itself stays pointer-events-none.
 * - The loop pauses entirely when the tab is hidden or the theatre scrolls
 *   offscreen: a fixed fullscreen canvas that keeps burning frames in the
 *   background is how phones get hot.
 * - Glows and stars are PRE-RENDERED once into tiny offscreen sprites and
 *   drawn with drawImage (GPU-friendly) instead of rebuilding gradients and
 *   shadowBlur 60+ times per frame.
 * - The backing buffer is capped (~2.4MP) so 3x-DPR phones do not allocate
 *   a 10MP canvas.
 * - prefers-reduced-motion: one static frame; the loop only runs while
 *   interaction hearts are alive.
 */

const MAX_BUFFER_PIXELS = 2_400_000;

const PALETTES = {
    gold: { star: '242, 193, 78', accent: '251, 113, 133' },
    aurora: { star: '52, 211, 153', accent: '56, 189, 248' },
    rose: { star: '253, 164, 175', accent: '244, 63, 94' },
    cyan: { star: '56, 189, 248', accent: '168, 85, 247' },
    sunset: { star: '251, 146, 60', accent: '251, 113, 133' },
};

function makeGlowSprite(rgb, peakAlpha) {
    const size = 128;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    if (!g) return c;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, `rgba(${rgb}, ${peakAlpha})`);
    grad.addColorStop(0.5, `rgba(${rgb}, ${peakAlpha * 0.35})`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return c;
}

function makeStarSprite(rgb) {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    if (!g) return c;
    const mid = size / 2;
    const glow = g.createRadialGradient(mid, mid, 0, mid, mid, mid);
    glow.addColorStop(0, `rgba(${rgb}, 0.9)`);
    glow.addColorStop(0.25, `rgba(${rgb}, 0.28)`);
    glow.addColorStop(1, `rgba(${rgb}, 0)`);
    g.fillStyle = glow;
    g.fillRect(0, 0, size, size);
    g.beginPath();
    g.arc(mid, mid, 3, 0, Math.PI * 2);
    g.fillStyle = `rgb(${rgb})`;
    g.fill();
    return c;
}

export default function CinemaCanvas({ className = '', heartBurstTrigger = 0, interactive = true, theme = 'gold' }) {
    const canvasRef = useRef(null);
    const heartsRef = useRef([]);
    const apiRef = useRef(null);
    const interactiveRef = useRef(interactive);
    interactiveRef.current = interactive;

    // External heart burst trigger (scene transitions, love button).
    useEffect(() => {
        if (!heartBurstTrigger) return;
        const api = apiRef.current;
        if (!api) return;
        api.burstFromCenter(18);
    }, [heartBurstTrigger]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const palette = PALETTES[theme] || PALETTES.gold;
        const auraSprite = makeGlowSprite(palette.star, 0.1);
        const cursorSprite = makeGlowSprite(palette.star, 0.25);
        const goldStarSprite = makeStarSprite(palette.star);
        const whiteStarSprite = makeStarSprite('255, 255, 255');

        const reduced = (() => {
            try {
                return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            } catch {
                return false;
            }
        })();

        let width = 0;
        let height = 0;
        const mouse = { x: -9999, y: -9999, radius: 120 };
        const hearts = heartsRef.current;

        const sizeBuffer = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            if (w <= 0 || h <= 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            let bw = Math.round(w * dpr);
            let bh = Math.round(h * dpr);
            const budget = MAX_BUFFER_PIXELS / (bw * bh);
            if (budget < 1) {
                bw = Math.round(bw * Math.sqrt(budget));
                bh = Math.round(bh * Math.sqrt(budget));
            }
            width = canvas.width = bw;
            height = canvas.height = bh;
        };
        sizeBuffer();

        const starCount = Math.max(28, Math.min(70, Math.floor((width * height) / 22000)));
        const stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.2 + 0.8,
            alpha: Math.random() * 0.7 + 0.2,
            alphaSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3 - 0.08,
            isGolden: Math.random() > 0.35,
        }));

        const shootingStars = [];
        let lastMeteorTime = 0;

        const spawnMeteor = () => {
            shootingStars.push({
                x: Math.random() * width * 0.8,
                y: Math.random() * height * 0.35,
                len: Math.random() * 120 + 80,
                speed: Math.random() * 8 + 7,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
                alpha: 1,
                decay: 0.022,
                width: Math.random() * 2 + 1.2,
            });
        };

        const drawHeart = (c, x, y, size, color, alpha, rot) => {
            c.save();
            c.translate(x, y);
            c.rotate(rot);
            c.scale(size / 20, size / 20);
            c.beginPath();
            c.moveTo(0, -5);
            c.bezierCurveTo(-10, -16, -20, 4, 0, 15);
            c.bezierCurveTo(20, 4, 10, -16, 0, -5);
            c.fillStyle = color;
            c.globalAlpha = Math.max(0, alpha);
            c.fill();
            c.restore();
        };

        const addHearts = (px, py, count) => {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 2.5 + 1;
                hearts.push({
                    x: px,
                    y: py,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd - 1.8,
                    size: Math.random() * 14 + 8,
                    alpha: 1,
                    decay: Math.random() * 0.02 + 0.01,
                    rot: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.08,
                    color: ['#f2c14e', '#fb7185', '#ec4899', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 5)],
                });
            }
            ensureRunning();
        };

        // ---- Runtime control: pause when hidden / offscreen ----------------
        let running = false;
        let rafId = 0;
        let lastFrame = 0;

        const render = (now) => {
            if (!running) return;
            // Skip work for backgrounded tabs even if a start raced in.
            if (typeof document !== 'undefined' && document.hidden) {
                rafId = requestAnimationFrame(render);
                return;
            }
            const dt = Math.min(2.5, Math.max(0.25, (now - lastFrame) / 16.67)) || 1;
            lastFrame = now;
            drawFrame(dt);
            // Reduced motion: stop the loop as soon as nothing is moving.
            if (reduced && hearts.length === 0) {
                running = false;
                return;
            }
            rafId = requestAnimationFrame(render);
        };

        const ensureRunning = () => {
            if (running) return;
            running = true;
            lastFrame = performance.now();
            rafId = requestAnimationFrame(render);
        };

        const stopRunning = () => {
            running = false;
            cancelAnimationFrame(rafId);
        };

        let time = 0;
        const drawFrame = (dt) => {
            if (width <= 0 || height <= 0) {
                sizeBuffer();
                if (width <= 0 || height <= 0) return;
            }
            time += 0.016 * dt;
            ctx.clearRect(0, 0, width, height);

            // Breathing warm aura (pre-rendered sprite, scaled).
            const auraScale = reduced ? 1 : 1 + Math.sin(time * 1.6) * 0.08;
            const auraSize = Math.max(1, width * 0.9 * auraScale);
            ctx.globalAlpha = 0.65;
            ctx.drawImage(auraSprite, (width - auraSize) / 2, height * 0.48 - auraSize / 2, auraSize, auraSize);
            ctx.globalAlpha = 1;

            // Cursor interactive glow.
            if (interactiveRef.current && mouse.x > 0) {
                ctx.globalAlpha = 1;
                ctx.drawImage(cursorSprite, mouse.x - mouse.radius, mouse.y - mouse.radius, mouse.radius * 2, mouse.radius * 2);
            }

            if (!reduced) {
                if (now() - lastMeteorTime > 4500 && Math.random() > 0.6) {
                    spawnMeteor();
                    lastMeteorTime = now();
                }
                for (let i = shootingStars.length - 1; i >= 0; i--) {
                    const m = shootingStars[i];
                    m.x += Math.cos(m.angle) * m.speed * dt;
                    m.y += Math.sin(m.angle) * m.speed * dt;
                    m.alpha -= m.decay * dt;
                    if (m.alpha <= 0 || m.x > width || m.y > height) {
                        shootingStars.splice(i, 1);
                        continue;
                    }
                    const tailX = m.x - Math.cos(m.angle) * m.len;
                    const tailY = m.y - Math.sin(m.angle) * m.len;
                    const mGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
                    mGrad.addColorStop(0, 'rgba(255,255,255,0)');
                    mGrad.addColorStop(0.7, `rgba(${palette.star}, ${m.alpha * 0.6})`);
                    mGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(tailX, tailY);
                    ctx.lineTo(m.x, m.y);
                    ctx.strokeStyle = mGrad;
                    ctx.lineWidth = m.width;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // Constellation lines (single stroke style + per-line alpha is
            // far cheaper than building an rgba string per pair per frame).
            ctx.lineWidth = 0.8;
            ctx.strokeStyle = `rgb(${palette.star})`;
            for (let i = 0; i < stars.length; i++) {
                const s1 = stars[i];
                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const dx = s1.x - s2.x;
                    const dy = s1.y - s2.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 12100) {
                        const d = Math.sqrt(d2);
                        ctx.globalAlpha = (1 - d / 110) * 0.25 * Math.min(s1.alpha, s2.alpha);
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.stroke();
                    }
                }
                if (interactiveRef.current && mouse.x > 0) {
                    const mdx = s1.x - mouse.x;
                    const mdy = s1.y - mouse.y;
                    const md2 = mdx * mdx + mdy * mdy;
                    if (md2 < mouse.radius * mouse.radius) {
                        ctx.globalAlpha = (1 - Math.sqrt(md2) / mouse.radius) * 0.45;
                        ctx.strokeStyle = `rgb(${palette.accent})`;
                        ctx.lineWidth = 1.1;
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                        ctx.strokeStyle = `rgb(${palette.star})`;
                        ctx.lineWidth = 0.8;
                    }
                }
            }
            ctx.globalAlpha = 1;

            // Stars from pre-rendered sprites.
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                if (!reduced) {
                    s.alpha += s.alphaSpeed * dt;
                    if (s.alpha > 0.95 || s.alpha < 0.2) s.alphaSpeed = -s.alphaSpeed;
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    if (s.x < 0) s.x = width;
                    if (s.x > width) s.x = 0;
                    if (s.y < 0) s.y = height;
                    if (s.y > height) s.y = 0;
                }
                const r = s.size * 2.6;
                ctx.globalAlpha = s.alpha * (s.isGolden ? 1 : 0.85);
                ctx.drawImage(s.isGolden ? goldStarSprite : whiteStarSprite, s.x - r, s.y - r, r * 2, r * 2);
            }
            ctx.globalAlpha = 1;

            // Floating interactive hearts.
            for (let i = hearts.length - 1; i >= 0; i--) {
                const h = hearts[i];
                h.x += h.vx * dt;
                h.y += h.vy * dt;
                h.rot += h.vRot * dt;
                h.alpha -= h.decay * dt;
                h.size += 0.05 * dt;
                if (h.alpha <= 0) {
                    hearts.splice(i, 1);
                    continue;
                }
                drawHeart(ctx, h.x, h.y, h.size, h.color, h.alpha, h.rot);
            }
        };

        const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

        // ---- Pointer interaction on the PARENT (theatre) layer -------------
        const pickTarget = (e) => {
            const t = e?.target;
            if (!t || typeof t.closest !== 'function') return true;
            return !t.closest('button, a, input, select, textarea, [role="button"], [data-cin-ignore]');
        };

        const getCoord = (e) => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return null;
            return {
                x: (e.clientX - rect.left) * (width / rect.width),
                y: (e.clientY - rect.top) * (height / rect.height),
            };
        };

        const onPointerMove = (e) => {
            if (!interactiveRef.current) return;
            const c = getCoord(e);
            if (!c) return;
            mouse.x = c.x;
            mouse.y = c.y;
            if (!reduced && Math.random() > 0.86) addHearts(c.x, c.y, 1);
        };

        const onTouchMove = (e) => {
            if (!interactiveRef.current || !e.touches[0]) return;
            const c = getCoord(e.touches[0]);
            if (!c) return;
            mouse.x = c.x;
            mouse.y = c.y;
            if (!reduced && Math.random() > 0.82) addHearts(c.x, c.y, 1);
        };

        const onClick = (e) => {
            if (!interactiveRef.current || !pickTarget(e)) return;
            const c = getCoord(e);
            if (c) addHearts(c.x, c.y, 7);
        };

        const onTouchStart = (e) => {
            if (!interactiveRef.current || !e.touches[0] || !pickTarget(e)) return;
            const c = getCoord(e.touches[0]);
            if (c) addHearts(c.x, c.y, 6);
        };

        const onLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        const theater = canvas.parentElement;
        const listenTarget = interactive ? theater || canvas : null;
        if (listenTarget) {
            listenTarget.addEventListener('mousemove', onPointerMove, { passive: true });
            listenTarget.addEventListener('mouseleave', onLeave, { passive: true });
            listenTarget.addEventListener('click', onClick, { passive: true });
            listenTarget.addEventListener('touchstart', onTouchStart, { passive: true });
            listenTarget.addEventListener('touchmove', onTouchMove, { passive: true });
            listenTarget.addEventListener('touchend', onLeave, { passive: true });
        }

        // ---- Resize ---------------------------------------------------------
        let resizeTimer = 0;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const ow = canvas.offsetWidth;
                const oh = canvas.offsetHeight;
                const prevW = width || 1;
                const prevH = height || 1;
                sizeBuffer();
                if (!width || !height) return;
                // Keep stars proportionally placed after the buffer changes.
                const sx = width / prevW;
                const sy = height / prevH;
                for (const s of stars) {
                    s.x *= sx;
                    s.y *= sy;
                }
                if (!running) drawFrame(1);
            }, 180);
        };
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);

        // ---- Visibility + intersection gating --------------------------------
        const onVisibility = () => {
            if (document.hidden) stopRunning();
            else ensureRunning();
        };
        document.addEventListener('visibilitychange', onVisibility);

        let io = null;
        try {
            io = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) ensureRunning();
                    else stopRunning();
                },
                { threshold: 0.01 }
            );
            io.observe(canvas);
        } catch {}

        apiRef.current = {
            burstFromCenter: (count) => addHearts(width / 2, height * 0.55, count),
            awake: ensureRunning,
        };

        // First paint + loop.
        drawFrame(1);
        ensureRunning();

        return () => {
            stopRunning();
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            document.removeEventListener('visibilitychange', onVisibility);
            try {
                io?.disconnect();
            } catch {}
            if (listenTarget) {
                listenTarget.removeEventListener('mousemove', onPointerMove);
                listenTarget.removeEventListener('mouseleave', onLeave);
                listenTarget.removeEventListener('click', onClick);
                listenTarget.removeEventListener('touchstart', onTouchStart);
                listenTarget.removeEventListener('touchmove', onTouchMove);
                listenTarget.removeEventListener('touchend', onLeave);
            }
            apiRef.current = null;
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
        />
    );
}
