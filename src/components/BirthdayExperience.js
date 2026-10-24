'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Heart, Sparkles, Crown, Palette, Eye, Copy, Check, X } from 'lucide-react';
import CandleBlower from '@/components/CandleBlower';
import CelebrationBackground from '@/components/CelebrationBackground';
import ProAtmosphere from '@/components/ProAtmosphere';
import VipCustomizerModal from '@/components/VipCustomizerModal';
import PostCreationModal from '@/components/PostCreationModal';
import KeepsakeCard from '@/components/premium/KeepsakeCard';
import { BIRTHDAY_OPENED_EVENT } from '@/lib/music';
import { trackShare } from '@/lib/shareTracking';
import { track } from '@/lib/track';
import { detectRegion, getVipCardPrice } from '@/lib/payments';
import { cn } from '@/lib/utils';

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

function isPreviewUrl() {
    try {
        const q = new URLSearchParams(window.location.search);
        if (!q.has('preview')) return false;
        const v = (q.get('preview') || '').toLowerCase();
        return v === '' || v === '1' || v === 'true' || v === 'yes' || v === 'on';
    } catch { }
    return false;
}

function checkIsOwner(pageId, preview) {
    if (typeof window === 'undefined') return false;
    try {
        const q = new URLSearchParams(window.location.search);
        if (q.has('viewer') || q.get('as') === 'recipient') return false;
        if (preview) return true;
        if (q.has('preview') || q.has('edit') || q.has('customize') || q.has('owner')) return true;
        return !!localStorage.getItem(`bgen_owner_${pageId}`);
    } catch {
        return false;
    }
}

function isViewerParam() {
    if (typeof window === 'undefined') return false;
    try {
        const q = new URLSearchParams(window.location.search);
        return q.has('viewer') || q.get('as') === 'recipient';
    } catch {
        return false;
    }
}

function isCreatedParam() {
    if (typeof window === 'undefined') return false;
    try {
        const q = new URLSearchParams(window.location.search);
        return q.has('created') || q.has('new') || q.has('manage');
    } catch {
        return false;
    }
}

export default function BirthdayExperience({ page, photos, gallery, shareSlot, audioSlot, preview = false, autoOpen = false }) {
    const [opened, setOpened] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [heartCount, setHeartCount] = useState(page.loves || 0);
    const [viewCount, setViewCount] = useState(page.viewCount || 0);
    const [customizerOpen, setCustomizerOpen] = useState(false);
    // URL-derived UI starts from the server-safe value and is applied after
    // hydration. Branching on window.location during the first render makes
    // SSR and the client disagree (React hydration mismatch).
    const [vipModalOpen, setVipModalOpen] = useState(!!autoOpen);
    const [isOwner, setIsOwner] = useState(!!preview);
    const [isViewerPreview, setIsViewerPreview] = useState(false);
    const [showCreatorNotice, setShowCreatorNotice] = useState(true);
    const [copiedNotice, setCopiedNotice] = useState(false);
    const [vipPrice, setVipPrice] = useState({ label: '₹29' });
    // Show a hint pointing to Customize after fresh VIP activation (from ?vip=1 param)
    const [showCustomizeHint, setShowCustomizeHint] = useState(false);
    // Social-proof upsell is dismissible and remembered per card.
    const [proofDismissed, setProofDismissed] = useState(false);
    const proofShownRef = useRef(false);

    useEffect(() => {
        try {
            // Hydration-safe: localStorage is only read after mount.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (localStorage.getItem(`bgen-proof-dismissed-${page.id}`)) setProofDismissed(true);
        } catch { }
    }, [page.id]);

    useEffect(() => {
        if (isCreatedParam()) setVipModalOpen(true);
        setIsOwner(checkIsOwner(page.id, preview));
        setIsViewerPreview(isViewerParam());
        try {
            setVipPrice(getVipCardPrice(detectRegion()));
        } catch { }
        if (page.isVip) {
            try {
                const q = new URLSearchParams(window.location.search);
                if (q.has('vip')) setShowCustomizeHint(true);
            } catch { }
        }
    }, [page.id, page.isVip, preview]);
    // Auto-dismiss the customize hint after 6 seconds
    useEffect(() => {
        if (!showCustomizeHint) return;
        const t = setTimeout(() => setShowCustomizeHint(false), 6000);
        return () => clearTimeout(t);
    }, [showCustomizeHint]);
    // Server prop covers first paint; live URL check covers client-side nav.
    // Applying the URL check after mount keeps hydration deterministic.
    const [previewMode, setPreviewMode] = useState(!!preview);
    useEffect(() => {
        if (!preview && isPreviewUrl()) setPreviewMode(true);
    }, [preview]);
    const typedName = useTypewriter(page.recipientName || 'Friend', opened, 90);

    const openVip = () => {
        track('upgrade_cta_click');
        setVipModalOpen(true);
    };

    const handleCopyLink = async () => {
        try {
            const url = typeof window !== 'undefined' ? `${window.location.origin}/b/${page.id}` : '';
            if (url) {
                await navigator.clipboard.writeText(url);
                trackShare({ pageId: page.id, channel: 'copy', source: 'creator_notice' });
                setCopiedNotice(true);
                setTimeout(() => setCopiedNotice(false), 2000);
            }
        } catch { }
    };

    useEffect(() => {
        const onOpenVip = () => {
            track('upgrade_cta_click');
            setVipModalOpen(true);
        };
        window.addEventListener('vip:open', onOpenVip);

        const onPopState = () => {
            const q = new URLSearchParams(window.location.search);
            if (q.has('created') || q.has('new') || q.has('manage')) {
                setVipModalOpen(true);
            } else {
                setVipModalOpen(false);
            }
        };
        window.addEventListener('popstate', onPopState);

        return () => {
            window.removeEventListener('vip:open', onOpenVip);
            window.removeEventListener('popstate', onPopState);
        };
    }, []);

    const handleCloseVipModal = () => {
        setVipModalOpen(false);
        try {
            const q = new URLSearchParams(window.location.search);
            if (q.has('created') || q.has('new') || q.has('manage')) {
                window.history.pushState({}, '', `/b/${page.id}`);
            }
        } catch { }
    };

    // Count one view per visit (session-guarded), fire-and-forget.
    // Skipped for preview links AND for the creator's own visits (owner token,
    // ?viewer=1, ?preview=1) so creator self-views never inflate the count.
    useEffect(() => {
        if (previewMode || isPreviewUrl() || isViewerParam() || checkIsOwner(page.id, preview)) return;
        try {
            const key = `bgen-viewed-${page.id}`;
            // The server also dedupes with an httpOnly cookie, so a returning
            // browser already cannot increment the count. Skip the network call
            // entirely for those repeat visits.
            if (sessionStorage.getItem(key) || localStorage.getItem(key)) return;
            sessionStorage.setItem(key, '1');
            localStorage.setItem(key, '1');
            fetch(`/api/birthday/${page.id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'view' }),
            })
                .then((r) => r.json())
                .then((d) => { if (d.success && typeof d.viewCount === 'number') setViewCount(d.viewCount); })
                .catch(() => { });
        } catch { }
    }, [page.id, previewMode, preview]);

    // Fresh social proof for the owner's proof-moment banner. The server prop
    // can be stale on an ISR page; this read is cheap and only runs for owners.
    useEffect(() => {
        if (!isOwner || page.isVip) return;
        let alive = true;
        fetch(`/api/birthday/${page.id}/react`)
            .then((r) => r.json())
            .then((d) => {
                if (alive && d?.success && typeof d.loves === 'number') setHeartCount(d.loves);
            })
            .catch(() => { });
        return () => { alive = false; };
    }, [isOwner, page.id, page.isVip]);

    const handleOpen = () => {
        setOpened(true);
        // Synchronous dispatch inside the tap gesture so audio is allowed to start
        try { window.dispatchEvent(new CustomEvent(BIRTHDAY_OPENED_EVENT)); } catch { }
        const proColors = ['#f5c518', '#7dd3fc', '#a78bfa', '#f472b6', '#ffffff'];
        const common = page.isVipPro ? { colors: proColors } : {};
        confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true, ...common });
        setTimeout(() => {
            confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true, ...common });
            confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true, ...common });
        }, 300);
    };

    const sendHeart = () => {
        const id = Date.now() + Math.random();
        setHearts((h) => [...h.slice(-14), id]);
        setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1600);
        // Preview mode / owner self-love: animate locally only, never touch
        // the counter. The recipient's love is the social proof we later show
        // the creator, so it must not include the creator's own taps.
        if (previewMode || isViewerPreview || isViewerParam() || checkIsOwner(page.id, preview)) return;
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

    // The proof moment: only the creator sees it, only after the recipient has
    // actually sent love, and only while the card is still free. Never shown
    // to viewers (they should see a clean surprise, not an upsell).
    const showProofBanner = isOwner && !isViewerPreview && !page.isVip && heartCount > 0 && !proofDismissed;

    useEffect(() => {
        if (!opened || !showProofBanner || proofShownRef.current) return;
        proofShownRef.current = true;
        track('proof_upsell_shown');
    }, [opened, showProofBanner]);

    const dismissProof = () => {
        setProofDismissed(true);
        try { localStorage.setItem(`bgen-proof-dismissed-${page.id}`, '1'); } catch { }
    };

    const openProofUpsell = () => {
        track('proof_upsell_click');
        openVip();
    };

    return (
        <div className="relative">
            <CelebrationBackground theme={page.theme} density={opened ? 'normal' : 'light'} />
            {page.isVipPro && (
                <ProAtmosphere variant={page.theme === 'aurora' ? 'aurora' : 'holo'} />
            )}

            {/* Preview mode banner — detected client-side from ?preview=1 so the
                page itself stays statically cacheable (ISR). */}
            {previewMode && (
                <p className="mb-4 text-center text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 rounded-full px-4 py-2">
                    👀 Preview mode: views & reactions are paused.{' '}
                    <a href={`/b/${page.id}`} className="underline">Exit preview</a>
                </p>
            )}

            {/* Creator guidance banner: strictly visible to creator holding ownership */}
            {isOwner && showCreatorNotice && (
                <div
                    role="region"
                    aria-label="Creator view notice"
                    className="mb-6 rounded-2xl p-4 sm:p-5 border-2 border-purple-400/50 relative pop-in shadow-2xl bg-[#140b27] text-white"
                    style={{ backgroundColor: '#140b27', color: '#ffffff' }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-600/40 border border-purple-400/60 flex items-center justify-center shrink-0 mt-0.5">
                                {page.isVip ? <Crown className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-purple-300" />}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-white text-xs sm:text-sm">
                                        {page.isVip ? '👑 VIP Creator Mode' : '👀 Creator Mode'}
                                    </span>
                                    <span className="text-[10px] font-extrabold bg-purple-900/90 text-purple-100 border border-purple-400/60 px-2.5 py-0.5 rounded-full">
                                        Only visible to you on this device
                                    </span>
                                </div>
                                <p className="text-purple-100 text-xs leading-relaxed">
                                    <strong>{page.recipientName}</strong> will see a clean, sparkling surprise with <strong>zero edit or upgrade buttons</strong>. You can test this in an <strong>Incognito window</strong> or click below to preview.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCreatorNotice(false)}
                            className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/15 transition-colors shrink-0 cursor-pointer"
                            aria-label="Dismiss creator view notice"
                            title="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                            {page.isVip ? (
                                <button
                                    type="button"
                                    onClick={() => setCustomizerOpen(true)}
                                    className="inline-flex items-center gap-1.5 font-extrabold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                                >
                                    <Palette className="w-3.5 h-3.5" />
                                    <span>Customize look & sound</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openVip()}
                                    className="inline-flex items-center gap-1.5 font-black text-gray-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 px-3.5 py-1.5 rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    <Crown className="w-3.5 h-3.5 text-gray-950" />
                                    <span>Upgrade to VIP ({vipPrice.label})</span>
                                </button>
                            )}
                            <a
                                href={`/b/${page.id}?viewer=1`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-white hover:text-amber-200 font-bold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                                title="Open clean recipient view in new tab (or test in Incognito window)"
                            >
                                <Eye className="w-3.5 h-3.5 text-purple-300" />
                                <span>See Recipient View ↗</span>
                            </a>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all cursor-pointer"
                        >
                            {copiedNotice ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedNotice ? 'Link Copied!' : `Copy Link for ${page.recipientName}`}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Gift gate */}
            {!opened && (
                <div className="relative z-10 min-h-[62vh] flex flex-col items-center justify-center text-center px-6 py-14">
                    <div className="pop-in max-w-md w-full theme-card rounded-3xl p-8 sm:p-10">
                        {page.isVipPro ? (
                            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-gray-950 bg-gradient-to-r from-sky-300 via-amber-200 to-pink-300 px-3.5 py-1 rounded-full mb-3 border border-amber-300 shadow-md">
                                💎 VIP Birthday Surprise
                            </p>
                        ) : page.isVip ? (
                            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-amber-950 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 px-3.5 py-1 rounded-full mb-3 border border-amber-400 shadow-md">
                                👑 VIP Birthday Surprise
                            </p>
                        ) : (
                            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70 mb-3">You&apos;ve got a surprise</p>
                        )}
                        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Hey {page.recipientName}! 🎁
                        </h1>
                        <p className="text-sm opacity-75 mb-6">
                            Someone made something special for you. Tap the gift to open it.
                            {page.senderName ? <><br />With love, <strong>{page.senderName}</strong></> : null}
                        </p>
                        <button
                            onClick={handleOpen}
                            className={cn(
                                "gift-wiggle mx-auto w-28 h-28 rounded-3xl theme-gift-box flex items-center justify-center text-white hover:scale-105 transition-all focus:outline-none focus:ring-4 cursor-pointer",
                                page.isVipPro ? "pro-conic-ring ring-4 ring-sky-300/70" : page.isVip ? "vip-pulse-ring ring-4 ring-amber-300/80" : "focus:ring-purple-300"
                            )}
                            aria-label={`Open birthday surprise for ${page.recipientName}`}
                        >
                            <Gift className="w-14 h-14 drop-shadow-md" aria-hidden="true" />
                        </button>
                        <p className="mt-5 text-xs font-semibold opacity-70 animate-pulse">👆 Tap the gift box to open your surprise</p>
                    </div>
                </div>
            )}

            {/* Revealed celebration */}
            {opened && (
                <div className="relative z-10">
                    <header className="text-center mb-8 space-y-4 pop-in">
                        {page.isVipPro ? (
                            <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-sky-300 via-amber-200 to-pink-300 text-gray-950 border border-amber-300 rounded-full px-4 py-1.5 shadow-md">
                                <span>💎</span> VIP Birthday Surprise
                            </p>
                        ) : page.isVip ? (
                            <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 text-amber-950 border border-amber-400 rounded-full px-4 py-1.5 shadow-md">
                                <span>👑</span> VIP Birthday Surprise
                            </p>
                        ) : (
                            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-white/60 border border-white/50 rounded-full px-4 py-1 text-gray-800">
                                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                <span>A Birthday Surprise</span>
                            </p>
                        )}
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            Happy Birthday
                        </h1>
                        <h2 className={`text-4xl md:text-6xl font-extrabold min-h-[1.2em] ${page.isVipPro ? 'pro-shimmer-text' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 animated-gradient-text'}`}>
                            {typedName}<span className="animate-pulse">|</span>
                        </h2>
                        {page.message && (
                            <blockquote className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed italic border-l-4 border-amber-400 pl-4 py-3 my-6 theme-card rounded-2xl text-left sm:text-center sm:border-l-0 sm:border-t-4 sm:pt-4 sm:pl-0">
                                &ldquo;{page.message}&rdquo;
                            </blockquote>
                        )}
                        {page.senderName && (
                            <p className="text-sm font-semibold opacity-80">With all my love, {page.senderName} 💜</p>
                        )}
                        {viewCount > 0 && (
                            <p className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/40 border border-white/30 rounded-full px-3 py-1 opacity-80">
                                👁 {viewCount} {viewCount === 1 ? 'view' : 'views'} of this surprise
                            </p>
                        )}
                    </header>

                    <div className="mb-14 theme-card rounded-3xl p-4 sm:p-8 pop-in">
                        <CandleBlower age={page.age} recipientName={page.recipientName} />
                    </div>

                    {photos?.length > 0 && (
                        <section className="mb-14 space-y-5" aria-label="Photo Memories">
                            <h3 className="text-2xl font-bold text-center opacity-90">Cherished Memories 📸</h3>
                            {gallery}
                        </section>
                    )}

                    {/* VIP keepsake: the export that makes the ₹29 feel earned */}
                    {(page.isVip || page.isVipPro) && (
                        <section className="mb-14" aria-label="VIP keepsake card">
                            <h3 className="text-2xl font-bold text-center opacity-90 mb-2">VIP Keepsake 🖼️</h3>
                            <p className="text-center text-sm opacity-75 mb-6 max-w-md mx-auto">
                                A film-style image of this exact moment. Save it as {page.recipientName}&apos;s
                                wallpaper, or send it back with your thank-you.
                            </p>
                            <KeepsakeCard
                                to={page.recipientName || 'You'}
                                from={page.senderName || 'Someone who loves you'}
                                photoUrl={photos?.[0]?.url || (typeof photos?.[0] === 'string' ? photos[0] : null)}
                                dedication={page.message || ''}
                                occasionLabel="A Birthday Surprise"
                                theme={page.theme === 'aurora' ? 'aurora' : /rose|pink|love/.test(String(page.theme || '')) ? 'rose' : 'gold'}
                                unlocked
                            />
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
                        <p className="text-xs opacity-60 mt-2">
                            {isOwner && !isViewerPreview ? (
                                <>Only {page.recipientName}&apos;s own taps add to the public count. Open the plain card link in Incognito to test the love flow.</>
                            ) : isViewerPreview || previewMode ? (
                                <>Reactions are paused in this preview. Open the plain card link in Incognito to test them.</>
                            ) : (
                                <>Tap to shower {page.recipientName} with love</>
                            )}
                        </p>
                    </div>

                    {/* Proof-moment upsell: only the creator sees real love
                        from the recipient, and only while the card is free. */}
                    {showProofBanner && (
                        <section
                            aria-label="VIP upgrade suggestion"
                            className="mb-10 rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-50 via-white to-pink-50 p-4 sm:p-5 text-left shadow-lg pop-in"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center text-lg shrink-0 shadow-md">
                                    💜
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base font-extrabold text-gray-900">
                                        {heartCount} {heartCount === 1 ? 'person has' : 'people have'} sent love to {page.recipientName}&apos;s card
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                                        That&apos;s the moment worth keeping. Add the golden crown, VIP themes, and the keepsake image they can save forever.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={openProofUpsell}
                                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-gray-950 shadow-md hover:brightness-105 active:scale-[0.99] transition-all"
                                    >
                                        <Crown className="w-4 h-4" aria-hidden="true" />
                                        Make it unforgettable · {vipPrice.label}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={dismissProof}
                                    aria-label="Dismiss upgrade suggestion"
                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                        </section>
                    )}

                    {shareSlot}
                </div>
            )}

            {/* Discreet floating owner bar: strictly visible to the creator who holds ownership */}
            {isOwner && !isViewerPreview && (
                <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-bold bg-gray-950/90 text-purple-200 border border-purple-400/30 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5 text-purple-300" /> Creator Tools (Only You See This)
                    </span>
                    <div className="relative flex items-center gap-2">
                        {/* Post-VIP customize hint tooltip */}
                        {showCustomizeHint && page.isVip && (
                            <div className="absolute bottom-full left-0 mb-2 z-50 pointer-events-none">
                                <div className="relative bg-amber-400 text-gray-950 text-xs font-extrabold px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap animate-bounce">
                                    🎨 Tap here to customize your card!
                                    {/* Arrow pointing down */}
                                    <span className="absolute top-full left-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-amber-400" />
                                </div>
                            </div>
                        )}
                        {page.isVip ? (
                            <button
                                type="button"
                                onClick={() => setCustomizerOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gray-900/90 hover:bg-gray-800 text-white backdrop-blur-md shadow-2xl border border-white/20 text-xs font-bold cursor-pointer transition-all hover:scale-105"
                                title="Customize card look and sound (VIP Owner Only)"
                            >
                                <Palette className="w-4 h-4 text-amber-400" />
                                <span>Customize</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => openVip()}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-gray-950 shadow-2xl text-xs font-extrabold cursor-pointer transition-all hover:scale-105 border border-amber-300"
                                title="Upgrade card to VIP"
                            >
                                <Crown className="w-4 h-4 text-gray-950" />
                                <span>Upgrade to VIP ({vipPrice.label})</span>
                            </button>
                        )}
                        <a
                            href={`/b/${page.id}?viewer=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gray-950/90 hover:bg-gray-900 text-purple-200 hover:text-white backdrop-blur-md shadow-2xl border border-purple-400/30 text-xs font-bold cursor-pointer transition-all hover:scale-105"
                            title="See the recipient view. To test the love count, open the plain card link in Incognito."
                        >
                            <Eye className="w-3.5 h-3.5 text-purple-300" />
                            <span className="hidden sm:inline">Recipient View ↗</span>
                            <span className="sm:hidden">Preview ↗</span>
                        </a>
                    </div>
                </div>
            )}

            {/* Fixed-position player: mounted from page load so it can catch
                the synchronous gift-open gesture and start music reliably */}
            {audioSlot}

            <VipCustomizerModal
                isOpen={customizerOpen}
                onClose={() => setCustomizerOpen(false)}
                page={page}
            />

            <PostCreationModal
                isOpen={vipModalOpen}
                onClose={handleCloseVipModal}
                card={page}
            />
        </div>
    );
}
