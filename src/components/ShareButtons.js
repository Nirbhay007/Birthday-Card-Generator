'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

export default function ShareButtons({ title }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (typeof window !== 'undefined') {
            navigator?.clipboard?.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (typeof window !== 'undefined' && navigator?.share) {
            try {
                await navigator.share({
                    title: title || 'Happy Birthday!',
                    text: 'Check out this personalized birthday surprise page!',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            handleCopy();
        }
    };

    return (
        <div className="flex justify-center gap-4 mt-8">
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full shadow-md hover:shadow-lg transition-all font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300 border border-gray-100"
                aria-label="Share this birthday page"
            >
                <Share2 className="w-5 h-5 text-purple-600" aria-hidden="true" />
                Share Page
            </button>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full shadow-md hover:shadow-lg transition-all font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300 border border-gray-100"
                aria-label={copied ? "Link copied to clipboard" : "Copy page link to clipboard"}
            >
                {copied ? <Check className="w-5 h-5 text-green-600" aria-hidden="true" /> : <Copy className="w-5 h-5 text-indigo-600" aria-hidden="true" />}
                {copied ? 'Copied!' : 'Copy Link'}
            </button>
        </div>
    );
}
