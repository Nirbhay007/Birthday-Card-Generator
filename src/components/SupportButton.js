'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HeartHandshake, Copy, Check, X, Smartphone, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPI_ID, SUPPORT_AMOUNTS, buildUpiUrl, upiQrUrl } from '@/lib/support.mjs';

/**
 * Donate trigger + modal. Giver-facing pages ONLY — never rendered on the
 * recipient's surprise page, so the emotional moment stays untouched.
 * All buttons are type="button" so this is safe inside <form> elements.
 */
export default function SupportButton({ variant = 'pill' }) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(99);
    const [custom, setCustom] = useState('');
    const [copied, setCopied] = useState(false);

    const customNum = custom ? parseInt(custom, 10) : NaN;
    const effective = Number.isFinite(customNum) ? customNum : amount;
    const validAmount = Number.isFinite(effective) && effective >= 1 && effective <= 100000 ? Math.trunc(effective) : null;
    const upiUrl = buildUpiUrl(UPI_ID, validAmount);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    const copyId = async () => {
        try {
            await navigator.clipboard.writeText(UPI_ID);
        } catch {
            try {
                const ta = document.createElement('textarea');
                ta.value = UPI_ID;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            } catch {}
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {variant === 'pill' && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm transition-all shadow-sm hover:shadow-md cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-200"
                >
                    <HeartHandshake className="w-4 h-4" /> Support BirthdayGen
                </button>
            )}
            {variant === 'link' && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="underline decoration-dotted underline-offset-4 hover:opacity-80 transition-opacity cursor-pointer"
                >
                    Support BirthdayGen ❤️
                </button>
            )}
            {variant === 'inline' && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                >
                    chip in to keep it free ❤️
                </button>
            )}

            {open && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pop-in"
                    onClick={() => setOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Support BirthdayGen"
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-2xl relative text-center max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                            aria-label="Close support dialog"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-4xl mb-2" aria-hidden="true">🎂</div>
                        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Keep the candles lit</h2>
                        <p className="text-sm text-gray-600 mb-5">
                            BirthdayGen is free and always will be. Your support keeps it running for thousands of birthdays. Thank you! 💜
                        </p>

                        <div className="flex gap-2 justify-center mb-3" role="radiogroup" aria-label="Donation amount in rupees">
                            {SUPPORT_AMOUNTS.map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    role="radio"
                                    aria-checked={!custom && amount === a}
                                    onClick={() => { setAmount(a); setCustom(''); }}
                                    className={cn(
                                        'flex-1 py-2 rounded-xl font-extrabold text-sm border-2 transition-all cursor-pointer',
                                        !custom && amount === a
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 text-gray-600 hover:border-purple-300'
                                    )}
                                >
                                    ₹{a}
                                </button>
                            ))}
                            <input
                                type="number"
                                min="1"
                                max="100000"
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                                placeholder="Other"
                                aria-label="Custom amount in rupees"
                                className="w-20 px-2 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-900 text-center focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                            />
                        </div>

                        <a
                            href={upiUrl}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Smartphone className="w-5 h-5" />
                            {validAmount ? `Pay ₹${validAmount} via UPI` : 'Pay via UPI'}
                        </a>
                        <p className="text-[11px] text-gray-500 mt-1.5 mb-4">
                            On mobile this opens GPay / PhonePe / Paytm. On desktop, scan below ↓
                        </p>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center justify-center gap-1">
                                <ScanLine className="w-3.5 h-3.5" /> Scan with any UPI app
                            </p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={upiQrUrl(upiUrl)}
                                alt={`UPI QR code to support BirthdayGen${validAmount ? ` with rupees ${validAmount}` : ''}`}
                                width={180}
                                height={180}
                                loading="lazy"
                                className="mx-auto rounded-xl border border-gray-200 bg-white"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={copyId}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-mono text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                            aria-label={copied ? 'UPI ID copied' : 'Copy UPI ID'}
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                            {copied ? 'Copied!' : UPI_ID}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
