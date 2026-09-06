'use client';

import React, { useMemo } from 'react';

const BALLOON_COLORS = ['#ff5d8f', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#f5c518'];
const BALLOON_EMOJI = ['🎈', '🎈', '🎈', '🎈', '🎈', '✨', '⭐', '🎉'];

export default function CelebrationBackground({ theme = 'elegant', density = 'normal' }) {
    const balloons = useMemo(() => {
        const count = density === 'light' ? 8 : density === 'dense' ? 20 : 14;
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: (i * 73 + 11) % 100,
            delay: (i * 1.7) % 9,
            duration: 9 + ((i * 2.3) % 7),
            size: 18 + ((i * 13) % 22),
            emoji: BALLOON_EMOJI[i % BALLOON_EMOJI.length],
            color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        }));
    }, [density]);

    const stars = useMemo(() => {
        if (theme !== 'midnight' && theme !== 'royal') return [];
        return Array.from({ length: 24 }).map((_, i) => ({
            id: i,
            left: (i * 37 + 5) % 100,
            top: (i * 53 + 7) % 60,
            delay: (i * 0.4) % 2.2,
            size: 6 + ((i * 7) % 10),
        }));
    }, [theme]);

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {stars.map((s) => (
                <span
                    key={`star-${s.id}`}
                    className="twinkle-star absolute rounded-full bg-white"
                    style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        width: s.size / 3,
                        height: s.size / 3,
                        boxShadow: '0 0 8px 2px rgba(255,255,255,0.7)',
                        animationDelay: `${s.delay}s`,
                    }}
                />
            ))}
            {balloons.map((b) => (
                <span
                    key={`balloon-${b.id}`}
                    className="absolute"
                    style={{
                        left: `${b.left}%`,
                        bottom: '-8vh',
                        fontSize: b.size,
                        animation: `balloon-drift ${b.duration}s linear ${b.delay}s infinite`,
                        filter: 'saturate(1.2)',
                        opacity: 0,
                    }}
                >
                    {b.emoji}
                </span>
            ))}
        </div>
    );
}
