'use client';

import React, { useEffect, useRef } from 'react';

/**
 * CinemaCanvas
 * High-performance, emotion-first HTML5 Canvas particle & constellation engine.
 * Features:
 * - Floating golden embers & starlight motes
 * - Connected constellation lines between nearby stars & pointer
 * - Interactive heart bursts on tap/touch/click
 * - Graceful shooting stars traversing the dark theatre
 * - Breathing warm candlelight heartbeat aura
 */
export default function CinemaCanvas({
    className = '',
    heartBurstTrigger = 0,
    interactive = true,
    theme = 'gold', // 'gold' | 'aurora' | 'rose' | 'cyan'
}) {
    const canvasRef = useRef(null);
    const heartsRef = useRef([]);

    // External heart burst trigger (e.g. from buttons or scene transitions)
    useEffect(() => {
        if (!heartBurstTrigger) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cx = canvas.width / 2;
        const cy = canvas.height * 0.55;
        for (let i = 0; i < 18; i++) {
            const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 3 + 2;
            heartsRef.current.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                size: Math.random() * 16 + 10,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008,
                rot: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.05,
                color: ['#f2c14e', '#fb7185', '#f43f5e', '#38bdf8', '#a855f7'][Math.floor(Math.random() * 5)],
            });
        }
    }, [heartBurstTrigger]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animId;
        let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 1.5 : 1));
        let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 1.5 : 1));

        const mouse = { x: -9999, y: -9999, radius: 120 };

        // Color palettes
        const palettes = {
            gold: {
                star: '242, 193, 78',
                accent: '251, 113, 133',
                line: 'rgba(242, 193, 78, 0.18)',
                aura: 'rgba(242, 193, 78, 0.08)',
            },
            aurora: {
                star: '52, 211, 153',
                accent: '56, 189, 248',
                line: 'rgba(52, 211, 153, 0.2)',
                aura: 'rgba(5, 150, 105, 0.09)',
            },
            rose: {
                star: '253, 164, 175',
                accent: '244, 63, 94',
                line: 'rgba(253, 164, 175, 0.22)',
                aura: 'rgba(225, 29, 72, 0.08)',
            },
            cyan: {
                star: '56, 189, 248',
                accent: '168, 85, 247',
                line: 'rgba(56, 189, 248, 0.2)',
                aura: 'rgba(14, 165, 233, 0.08)',
            },
        };
        const curPalette = palettes[theme] || palettes.gold;

        // Background constellation stars
        const starCount = Math.min(65, Math.floor((width * height) / 14000));
        const stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.2 + 0.8,
            alpha: Math.random() * 0.7 + 0.2,
            alphaSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3 - 0.08, // gentle upward drift
            isGolden: Math.random() > 0.35,
        }));

        // Shooting stars pool
        let shootingStars = [];
        let lastMeteorTime = Date.now();

        const spawnMeteor = () => {
            const startX = Math.random() * width * 0.8;
            const startY = Math.random() * height * 0.35;
            shootingStars.push({
                x: startX,
                y: startY,
                len: Math.random() * 120 + 80,
                speed: Math.random() * 8 + 7,
                angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2,
                alpha: 1,
                decay: 0.022,
                width: Math.random() * 2 + 1.2,
            });
        };

        // Heart drawer helper
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
            c.shadowBlur = 10;
            c.shadowColor = color;
            c.fill();
            c.restore();
        };

        const addTouchHearts = (px, py, count = 4) => {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 2.5 + 1;
                heartsRef.current.push({
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
        };

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio > 1 ? 1.5 : 1);
            height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio > 1 ? 1.5 : 1);
        };

        const getCoord = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY,
            };
        };

        const onMouseMove = (e) => {
            if (!interactive) return;
            const c = getCoord(e);
            mouse.x = c.x;
            mouse.y = c.y;
            if (Math.random() > 0.85) {
                addTouchHearts(c.x, c.y, 1);
            }
        };

        const onTouchMove = (e) => {
            if (!interactive || !e.touches[0]) return;
            const c = getCoord(e.touches[0]);
            mouse.x = c.x;
            mouse.y = c.y;
            if (Math.random() > 0.8) {
                addTouchHearts(c.x, c.y, 1);
            }
        };

        const onClick = (e) => {
            if (!interactive) return;
            const c = getCoord(e);
            addTouchHearts(c.x, c.y, 7);
        };

        const onTouchStart = (e) => {
            if (!interactive || !e.touches[0]) return;
            const c = getCoord(e.touches[0]);
            addTouchHearts(c.x, c.y, 6);
        };

        const onLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        window.addEventListener('resize', handleResize);
        if (interactive) {
            canvas.addEventListener('mousemove', onMouseMove);
            canvas.addEventListener('mouseleave', onLeave);
            canvas.addEventListener('click', onClick);
            canvas.addEventListener('touchstart', onTouchStart, { passive: true });
            canvas.addEventListener('touchmove', onTouchMove, { passive: true });
            canvas.addEventListener('touchend', onLeave);
        }

        let time = 0;

        const render = () => {
            if (width <= 0 || height <= 0) {
                handleResize();
                if (width <= 0 || height <= 0) {
                    animId = requestAnimationFrame(render);
                    return;
                }
            }
            time += 0.016;
            ctx.clearRect(0, 0, width, height);

            // Breathing warm aura in center
            const auraScale = 1 + Math.sin(time * 1.6) * 0.08;
            const auraRadius = Math.max(1, width * 0.42 * auraScale);
            const auraGrad = ctx.createRadialGradient(
                width / 2,
                height * 0.48,
                0,
                width / 2,
                height * 0.48,
                auraRadius
            );
            auraGrad.addColorStop(0, curPalette.aura);
            auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = auraGrad;
            ctx.fillRect(0, 0, width, height);

            // Cursor interactive glow
            if (interactive && mouse.x > 0) {
                const mouseRadius = Math.max(1, mouse.radius * 1.3);
                const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseRadius);
                mouseGrad.addColorStop(0, `rgba(${curPalette.star}, 0.22)`);
                mouseGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = mouseGrad;
                ctx.fillRect(0, 0, width, height);
            }

            // Spawn random shooting star every ~4.5 seconds
            if (Date.now() - lastMeteorTime > 4500 && Math.random() > 0.6) {
                spawnMeteor();
                lastMeteorTime = Date.now();
            }

            // Render shooting stars
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const m = shootingStars[i];
                m.x += Math.cos(m.angle) * m.speed;
                m.y += Math.sin(m.angle) * m.speed;
                m.alpha -= m.decay;

                if (m.alpha <= 0 || m.x > width || m.y > height) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                const tailX = m.x - Math.cos(m.angle) * m.len;
                const tailY = m.y - Math.sin(m.angle) * m.len;
                const mGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
                mGrad.addColorStop(0, 'rgba(255,255,255,0)');
                mGrad.addColorStop(0.7, `rgba(${curPalette.star}, ${m.alpha * 0.6})`);
                mGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(m.x, m.y);
                ctx.strokeStyle = mGrad;
                ctx.lineWidth = m.width;
                ctx.lineCap = 'round';
                ctx.shadowBlur = 12;
                ctx.shadowColor = `rgba(${curPalette.star}, 0.8)`;
                ctx.stroke();
                ctx.restore();
            }

            // Draw Constellation Connections between nearby stars
            for (let i = 0; i < stars.length; i++) {
                const s1 = stars[i];
                for (let j = i + 1; j < stars.length; j++) {
                    const s2 = stars[j];
                    const dx = s1.x - s2.x;
                    const dy = s1.y - s2.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < 110) {
                        const lineAlpha = (1 - d / 110) * 0.25 * Math.min(s1.alpha, s2.alpha);
                        ctx.strokeStyle = `rgba(${curPalette.star}, ${lineAlpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y);
                        ctx.lineTo(s2.x, s2.y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse/pointer
                if (interactive && mouse.x > 0) {
                    const mdx = s1.x - mouse.x;
                    const mdy = s1.y - mouse.y;
                    const md = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (md < mouse.radius) {
                        const mLineAlpha = (1 - md / mouse.radius) * 0.45;
                        ctx.strokeStyle = `rgba(${curPalette.accent}, ${mLineAlpha})`;
                        ctx.lineWidth = 1.1;
                        ctx.beginPath();
                        ctx.moveTo(s1.x, s1.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }

            // Render stars
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.alpha += s.alphaSpeed;
                if (s.alpha > 0.95 || s.alpha < 0.2) s.alphaSpeed = -s.alphaSpeed;

                s.x += s.vx;
                s.y += s.vy;
                if (s.x < 0) s.x = width;
                if (s.x > width) s.x = 0;
                if (s.y < 0) s.y = height;
                if (s.y > height) s.y = 0;

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = s.isGolden
                    ? `rgba(${curPalette.star}, ${s.alpha})`
                    : `rgba(255, 255, 255, ${s.alpha * 0.85})`;
                ctx.shadowBlur = s.isGolden ? 8 : 4;
                ctx.shadowColor = s.isGolden ? `rgb(${curPalette.star})` : '#ffffff';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Render floating interactive hearts
            const hearts = heartsRef.current;
            for (let i = hearts.length - 1; i >= 0; i--) {
                const h = hearts[i];
                h.x += h.vx;
                h.y += h.vy;
                h.rot += h.vRot;
                h.alpha -= h.decay;
                h.size += 0.05;

                if (h.alpha <= 0) {
                    hearts.splice(i, 1);
                    continue;
                }

                drawHeart(ctx, h.x, h.y, h.size, h.color, h.alpha, h.rot);
            }

            animId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (interactive) {
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('mouseleave', onLeave);
                canvas.removeEventListener('click', onClick);
                canvas.removeEventListener('touchstart', onTouchStart);
                canvas.removeEventListener('touchmove', onTouchMove);
                canvas.removeEventListener('touchend', onLeave);
            }
            cancelAnimationFrame(animId);
        };
    }, [interactive, theme]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`pointer-events-auto absolute inset-0 h-full w-full ${className}`}
        />
    );
}
