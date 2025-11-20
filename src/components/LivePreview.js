'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function LivePreview({ data }) {
    const { recipientName, message, theme, photos } = data;

    return (
        <div className="sticky top-8 hidden lg:block w-full max-w-md mx-auto">
            <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800 aspect-[9/19] overflow-hidden relative">
                {/* Phone Frame Content */}
                <div className="absolute top-0 left-0 w-full h-full bg-white overflow-y-auto no-scrollbar" data-theme={theme}>
                    <div className="min-h-full flex flex-col items-center p-6 text-center transition-colors duration-500"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-body)'
                        }}
                    >
                        <div className="mt-12 mb-6">
                            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                Happy Birthday
                            </h1>
                            <h2 className="text-2xl font-bold text-purple-600">
                                {recipientName || 'Name'}
                            </h2>
                        </div>

                        {photos && photos.length > 0 ? (
                            <div className="w-full aspect-square mb-6 rounded-xl overflow-hidden shadow-lg">
                                <img src={photos[0]} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-full aspect-square mb-6 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                No Photo
                            </div>
                        )}

                        <p className="text-sm opacity-80 mb-8">
                            {message || 'Your message will appear here...'}
                        </p>

                        <div className="mt-auto mb-8 w-full">
                            <div className="w-12 h-12 mx-auto rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                                🎂
                            </div>
                            <p className="text-xs mt-2 opacity-60">Blow the candles!</p>
                        </div>
                    </div>
                </div>

                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-gray-800 rounded-b-xl z-20" />
            </div>
            <p className="text-center text-gray-500 mt-4 text-sm">Live Mobile Preview</p>
        </div>
    );
}
