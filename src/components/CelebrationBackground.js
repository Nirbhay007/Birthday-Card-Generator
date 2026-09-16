'use client';

import React, { useMemo } from 'react';

const THEME_PARTICLES = {
    royal: {
        emojis: ['✨', '⭐', '🌟', '👑', '💛', '🎈'],
        starCount: 16,
        starColor: 'rgba(245, 197, 24, 0.9)',
        starGlow: '0 0 10px 2px rgba(245, 197, 24, 0.8)',
    },
    neon: {
        emojis: ['⚡', '💫', '🎉', '🔷', '✨'],
        starCount: 14,
        starColor: 'rgba(0, 242, 254, 0.95)',
        starGlow: '0 0 12px 3px rgba(0, 242, 254, 0.85)',
    },
    midnight: {
        emojis: ['✨', '⭐', '🌌', '🌟', '🎈'],
        starCount: 18,
        starColor: 'rgba(255, 255, 255, 0.95)',
        starGlow: '0 0 8px 2px rgba(168, 85, 247, 0.8)',
    },
    princess: {
        emojis: ['💖', '✨', '🌸', '🎀', '💎', '🎈'],
        starCount: 12,
        starColor: 'rgba(255, 182, 193, 0.95)',
        starGlow: '0 0 10px 2px rgba(236, 72, 153, 0.75)',
    },
    retro: {
        emojis: ['👾', '⭐', '✨', '🎈', '🕹️'],
        starCount: 10,
        starColor: 'rgba(57, 255, 20, 0.95)',
        starGlow: '0 0 10px 2px rgba(57, 255, 20, 0.8)',
    },
    sunset: {
        emojis: ['🧡', '✨', '🌅', '🎈', '🌟'],
        starCount: 12,
        starColor: 'rgba(255, 179, 71, 0.95)',
        starGlow: '0 0 10px 2px rgba(255, 126, 95, 0.75)',
    },
    fun: {
        emojis: ['🎈', '🎈', '🎉', '✨', '🥳'],
        starCount: 0,
    },
    elegant: {
        emojis: ['🎈', '✨', '⭐'],
        starCount: 8,
        starColor: 'rgba(212, 175, 55, 0.75)',
        starGlow: '0 0 6px 1px rgba(212, 175, 55, 0.5)',
    },
};

export default function CelebrationBackground({ theme = 'elegant', density = 'normal' }) {
    const config = THEME_PARTICLES[theme] || THEME_PARTICLES.elegant;

    const balloons = useMemo(() => {
        // Reduced counts: light 8→5, normal 15→9, dense 22→14
        const count = density === 'light' ? 5 : density === 'dense' ? 14 : 9;
        const list = config.emojis || ['🎈', '✨', '🎉'];
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: (i * 71 + 13) % 100,
            delay: (i * 1.6) % 8.5,
            duration: 10 + ((i * 2.1) % 6),
            size: 18 + ((i * 11) % 20),
            emoji: list[i % list.length],
        }));
    }, [density, config]);

    const stars = useMemo(() => {
        const count = config.starCount || 0;
        if (count === 0) return [];
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: (i * 39 + 7) % 100,
            top: (i * 47 + 5) % 68,
            delay: (i * 0.35) % 2.5,
            size: 4 + ((i * 5) % 8),
        }));
    }, [config]);

    return (
        <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
            style={{ contain: 'strict' }}
        >
            {stars.map((s) => (
                <span
                    key={`star-${s.id}`}
                    className="twinkle-star absolute rounded-full"
                    style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        width: s.size,
                        height: s.size,
                        backgroundColor: config.starColor || '#ffffff',
                        boxShadow: config.starGlow || '0 0 8px 2px rgba(255,255,255,0.7)',
                        animationDelay: `${s.delay}s`,
                    }}
                />
            ))}
            {balloons.map((b) => (
                <span
                    key={`balloon-${b.id}`}
                    className="absolute select-none"
                    style={{
                        left: `${b.left}%`,
                        bottom: '-8vh',
                        fontSize: b.size,
                        animation: `balloon-drift ${b.duration}s linear ${b.delay}s infinite`,
                        opacity: 0,
                        willChange: 'transform, opacity',
                    }}
                >
                    {b.emoji}
                </span>
            ))}
        </div>
    );
}
