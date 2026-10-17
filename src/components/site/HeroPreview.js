import React from 'react';
import Image from 'next/image';
import { Gift, Sparkles, Wind, Music, Heart } from 'lucide-react';

/**
 * Hero visual: a real composition built from the product's own theme engine
 * (data-theme + theme-card + theme-gift-box). No fake screenshot — this IS
 * the card surface, rendered with the royal VIP theme.
 */
export default function HeroPreview() {
    return (
        <div className="relative mx-auto w-full max-w-[340px]">
            <div className="rounded-[2.75rem] bg-ink p-3 shadow-lift">
                <div data-theme="royal" className="overflow-hidden rounded-[2.25rem]" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    <div className="theme-card m-4 rounded-3xl p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-widest opacity-60">For Ananya</span>
                            <Gift className="h-4 w-4" style={{ color: 'var(--accent-color)' }} strokeWidth={1.75} />
                        </div>
                        <div className="theme-gift-box mx-auto mt-6 grid h-24 w-24 place-items-center rounded-3xl">
                            <Sparkles className="h-9 w-9 text-white" strokeWidth={1.75} />
                        </div>
                        <p className="mt-5 text-center text-xs opacity-70">Tap the gift to open your surprise</p>
                    </div>

                    <div className="m-4 mt-0 space-y-3">
                        <Image
                            src="/sample-memory.jpg"
                            alt="A favourite photo inside the memory gallery"
                            width={320}
                            height={160}
                            className="h-28 w-full rounded-2xl object-cover"
                            priority
                        />
                        <div className="theme-card rounded-2xl p-4">
                            <p className="text-xs leading-relaxed">
                                “Happy birthday, Ananya — here is to more midnight cake and terrible dancing.”
                            </p>
                            <div className="mt-3 flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <Heart key={i} className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="float-soft absolute -left-8 top-24 hidden items-center gap-2 rounded-2xl border border-ink/[0.06] bg-white px-3.5 py-2.5 shadow-soft sm:flex">
                <Wind className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
                <span className="text-xs font-semibold">Blow the candles</span>
            </div>
            <div
                className="float-soft absolute -right-6 bottom-28 hidden items-center gap-2 rounded-2xl border border-ink/[0.06] bg-white px-3.5 py-2.5 shadow-soft sm:flex"
                style={{ animationDelay: '1.2s' }}
            >
                <Music className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
                <span className="text-xs font-semibold">Music on</span>
            </div>

            <p className="mt-4 text-center text-xs text-muted">A real card, painted by your chosen theme</p>
        </div>
    );
}
