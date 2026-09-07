'use client';

import { MessageCircleHeart, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const NUMBER = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '').replace(/\D/g, '');
const NAME = process.env.NEXT_PUBLIC_SUPPORT_NAME || 'BirthdayGen';

function waLink(text) {
    return `https://wa.me/${NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Warm safety net under the paywall: lost links, failed payments, doubts.
 * Set NEXT_PUBLIC_SUPPORT_WHATSAPP=9198XXXXXXXX (+ optional
 * NEXT_PUBLIC_SUPPORT_NAME) to enable the button; without it, honest
 * guidance renders instead of a dead button.
 */
export default function SupportCard({ compact = false }) {
    const [copied, setCopied] = useState(false);

    const copyNumber = async () => {
        try {
            await navigator.clipboard.writeText(`+${NUMBER}`);
        } catch {
            try {
                const ta = document.createElement('textarea');
                ta.value = `+${NUMBER}`;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            } catch {}
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (compact) {
        return (
            <p className="text-[11px] text-[#6d6486]">
                Lost this link later? Do not worry, we have got your back.{' '}
                {NUMBER ? (
                    <a
                        href={waLink('Hi! I need help with my Premium Universe link.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted underline-offset-2 hover:text-white"
                    >
                        WhatsApp us anytime
                    </a>
                ) : (
                    'Keep your payment screenshot safe and we will sort you out.'
                )}
            </p>
        );
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 text-center">
            <p className="inline-flex items-center gap-1.5 font-extrabold text-[#f7dc9a] mb-1.5">
                <MessageCircleHeart className="w-5 h-5 text-[#fb7185]" aria-hidden="true" />
                Lost your link? Do not worry, we have got your back.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-[#b9aed4] max-w-md mx-auto">
                Paid already and the universe will not open? Facing any issue or just have doubts?
                Message us on WhatsApp with your payment screenshot. A human (running on chai)
                will sort you out, usually within a day.
            </p>
            {NUMBER ? (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <a
                        href={waLink('Hi! I need help with my Premium Universe payment/link.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-sm font-extrabold shadow-lg hover:brightness-105 transition-all"
                    >
                        <MessageCircleHeart className="w-4 h-4" aria-hidden="true" />
                        Chat on WhatsApp
                    </a>
                    <button
                        type="button"
                        onClick={copyNumber}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#b9aed4] hover:text-white transition-colors"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#7ee2a8]" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                        {copied ? 'Copied!' : `+${NUMBER}`}
                    </button>
                </div>
            ) : (
                <p className="mt-3 text-xs text-[#6d6486]">
                    Tip from {NAME}: save your magic link in your notes app the moment you get it. It never expires.
                </p>
            )}
        </div>
    );
}
