'use client';

import React, { useEffect, useRef } from 'react';

/**
 * CelestialCanvas
 * Lightweight, high-performance HTML5 canvas particle system.
 * Renders glowing celestial stardust, drifting gold embers, and
 * mouse/touch gravitational attraction without any heavy WebGL overhead.
 */
export default function CelestialCanvas({
    className = '',
    density = 45,
    speed = 0.35,
    glowColor = 'rgba(242, 193, 78, 0.4)',
    particleColor = '255, 245, 220',
    interactive = true,
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId;
        let width = (canvas.width = canvas.offsetWidth);
        let height = (canvas.height = canvas.offsetHeight);

        const mouse = { x: -9999, y: -9999, radius: 100 };

        // Generate particles
        const particles = Array.from({ length: density }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.8 + 0.6,
            baseAlpha: Math.random() * 0.6 + 0.2,
            alpha: Math.random() * 0.6 + 0.2,
            alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed - 0.1, // gentle upward drift
            golden: Math.random() > 0.45,
        }));

        const handleResize = () => {
            if (!canvas) return;
            const w = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 0;
            const h = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 0;
            if (w > 0 && h > 0) {
                width = canvas.width = w;
                height = canvas.height = h;
            }
        };

        const handleMouseMove = (e) => {
            if (!interactive) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        const handleTouchMove = (e) => {
            if (!interactive) return;
            const touch = e.touches[0];
            if (!touch) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = touch.clientX - rect.left;
            mouse.y = touch.clientY - rect.top;
        };

        const handleTouchEnd = () => {
            mouse.x = -9999;
            mouse.y = -9999;
        };

        window.addEventListener('resize', handleResize);
        if (interactive) {
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
            canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
            canvas.addEventListener('touchend', handleTouchEnd);
        }

        // Render loop
        const render = () => {
            if (width <= 0 || height <= 0) {
                handleResize();
                if (width <= 0 || height <= 0) {
                    animationFrameId = requestAnimationFrame(render);
                    return;
                }
            }
            ctx.clearRect(0, 0, width, height);

            // Subtle ambient mouse glow
            if (interactive && mouse.x > 0 && mouse.y > 0) {
                const mouseRadius = Math.max(1, mouse.radius * 1.2);
                const radial = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseRadius);
                radial.addColorStop(0, glowColor);
                radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = radial;
                ctx.fillRect(0, 0, width, height);
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Twinkle
                p.alpha += p.alphaSpeed;
                if (p.alpha > 0.85 || p.alpha < 0.15) {
                    p.alphaSpeed = -p.alphaSpeed;
                }

                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges seamlessly
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Mouse interaction — gentle magnetic pull & brightness boost
                let currentAlpha = p.alpha;
                let currentSize = p.size;
                if (interactive && mouse.x > 0) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (1 - dist / mouse.radius) * 0.4;
                        p.x += dx * force * 0.05;
                        p.y += dy * force * 0.05;
                        currentAlpha = Math.min(1, currentAlpha + 0.4);
                        currentSize = p.size * 1.35;
                    }
                }

                // Draw stardust particle with soft halo
                ctx.beginPath();
                ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = p.golden
                    ? `rgba(242, 193, 78, ${currentAlpha})`
                    : `rgba(${particleColor}, ${currentAlpha})`;
                ctx.shadowBlur = p.golden ? 6 : 4;
                ctx.shadowColor = p.golden ? '#f2c14e' : '#ffffff';
                ctx.fill();
                ctx.shadowBlur = 0; // reset for performance
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (interactive) {
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseleave', handleMouseLeave);
                canvas.removeEventListener('touchmove', handleTouchMove);
                canvas.removeEventListener('touchend', handleTouchEnd);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [density, speed, glowColor, particleColor, interactive]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
        />
    );
}
