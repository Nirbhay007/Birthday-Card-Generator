'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function GlobalAppErrorBoundary({ error, reset }) {
    useEffect(() => {
        try {
            console.error('Application error captured:', error);
            const errKey = `bgen-app-err-${error?.digest || error?.message || 'unknown'}`;
            if (sessionStorage.getItem(errKey)) return;
            sessionStorage.setItem(errKey, '1');

            fetch('/api/alerts/client-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: error?.message || 'Application rendering failed',
                    digest: error?.digest,
                    stack: error?.stack,
                    url: typeof window !== 'undefined' ? window.location.href : '',
                }),
                keepalive: true,
            }).catch(() => { });
        } catch { }
    }, [error]);

    return (
        <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full bg-stone-900/90 border border-stone-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5 text-3xl">
                    ✨
                </div>
                <h1 className="text-xl font-black text-white mb-2">Something went wrong</h1>
                <p className="text-sm text-stone-400 mb-6 leading-relaxed">
                    A temporary error occurred. Our team has been notified.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        type="button"
                        onClick={() => (typeof reset === 'function' ? reset() : window.location.reload())}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Try again</span>
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-sm transition-all"
                    >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}

