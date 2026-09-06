'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Heart, Sparkles } from 'lucide-react';
import CandleBlower from '@/components/CandleBlower';
import CelebrationBackground from '@/components/CelebrationBackground';
import { BIRTHDAY_OPENED_EVENT } from '@/lib/music';

function useTypewriter(text, start, speed = 70) {
    const [out, setOut] = useState('');
    useEffect(() => {
        if (!start) return;
        let i = 0;
        const t = setInterval(() => {
            i += 1;
            setOut(text.slice(0, i));
            if (i >= text.length) clearInterval(t);
        }, speed);
        return () => clearInterval(t);
    }, [text, start, speed]);
    return out;
}

export default function BirthdayExperience({ page, photos, gallery, shareSlot, audioSlot }) {
    const [opened, setOpened] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [heartCount, setHeartCount] = useState(page.loves || 0);
    const [viewCount, setViewCount] = useState(page.viewCount || 0);
    const typedName = useTypewriter(page.recipientName || 'Friend', opened, 90);

    // Count one view per visit (session-guarded), fire-and-forget
    useEffect(() => {
        try {
            const key = `bgen-viewed-${page.id}`;
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, '1');
            fetch(`/api/birthday/${page.id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'view' }),
            })
                .then((r) => r.json())
                .then((d) => { if (d.success && typeof d.viewCount === 'number') setViewCount(d.viewCount); })
                .catch(() => {});
        } catch {}
    }, [page.id]);

    const handleOpen = () => {
        setOpened(true);
        // Synchronous dispatch inside the tap gesture so audio is allowed to start
        try { window.dispatchEvent(new CustomEvent(BIRTHDAY_OPENED_EVENT)); } catch {}
        confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true });
        setTimeout(() => {
            confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true });
            confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true });
        }, 300);
    };

    const sendHeart = () => {
        const id = Date.now() + Math.random();
        setHearts((h) => [...h.slice(-14), id]);
        setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1600);
        // Every tap animates; only the first tap per browser session is
        // counted (the server cookie is the authoritative second layer).
        try {
            const key = `bgen-loved-${page.id}`;
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, '1');
        } catch {
            return;
        }
        try {
            fetch(`/api/birthday/${page.id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'love' }),
            })
                .then((r) => r.json())
                .then((d) => { if (d.success && typeof d.loves === 'number') setHeartCount(d.loves); else setHeartCount((c) => c + 1); })
                .catch(() => setHeartCount((c) => c + 1));
        } catch {
            setHeartCount((c) => c + 1);
        }
    };

    return (
        <div className="relative">
            <CelebrationBackground theme={page.theme} density={opened ? 'normal' : 'light'} />

            {/* Gift gate */}
            {!opened && (
                <div className="relative z-10 min-h-[62vh] flex flex-col items-center justify-center text-center px-6 py-14">
                    <div className="pop-in max-w-md w-full bg-white/55 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-xl border border-white/40">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 mb-3">You&apos;ve got a surprise</p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Hey {page.recipientName}! 🎁
                        </h1>
                        <p className="text-sm opacity-75 mb-6">
                            Someone made something special for you. Tap the gift to open it.
                            {page.senderName ? <><br />With love, <strong>{page.senderName}</strong></> : null}
                        </p>
                        <button
                            onClick={handleOpen}
                            className="gift-wiggle mx-auto w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer"
                            aria-label={`Open birthday surprise for ${page.recipientName}`}
                        >
                            <Gift className="w-14 h-14" aria-hidden="true" />
                        </button>
                        <p className="mt-5 text-xs font-semibold opacity-60 animate-pulse">👆 Tap to open your surprise</p>
                    </div>
                </div>
            )}

            {/* Revealed celebration */}
            {opened && (
                <div className="relative z-10">
                    <header className="text-center mb-8 space-y-4 pop-in">
                        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-white/60 border border-white/50 rounded-full px-3 py-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            {page.relationship ? ` For your amazing ${page.relationship}` : ' A surprise just for you'}
                        </p>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            Happy Birthday
                        </h1>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 animated-gradient-text min-h-[1.2em]">
                            {typedName}<span className="animate-pulse">|</span>
                        </h2>
                        {page.message && (
                            <blockquote className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed italic border-l-4 border-purple-500 pl-4 py-2 my-6 bg-white/30 rounded-r-xl text-left sm:text-center sm:border-l-0 sm:border-t-4 sm:pt-4 sm:pl-0">
                                &ldquo;{page.message}&rdquo;
                            </blockquote>
                        )}
                        {page.senderName && (
                            <p className="text-sm font-semibold opacity-70">— With all my love, {page.senderName} 💜</p>
                        )}
                        {viewCount > 0 && (
                            <p className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/50 border border-white/40 rounded-full px-3 py-1 opacity-80">
                                👁 {viewCount} {viewCount === 1 ? 'view' : 'views'} of this surprise
                            </p>
                        )}
                    </header>

                    <div className="mb-14 bg-white/55 backdrop-blur-md rounded-3xl p-4 sm:p-8 shadow-xl border border-white/40 pop-in">
                        <CandleBlower age={page.age} recipientName={page.recipientName} />
                    </div>

                    {photos?.length > 0 && (
                        <section className="mb-14 space-y-5" aria-label="Photo Memories">
                            <h3 className="text-2xl font-bold text-center opacity-90">Cherished Memories 📸</h3>
                            {gallery}
                        </section>
                    )}

                    {/* Reactions */}
                    <div className="text-center mb-10">
                        <div className="relative inline-block">
                            <button
                                onClick={sendHeart}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 hover:bg-white border border-pink-200 shadow-md font-bold text-pink-700 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-200 cursor-pointer"
                                aria-label="Send love to this birthday page"
                            >
                                <Heart className="w-5 h-5 fill-pink-500 text-pink-500" /> {heartCount > 0 ? `Send love • ${heartCount}` : 'Be the first to send love!'}
                            </button>
                            {hearts.map((id) => (
                                <span
                                    key={id}
                                    className="absolute left-1/2 -top-2 text-2xl pointer-events-none"
                                    style={{ animation: 'smoke-rise 1.5s ease-out forwards', marginLeft: `${(id % 60) - 30}px` }}
                                    aria-hidden="true"
                                >
                                    💜
                                </span>
                            ))}
                        </div>
                        <p className="text-xs opacity-60 mt-2">Tap to shower {page.recipientName} with love</p>
                    </div>

                    {shareSlot}
                </div>
            )}

            {/* Fixed-position player: mounted from page load so it can catch
                the synchronous gift-open gesture and start music reliably */}
            {audioSlot}
        </div>
    );
}
