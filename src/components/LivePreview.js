'use client';

import React, { useState } from 'react';
import CinemaTeaserCard from './premium/CinemaTeaserCard';
import { Sparkles, Smartphone, ArrowRight } from 'lucide-react';

export default function LivePreview({ data }) {
    const [previewTab, setPreviewTab] = useState('free'); // 'free' | 'cinema'
    const { recipientName, relationship, message, theme, photos, age, senderName, music } = data;
    const musicLabel = { classic: '🎂 Classic song', musicbox: '🎠 Music box', party: '🎉 Party pop', off: '🔇 Silent' }[music || 'classic'];

    const coverSrc = photos && photos.length > 0
        ? (typeof photos[0] === 'string' ? photos[0] : photos[0]?.preview)
        : null;

    return (
        <div className="sticky top-6 hidden lg:flex lg:flex-col gap-3 w-full max-w-md mx-auto">
            {/* ── View Switcher Tabs ─────────────────── */}
            <div className="bg-gray-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-800 flex items-center shadow-lg">
                <button
                    type="button"
                    onClick={() => setPreviewTab('free')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'free'
                            ? 'bg-white text-gray-900 shadow-md'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Free Card</span>
                </button>
                <button
                    type="button"
                    onClick={() => setPreviewTab('cinema')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        previewTab === 'cinema'
                            ? 'bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] shadow-md'
                            : 'text-[#f7dc9a] hover:text-white'
                    }`}
                >
                    <Sparkles className="w-3.5 h-3.5 text-[#f2c14e]" />
                    <span>⚡ Instant Cinema</span>
                    <span className="text-[10px] opacity-85 font-black">₹49</span>
                </button>
            </div>

            {/* ── Tab Content ────────────────────────── */}
            {previewTab === 'free' ? (
                <div>
                    <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl border-8 border-gray-800 aspect-[9/18] overflow-hidden relative max-h-[640px]">
                        {/* Phone Frame Content */}
                        <div className="absolute top-0 left-0 w-full h-full bg-white overflow-y-auto no-scrollbar" data-theme={theme}>
                            <div
                                className="min-h-full flex flex-col items-center p-5 text-center transition-colors duration-500 relative"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                <span className="absolute top-10 left-3 text-lg balloon-float" aria-hidden="true">🎈</span>
                                <span className="absolute top-14 right-3 text-base balloon-float" style={{ animationDelay: '1s' }} aria-hidden="true">✨</span>

                                <div className="mt-8 mb-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">🎁 Tap to open</p>
                                    <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                                        Happy Birthday
                                    </h1>
                                    <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                        {recipientName || 'Name'}!
                                    </h2>
                                    {age ? (
                                        <span className="inline-block mt-1.5 text-[10px] font-bold bg-white/70 border border-white/60 rounded-full px-2.5 py-0.5 shadow-sm">
                                            Turning {age} 🎂
                                        </span>
                                    ) : null}
                                </div>

                                {coverSrc ? (
                                    <div className="w-full aspect-square max-w-[200px] mb-3 rounded-xl overflow-hidden shadow-md mx-auto">
                                        <img src={coverSrc} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-full aspect-square max-w-[200px] mb-3 rounded-xl bg-black/5 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-xs gap-1 mx-auto">
                                        <span className="text-2xl">📸</span> Your photo here
                                    </div>
                                )}

                                <p className="text-xs opacity-80 mb-2 line-clamp-3">
                                    {message || 'Your message will appear here...'}
                                </p>
                                {senderName
                                    ? <p className="text-[11px] font-semibold opacity-60 mb-3">— {senderName} 💜</p>
                                    : <div className="mb-3" />
                                }

                                <div className="mt-auto mb-4 w-full">
                                    <div className="text-3xl animate-bounce">🎂</div>
                                    <p className="text-[11px] mt-1 opacity-60 font-semibold">They blow the candles 🎤</p>
                                    <p className="text-[10px] mt-0.5 opacity-50">{relationship ? `For your ${relationship} • ` : ''}{musicLabel}</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-5 bg-gray-800 rounded-b-xl z-20" />
                    </div>

                    {/* Switch to Cinema Callout */}
                    <button
                        type="button"
                        onClick={() => setPreviewTab('cinema')}
                        className="mt-3 w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#1b0d2d] to-[#0d0719] border border-[#f2c14e]/30 text-left hover:border-[#f2c14e]/60 transition-all cursor-pointer group shadow-sm"
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-[#f2c14e]/20 border border-[#f2c14e]/40 flex items-center justify-center text-base">
                                ✨
                            </span>
                            <div>
                                <p className="text-xs font-extrabold text-[#f7dc9a]">Preview as Instant Cinema</p>
                                <p className="text-[10px] text-[#c0b3d8]">Starlit memory art, wax seal & 3D tilt</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#f2c14e] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    <CinemaTeaserCard
                        recipientName={recipientName}
                        senderName={senderName}
                        relationship={relationship}
                        photoSrc={coverSrc}
                        compact
                    />
                </div>
            )}
        </div>
    );
}
