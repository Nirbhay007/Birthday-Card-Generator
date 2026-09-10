'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send, Twitter, Facebook } from 'lucide-react';

function isPreviewUrl() {
    try {
        const q = new URLSearchParams(window.location.search);
        if (!q.has('preview')) return false;
        const v = (q.get('preview') || '').toLowerCase();
        return v === '' || v === '1' || v === 'true' || v === 'yes' || v === 'on';
    } catch {
        return false;
    }
}

export default function ShareButtons({ title, text, pageId }) {
    const [copied, setCopied] = useState(false);

    // Share the canonical URL: strip the preview flag and map localhost to public URL
    const getUrl = () => {
        if (typeof window === 'undefined') return '';
        try {
            const u = new URL(window.location.href);
            u.searchParams.delete('preview');
            // When testing locally, use the public domain so WhatsApp scraper can fetch previews & friends can open it
            if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
                const prodBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';
                return new URL(u.pathname + u.search + u.hash, prodBase).toString();
            }
            return u.toString();
        } catch {
            return window.location.href;
        }
    };
    const shareText = text || 'Open this on your phone and blow out the candles! ✨';

    // Fire-and-forget share counter for future growth analytics.
    // Skipped in preview mode so owner testing never inflates counts.
    const trackShare = () => {
        if (!pageId) return;
        try {
            if (isPreviewUrl()) return;
            fetch(`/api/birthday/${pageId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'share' }),
            }).catch(() => {});
        } catch {}
    };

    const handleCopy = async () => {
        trackShare();
        if (typeof window !== 'undefined') {
            try {
                await navigator?.clipboard?.writeText(getUrl());
            } catch {
                const ta = document.createElement('textarea');
                ta.value = getUrl();
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const url = getUrl();
    const cleanShareText = (text || 'Open this on your phone and blow out the candles! ✨').replace(/—/g, '-');
    const fullWhatsAppText = `${title ? `${title}\n\n` : ''}${cleanShareText}\n\n${url}`;
    const encodedWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullWhatsAppText)}`;

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title ? `${title} ` : ''}${cleanShareText}`);

    const handleShare = async () => {
        if (typeof window !== 'undefined' && navigator?.share) {
            try {
                await navigator.share({ title: title || 'Happy Birthday! 🎂', text: cleanShareText, url });
                trackShare();
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            handleCopy();
        }
    };

    const openPopup = (url) => {
        trackShare();
        if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer,width=600,height=540');
    };

    return (
        <div className="mt-6">
            <div className="flex flex-wrap justify-center gap-2.5">
                <button
                    onClick={() => openPopup(encodedWhatsAppUrl)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-200 cursor-pointer"
                    aria-label="Share on WhatsApp"
                >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
                </button>
                <button
                    onClick={() => openPopup(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#229ED9] text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-200 cursor-pointer"
                    aria-label="Share on Telegram"
                >
                    <Send className="w-4 h-4" aria-hidden="true" /> Telegram
                </button>
                <button
                    onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1877F2] text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer"
                    aria-label="Share on Facebook"
                >
                    <Facebook className="w-4 h-4" aria-hidden="true" /> Facebook
                </button>
                <button
                    onClick={() => openPopup(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-gray-300 cursor-pointer"
                    aria-label="Share on X"
                >
                    <Twitter className="w-4 h-4" aria-hidden="true" /> Post
                </button>
            </div>
            <div className="flex justify-center gap-3 mt-3">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-full shadow-md hover:shadow-lg transition-all text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300 border border-gray-100 cursor-pointer"
                    aria-label="Share this birthday page"
                >
                    <Share2 className="w-4 h-4 text-purple-600" aria-hidden="true" />
                    More
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-full shadow-md hover:shadow-lg transition-all text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300 border border-gray-100 cursor-pointer"
                    aria-label={copied ? 'Link copied to clipboard' : 'Copy page link to clipboard'}
                >
                    {copied ? <Check className="w-4 h-4 text-green-600" aria-hidden="true" /> : <Copy className="w-4 h-4 text-indigo-600" aria-hidden="true" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
}
