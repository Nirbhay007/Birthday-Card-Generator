'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, PartyPopper } from 'lucide-react';
import { CHANGELOG, CHANGELOG_VERSION } from '@/lib/changelog';

const SEEN_KEY = 'birthdaygen-changelog-seen';

/**
 * "What's New" nav entry + changelog modal. Shows an unread dot until the
 * visitor has seen the current CHANGELOG_VERSION (tracked in localStorage).
 * All buttons are type="button" so this is safe inside <form> elements.
 */
export default function WhatsNew() {
    const [open, setOpen] = useState(false);
    const [unseen, setUnseen] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            try {
                if (localStorage.getItem(SEEN_KEY) !== CHANGELOG_VERSION) setUnseen(true);
            } catch {}
        }, 0);
        return () => clearTimeout(t);
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setUnseen(false);
        try { localStorage.setItem(SEEN_KEY, CHANGELOG_VERSION); } catch {}
    };

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                className="relative inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors cursor-pointer"
                aria-label="See what's new in BirthdayGen"
            >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">What&apos;s New</span>
                {unseen && (
                    <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" aria-label="New updates available" />
                )}
            </button>

            {open && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pop-in"
                    onClick={() => setOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="What's new in BirthdayGen"
                >
                    <div
                        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[85vh] overflow-y-auto text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                            aria-label="Close what's new dialog"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                            <PartyPopper className="w-5 h-5 text-purple-600" /> What&apos;s New
                        </h2>
                        <p className="text-sm text-gray-600 mb-5">Fresh out of the oven — free as always.</p>

                        <div className="space-y-5">
                            {CHANGELOG.map((entry) => (
                                <div key={entry.title} className="border-l-4 border-purple-200 pl-4">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-purple-600">{entry.date}</p>
                                    <p className="font-bold text-gray-900 text-sm mb-1.5">{entry.title}</p>
                                    <ul className="space-y-1">
                                        {entry.items.map((item) => (
                                            <li key={item} className="text-sm text-gray-600 flex gap-2">
                                                <span className="text-green-500 font-bold" aria-hidden="true">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
