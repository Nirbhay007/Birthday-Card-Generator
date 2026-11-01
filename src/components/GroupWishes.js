'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, Plus, Copy, Check, Users } from 'lucide-react';
import { track } from '@/lib/track';

/**
 * The recipient-facing wishes wall for a group card, plus the creator's
 * contributor link. Wishes are public and append-only; React escapes them.
 */
export default function GroupWishes({ pageId, recipientName = '', isOwner = false, isGroup = false, hideCta = false }) {
    const [wishes, setWishes] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(0);
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        try {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOrigin(window.location.origin);
        } catch { }
    }, []);

    useEffect(() => {
        const onAdded = () => setReload((n) => n + 1);
        window.addEventListener('bgen:group-wish-added', onAdded);
        return () => window.removeEventListener('bgen:group-wish-added', onAdded);
    }, []);

    useEffect(() => {
        if (!isGroup || !pageId) return;
        let alive = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        fetch(`/api/group-wishes?pageId=${encodeURIComponent(pageId)}`)
            .then((r) => r.json())
            .then((data) => {
                if (!alive || !data?.success) return;
                setWishes(Array.isArray(data.wishes) ? data.wishes : []);
                setCount(Number(data.count) || 0);
            })
            .catch(() => { })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [isGroup, pageId, reload]);

    if (!isGroup) return null;

    const addUrl = origin ? `${origin}/b/${pageId}/add` : `/b/${pageId}/add`;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(addUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch { }
    };

    return (
        <section className="mb-14" aria-label={`Wishes for ${recipientName || 'the birthday person'}`}>
            <div className="mx-auto max-w-2xl rounded-3xl border border-sky-200 bg-white/85 backdrop-blur-sm p-5 sm:p-7 shadow-sm">
                <div className="text-center">
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 border border-sky-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-sky-800">
                        <Users className="w-3 h-3" aria-hidden="true" /> Group card
                    </p>
                    <h3 className="mt-2 text-2xl font-extrabold text-gray-900">
                        Wishes from everyone 💌
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        {count > 0
                            ? `${count} ${count === 1 ? 'person has' : 'people have'} added a wish for ${recipientName || 'you'}.`
                            : `Be the first to add a wish for ${recipientName || 'the birthday star'}.`}
                    </p>
                </div>

                {loading ? (
                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading wishes…
                    </div>
                ) : wishes.length > 0 ? (
                    <ul className="mt-5 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {wishes.map((wish) => (
                            <li key={wish.id} className="rounded-2xl bg-sky-50/70 border border-sky-100 px-3.5 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                                        {(wish.name || '?').trim().charAt(0).toUpperCase()}
                                    </span>
                                    <span className="text-xs font-extrabold text-gray-900">{wish.name}</span>
                                    {wish.emoji ? <span aria-hidden="true">{wish.emoji}</span> : null}
                                </div>
                                <p className="mt-1.5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{wish.message}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 px-4 py-6 text-center">
                        <Heart className="w-6 h-6 text-sky-400 mx-auto" aria-hidden="true" />
                        <p className="mt-2 text-sm font-bold text-gray-800">No wishes yet</p>
                        <p className="text-xs text-gray-500 mt-0.5">Share the link and the wall fills up.</p>
                    </div>
                )}

                {!hideCta && (
                    <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        <Link
                            href={`/b/${pageId}/add`}
                            onClick={() => track('group_wish_cta_click', { path: '/b/[id]' })}
                            className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 text-sm font-extrabold shadow-md transition-colors"
                        >
                            <Plus className="w-4 h-4" aria-hidden="true" /> Add your wish
                        </Link>
                        {isOwner && (
                            <button
                                type="button"
                                onClick={copyLink}
                                className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white hover:bg-sky-50 text-sky-800 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Contributor link copied' : 'Copy contributor link'}
                            </button>
                        )}
                    </div>
                )}
                {isOwner && !hideCta && (
                    <p className="mt-2 text-center text-[10.5px] text-gray-400">
                        Share this with the group. Only you see this copy button.
                    </p>
                )}
            </div>
        </section>
    );
}
