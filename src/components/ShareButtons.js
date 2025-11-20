'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

export default function ShareButtons({ title }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: 'Check out this birthday surprise!',
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
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full shadow-md hover:shadow-lg transition-all font-medium"
            >
                <Share2 className="w-5 h-5" />
                Share
            </button>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-full shadow-md hover:shadow-lg transition-all font-medium"
            >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Link'}
            </button>
        </div>
    );
}
