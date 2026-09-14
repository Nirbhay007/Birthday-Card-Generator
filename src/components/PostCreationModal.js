'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, Check, Copy, Sparkles, ArrowRight, X, Eye } from 'lucide-react';
import { detectRegion, getVipCardPrice, createPremiumOrder, openRazorpayCheckout, verifyPremiumPayment } from '@/lib/payments';

export default function PostCreationModal({
    isOpen,
    onClose,
    card, // { id, recipientName, senderName, theme, music, photosCount }
}) {
    const [copied, setCopied] = useState(false);
    const [region] = useState(() => (typeof window !== 'undefined' ? detectRegion() : 'IN'));
    const [status, setStatus] = useState({ phase: 'idle', message: '' });
    const [upgraded, setUpgraded] = useState(false);
    const isVip = upgraded || !!card?.isVip;

    useEffect(() => {
        if (!isOpen || !card) return;

        // Celebratory confetti burst on open
        try {
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                disableForReducedMotion: true,
            });
        } catch {}
    }, [isOpen, card]);

    if (!isOpen || !card) return null;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://birthday.nirbhay.online';
    const cardUrl = `${baseUrl}/b/${card.id}`;
    const price = getVipCardPrice(region);

    const shareText = `Hey ${card.recipientName || 'there'}! 🎂 I made something special for your birthday. Open this on your phone: ${cardUrl} ✨`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(cardUrl);
        } catch {
            const el = document.createElement('textarea');
            el.value = cardUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleUpgrade = async () => {
        setStatus({ phase: 'loading', message: 'Connecting to checkout…' });
        try {
            const order = await createPremiumOrder(region, { tier: 'card_vip', pageId: card.id });
            setStatus({ phase: 'checkout', message: 'Opening secure checkout…' });

            const resp = await openRazorpayCheckout({
                order,
                keyId: order.keyId,
                buyerName: card.senderName || '',
                region,
            });

            setStatus({ phase: 'verifying', message: 'Activating your VIP surprise…' });

            await verifyPremiumPayment({
                provider: 'razorpay',
                orderId: resp.razorpay_order_id,
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
                pageId: card.id,
            });

            setUpgraded(true);
            try { localStorage.setItem(`bgen_owner_${card.id}`, '1'); } catch {}
            setStatus({ phase: 'success', message: 'VIP Activated!' });

            // Hot-switch audio to creator's chosen VIP soundtrack immediately
            try {
                const premiumTrack = card.originalMusic || card.music || 'strings';
                window.dispatchEvent(new CustomEvent('bgen:vip_activated', { detail: { track: premiumTrack } }));
            } catch {}

            try {
                confetti({
                    particleCount: 200,
                    spread: 90,
                    origin: { y: 0.5 },
                    colors: ['#f2c14e', '#fb7185', '#a855f7', '#ffd700'],
                    disableForReducedMotion: true,
                });
            } catch {}
        } catch (e) {
            if (e?.code === 'TEST_MODE') {
                // In dev test mode, simulate activation
                try {
                    await verifyPremiumPayment({ provider: 'test', pageId: card.id });
                    setUpgraded(true);
                    setStatus({ phase: 'success', message: 'VIP Activated in Test Mode!' });
                    try {
                        const premiumTrack = card.originalMusic || card.music || 'strings';
                        window.dispatchEvent(new CustomEvent('bgen:vip_activated', { detail: { track: premiumTrack } }));
                    } catch {}
                } catch {
                    setStatus({ phase: 'error', message: 'Test activation failed.' });
                }
            } else {
                setStatus({ phase: 'error', message: e?.message || 'Payment cancelled.' });
            }
        }
    };

    const handleViewCard = () => {
        if (upgraded) {
            window.location.href = `/b/${card.id}?vip=1&fresh=${Date.now()}`;
            return;
        }
        if (onClose) {
            onClose();
        } else {
            window.location.href = `/b/${card.id}`;
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
        >
            <div className="relative w-full max-w-lg bg-gradient-to-b from-[#190e2b] via-[#120a21] to-[#0a0514] text-white border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[92vh] overflow-y-auto">
                {/* Background decorative glow */}
                <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                {/* Close button */}
                <button
                    type="button"
                    onClick={handleViewCard}
                    className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center pt-2 pb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 shadow-lg mb-3">
                        <Sparkles className="w-7 h-7 text-gray-950 animate-pulse" />
                    </div>
                    <h2 id="success-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        Surprise is Ready! 🎉
                    </h2>
                    <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
                        Personalized birthday card for <strong className="text-amber-300 font-bold">{card.recipientName}</strong>
                    </p>
                </div>

                {/* Link & WhatsApp Share Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80">
                        1. Share with {card.recipientName}
                    </p>
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono select-all overflow-x-auto">
                        <span className="truncate flex-1">{cardUrl}</span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                    >
                        <span>📲 Share to WhatsApp</span>
                    </a>

                    {/* Creator reassurance notice */}
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-400/20 flex items-start gap-2 text-xs text-purple-200/90 leading-relaxed">
                        <Eye className="w-3.5 h-3.5 text-purple-300 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <div>
                                <span className="font-bold text-white">Creator Notice: </span>
                                Editing & customize controls are visible only to you on this device. When <strong>{card.recipientName}</strong> opens this link, they see only the clean, magical birthday card!
                            </div>
                            <div className="pt-1 flex items-center gap-2 flex-wrap">
                                <a
                                    href={`${cardUrl}?viewer=1`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                                >
                                    <span>Preview Recipient View ↗</span>
                                </a>
                                <span className="text-purple-400/70 text-[10px]">• Or test link in Incognito / Private window</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VIP Upgrade Box */}
                <div className="mt-4 p-4 sm:p-5 rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-purple-900/20 to-black/40 relative overflow-hidden">
                    {/* VIP Ribbon badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            {isVip ? 'VIP Active' : 'Special Launch Offer'}
                        </span>
                        {!isVip && (
                            <span className="text-xs text-amber-300/90 font-bold">
                                <s className="opacity-50 text-[10px] mr-1">₹99</s> {price.label}
                            </span>
                        )}
                    </div>

                    {isVip ? (
                        <div className="py-2 text-center space-y-3">
                            <p className="text-base font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
                                <Crown className="w-5 h-5 text-amber-400" /> VIP Activated Successfully!
                            </p>
                            <p className="text-xs text-purple-200/90 leading-relaxed">
                                {card.recipientName}&apos;s card now shines with the Golden Crown, illuminated atmosphere, and clean ad-free keepsake.
                            </p>
                            <div className="p-3 rounded-xl bg-black/40 border border-amber-400/30 text-left space-y-2 text-xs text-amber-200/90">
                                <p className="flex items-start gap-1.5">
                                    <span>🎨</span>
                                    <span><strong>Customize anytime:</strong> Use the floating <em>Customize</em> button on the card to switch themes, music, and photos whenever you wish.</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span>🔗</span>
                                    <span><strong>Share via URL:</strong> Copy the link above to send to {card.recipientName}. They see only the pure birthday surprise.</span>
                                </p>
                                <p className="flex items-start gap-1.5">
                                    <span>🔖</span>
                                    <span><strong>Return anytime:</strong> Bookmark or save this page URL. You have permanent creator access on this browser!</span>
                                </p>
                                <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                                    <span className="text-purple-200">Want to be 100% sure? Open in an <strong>Incognito window</strong>:</span>
                                    <a
                                        href={`${cardUrl}?viewer=1`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 font-extrabold text-amber-300 hover:text-amber-200 bg-amber-400/20 border border-amber-400/40 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Eye className="w-3 h-3 text-amber-300" />
                                        <span>See Recipient View ↗</span>
                                    </a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleViewCard}
                                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-gray-950 font-extrabold text-sm shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Crown className="w-4 h-4 text-gray-950" />
                                <span>🚀 View {card.recipientName}&apos;s VIP Card Now</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">
                                👑 Make it Unforgettable with VIP
                            </h3>
                            <p className="text-xs text-purple-200/80 mb-3 leading-relaxed">
                                Turn this card into a royal keepsake for {card.recipientName} with exclusive VIP perks:
                            </p>

                            <ul className="space-y-1.5 text-xs text-purple-100/90 mb-4">
                                <li className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px]">✓</span>
                                    <span><strong>Golden VIP Crown & Luminous Aura</strong> on {card.recipientName}&apos;s card</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px]">✓</span>
                                    <span><strong>Luminous VIP Theme Atmosphere</strong> (Royal Gold, Cyber Neon, Galaxy, etc.)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px]">✓</span>
                                    <span><strong>VIP Soundtracks</strong> (Starlight Music Box, Royal Strings, Cyber Synth)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px]">✓</span>
                                    <span><strong>Cherished memory gallery</strong> (up to 9 photos)</span>
                                </li>
                            </ul>

                            {status.phase === 'error' && (
                                <p className="text-xs text-rose-400 mb-3 font-medium">{status.message}</p>
                            )}

                            <button
                                type="button"
                                onClick={handleUpgrade}
                                disabled={status.phase === 'loading' || status.phase === 'verifying'}
                                className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-pink-500 text-gray-950 font-extrabold text-sm sm:text-base shadow-[0_8px_30px_rgba(242,193,78,0.3)] hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <Crown className="w-4 h-4 text-gray-950" />
                                <span>{status.phase === 'loading' || status.phase === 'verifying' ? status.message : `Upgrade to VIP · ${price.label}`}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleViewCard}
                                className="w-full mt-2.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 font-semibold text-xs border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <span>✨ Continue with Free Card</span>
                            </button>

                            <p className="text-[10px] text-center text-purple-300/60 mt-2">
                                Instant UPI / Card activation · One-time · No app needed
                            </p>
                        </>
                    )}
                </div>

                {/* Footer secondary action */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/70">
                    <span>Free card is ready & active</span>
                    <button
                        type="button"
                        onClick={handleViewCard}
                        className="inline-flex items-center gap-1 font-bold text-white hover:text-amber-300 transition-colors cursor-pointer"
                    >
                        <span>View Card Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
