import React from 'react';
import { Gift } from 'lucide-react';

/**
 * Real theme previews — every tile renders inside its actual [data-theme]
 * scope, so what visitors see is exactly what the card engine paints.
 * Free themes first (truth: see FREE_THEMES in src/app/b/[id]/page.js).
 */
const THEMES = [
    { id: 'fun', name: 'Fun & Colorful', blurb: 'Confetti pop', free: true, bg: '#fff0f5', color: '#ff69b4', font: 'var(--font-fredoka)' },
    { id: 'elegant', name: 'Elegant', blurb: 'Timeless gold', free: true, bg: '#fdfbf7', color: '#d4af37', font: 'var(--font-playfair)' },
    { id: 'royal', name: 'Royal Gold', blurb: 'Deep twilight, molten gold', free: false, bg: '#120722', color: '#f5c518', font: 'var(--font-playfair)' },
    { id: 'neon', name: 'Cyber Neon', blurb: 'Obsidian, electric cyan', free: false, bg: '#070814', color: '#00f2fe', font: 'var(--font-vt323)' },
    { id: 'midnight', name: 'Cosmic Galaxy', blurb: 'Nebula indigo, stars', free: false, bg: '#060919', color: '#818cf8', font: 'var(--font-quicksand)' },
    { id: 'princess', name: 'Fairy Princess', blurb: 'Iridescent pink', free: false, bg: '#fff2f6', color: '#ec4899', font: 'var(--font-quicksand)' },
    { id: 'retro', name: 'Retro Arcade', blurb: '80s phosphor CRT', free: false, bg: '#12131c', color: '#39ff14', font: 'var(--font-press-start)' },
    { id: 'sunset', name: 'Sunset Luxe', blurb: 'Coral, gold, dusk violet', free: false, bg: '#1f0b24', color: '#ff9052', font: 'var(--font-playfair)' },
    { id: 'unicorn', name: 'Unicorn Kids', blurb: 'Pastel daydream', free: false, bg: '#f5f3ff', color: '#8b5cf6', font: 'var(--font-fredoka)' },
    { id: 'minimal', name: 'Minimal', blurb: 'Clean and calm', free: false, bg: '#ffffff', color: '#111827', font: 'var(--font-inter)' },
    { id: 'holo', name: 'Holographic', blurb: 'Conic light field', free: false, bg: '#0b1026', color: '#7dd3fc', font: 'var(--font-geist)' },
    { id: 'aurora', name: 'Arctic Aurora', blurb: 'Ice sky, emerald light', free: false, bg: '#f2f8ff', color: '#059669', font: 'var(--font-quicksand)' },
];

export default function ThemesRail() {
    return (
        <section id="themes" className="scroll-mt-20 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600">Twelve themes</span>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="max-w-xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Pick the vibe. Every theme repaints everything.
                    </h2>
                    <p className="max-w-sm text-sm leading-relaxed text-muted">
                        Fonts, backgrounds, candles, confetti — one tap switches the whole world.
                        Two themes free; unlock all twelve with a VIP pass.
                    </p>
                </div>
            </div>

            <div
                className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6"
                role="list"
                aria-label="Birthday card themes"
            >
                {THEMES.map((t) => (
                    <a key={t.id} href="#create" role="listitem" className="group w-[248px] shrink-0 snap-start">
                        <div
                            data-theme={t.id}
                            className="rounded-3xl border border-ink/[0.06] p-4 transition-transform duration-200 group-hover:-translate-y-1"
                            style={{ background: t.bg, boxShadow: 'var(--shadow-soft)' }}
                        >
                            <div className="theme-card rounded-2xl p-5" style={{ color: 'var(--text-primary)' }}>
                                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                                <p className="mt-3 text-2xl leading-none" style={{ fontFamily: t.font }}>Ananya</p>
                                <p className="mt-1.5 text-xs opacity-70">Happy birthday to you</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="theme-gift-box grid h-9 w-9 place-items-center rounded-xl">
                                        <Gift className="h-4 w-4 text-white" strokeWidth={1.75} />
                                    </span>
                                    <span className="h-1.5 flex-1 rounded-full" style={{ background: t.color, opacity: 0.35 }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-2 px-1">
                            <div>
                                <p className="text-sm font-semibold text-ink">{t.name}</p>
                                <p className="text-xs text-muted">{t.blurb}</p>
                            </div>
                            {t.free ? (
                                <span className="mt-0.5 shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">Free</span>
                            ) : (
                                <span className="mt-0.5 shrink-0 rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">VIP</span>
                            )}
                        </div>
                    </a>
                ))}
            </div>

            <div className="mx-auto mt-4 max-w-6xl px-4 sm:px-6">
                <p className="text-xs text-muted md:hidden">Swipe to see all twelve →</p>
            </div>
        </section>
    );
}
