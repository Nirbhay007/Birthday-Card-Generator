'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send, Twitter, Facebook } from 'lucide-react';
import { trackShare } from '@/lib/shareTracking';

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

    // One share event per channel per browsing session. Preview mode and
    // duplicate clicks are filtered inside trackShare (client + server).
    const recordShare = (channel) => {
        trackShare({ pageId, channel, source: 'card_footer' });
    };

    const handleCopy = async () => {
        if (typeof window === 'undefined') return;
        const shareUrl = getUrl();
        let copiedOk = false;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                copiedOk = true;
            }
        } catch { }
        if (!copiedOk) {
            try {
                const ta = document.createElement('textarea');
                ta.value = shareUrl;
                document.body.appendChild(ta);
                ta.select();
                copiedOk = document.execCommand('copy');
                document.body.removeChild(ta);
            } catch { }
        }
        // Only count a copy that actually landed on the clipboard.
        if (copiedOk) recordShare('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                recordShare('native');
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            handleCopy();
        }
    };

    const openPopup = (targetUrl, channel) => {
        recordShare(channel);
        if (typeof window !== 'undefined') window.open(targetUrl, '_blank', 'noopener,noreferrer,width=600,height=540');
    };

    return (
        <div className="mt-6">
            <div className="flex flex-wrap justify-center gap-2.5">
                <button
                    onClick={() => openPopup(encodedWhatsAppUrl, 'whatsapp')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-green-200 cursor-pointer"
                    aria-label="Share on WhatsApp"
                >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
                </button>
                <button
                    onClick={() => openPopup(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, 'telegram')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#229ED9] text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-200 cursor-pointer"
                    aria-label="Share on Telegram"
                >
                    <Send className="w-4 h-4" aria-hidden="true" /> Telegram
                </button>
                <button
                    onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, 'facebook')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1877F2] text-white rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-200 cursor-pointer"
                    aria-label="Share on Facebook"
                >
                    <Facebook className="w-4 h-4" aria-hidden="true" /> Facebook
                </button>
                <button
                    onClick={() => openPopup(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, 'x')}
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
