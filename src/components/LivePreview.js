'use client';

import React from 'react';

export default function LivePreview({ data }) {
    const { recipientName, relationship, message, theme, photos, age, senderName, music } = data;
    const musicLabel = { classic: '🎂 Classic song', musicbox: '🎠 Music box', party: '🎉 Party pop', off: '🔇 Silent' }[music || 'classic'];

    return (
        <div className="sticky top-8 hidden lg:block w-full max-w-md mx-auto">
            <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 aspect-[9/19] overflow-hidden relative">
                {/* Phone Frame Content */}
                <div className="absolute top-0 left-0 w-full h-full bg-white overflow-y-auto no-scrollbar" data-theme={theme}>
                    <div className="min-h-full flex flex-col items-center p-6 text-center transition-colors duration-500 relative"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-body)'
                        }}
                    >
                        <span className="absolute top-14 left-4 text-xl balloon-float" aria-hidden="true">🎈</span>
                        <span className="absolute top-20 right-4 text-lg balloon-float" style={{ animationDelay: '1s' }} aria-hidden="true">✨</span>

                        <div className="mt-10 mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">🎁 Tap to open</p>
                            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                                Happy Birthday
                            </h1>
                            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                {recipientName || 'Name'}!
                            </h2>
                            {age ? (
                                <span className="inline-block mt-2 text-[11px] font-bold bg-white/70 border border-white/60 rounded-full px-2.5 py-1 shadow-sm">
                                    Turning {age} 🎂
                                </span>
                            ) : null}
                        </div>

                        {photos && photos.length > 0 ? (
                            <div className="w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg">
                                <img src={photos[0]} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-full aspect-square mb-4 rounded-xl bg-black/5 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                                <span className="text-2xl">📸</span> Your photo here
                            </div>
                        )}

                        <p className="text-sm opacity-80 mb-2 line-clamp-4">
                            {message || 'Your message will appear here...'}
                        </p>
                        {senderName ? <p className="text-[11px] font-semibold opacity-60 mb-4">— {senderName} 💜</p> : <div className="mb-4" />}

                        <div className="mt-auto mb-6 w-full">
                            <div className="text-4xl animate-bounce">🎂</div>
                            <p className="text-[11px] mt-1 opacity-60 font-semibold">They blow the candles 🎤</p>
                            <p className="text-[10px] mt-1 opacity-50">{relationship ? `For your ${relationship} • ` : ''}{musicLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-gray-800 rounded-b-xl z-20" />
            </div>
            <p className="text-center text-gray-500 mt-4 text-sm">Live preview — exactly what they&apos;ll feel ✨</p>
        </div>
    );
}
