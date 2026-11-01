'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, Send, Check, Sparkles } from 'lucide-react';

const EMOJIS = ['🎂', '💜', '🎉', '🥳', '🌟', '😂', '🙌', '💐'];

export default function GroupWishForm({ pageId, recipientName = '' }) {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [emoji, setEmoji] = useState('');
    const [status, setStatus] = useState({ phase: 'idle', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const cleanName = name.trim();
        const cleanMessage = message.trim();
        if (!cleanName) {
            setStatus({ phase: 'error', message: 'Add your name so they know who it is from.' });
            return;
        }
        if (!cleanMessage) {
            setStatus({ phase: 'error', message: 'Write a short birthday wish first.' });
            return;
        }

        setStatus({ phase: 'saving', message: 'Adding your wish…' });
        try {
            const res = await fetch('/api/group-wishes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId, name: cleanName, message: cleanMessage, emoji: emoji || null }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) throw new Error(data.error || 'Could not add your wish.');
            setSubmitted(true);
            setStatus({ phase: 'saved', message: 'Your wish is on the wall.' });
            try { window.dispatchEvent(new CustomEvent('bgen:group-wish-added')); } catch { }
        } catch (err) {
            setStatus({ phase: 'error', message: err?.message || 'Could not add your wish. Please try again.' });
        }
    };

    if (submitted) {
        return (
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-8 text-center shadow-lg">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Check className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-gray-900">Wish added 💜</h2>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                    {recipientName ? `${recipientName} will see it` : 'They will see it'} on the group card, alongside everyone else&apos;s.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <Link
                        href={`/b/${pageId}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-extrabold text-white transition-colors"
                    >
                        <Sparkles className="h-4 w-4" aria-hidden="true" /> Open the card
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            setSubmitted(false);
                            setMessage('');
                            setEmoji('');
                            setStatus({ phase: 'idle', message: '' });
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                    >
                        Add another wish
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="rounded-3xl border border-purple-100 bg-white p-5 sm:p-7 shadow-lg">
            <div className="text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                    <Heart className="h-6 w-6" aria-hidden="true" />
                </span>
                <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Add your wish{recipientName ? ` for ${recipientName}` : ''}
                </h1>
                <p className="mt-1.5 text-sm text-gray-600">
                    Everyone&apos;s messages go on one card. Keep it warm, funny, or both.
                </p>
            </div>

            <div className="mt-6 space-y-4">
                <label className="block">
                    <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-gray-500">Your name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={40}
                        placeholder="e.g. Priya from the design team"
                        autoComplete="name"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-gray-500">Your wish</span>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={300}
                        rows={4}
                        placeholder={`Happy birthday, ${recipientName || 'friend'}! Wishing you…`}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <span className="mt-1 block text-right text-[10px] text-gray-400">{message.length}/300</span>
                </label>

                <div>
                    <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-gray-500">Add a mood (optional)</span>
                    <div className="flex flex-wrap gap-1.5">
                        {EMOJIS.map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setEmoji((current) => (current === value ? '' : value))}
                                aria-pressed={emoji === value}
                                aria-label={`Add ${value}`}
                                className={`h-9 w-9 rounded-xl border text-lg transition-all cursor-pointer ${emoji === value ? 'border-purple-400 bg-purple-50 scale-105' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                {status.phase === 'error' && (
                    <p className="text-xs font-semibold text-rose-600">{status.message}</p>
                )}

                <button
                    type="submit"
                    disabled={status.phase === 'saving'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 px-4 py-3.5 text-sm font-extrabold text-white shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                    {status.phase === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {status.phase === 'saving' ? 'Adding your wish…' : 'Add my wish'}
                </button>
                <p className="text-center text-[10.5px] text-gray-400">
                    Your name and wish are visible to anyone with the card link.
                </p>
            </div>
        </form>
    );
}
