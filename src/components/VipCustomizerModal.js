'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Crown, Sparkles, Music, Check, Play, Square, X, Loader2 } from 'lucide-react';
import { VIP_TRACKS, playAudioPreview, stopAllAudioPreviews } from '@/lib/music';
import { detectRegion, getVipCardPrice } from '@/lib/payments';
import { cn } from '@/lib/utils';

const VIP_THEMES = [
    { id: 'royal', name: 'Royal Gold', desc: 'Deep twilight & molten gold', color: '#f5c518', bg: '#120722', textColor: '#fff9e6' },
    { id: 'neon', name: 'Cyber Neon', desc: 'Obsidian & electric cyan glow', color: '#00f2fe', bg: '#070814', textColor: '#ffffff' },
    { id: 'midnight', name: 'Cosmic Galaxy', desc: 'Nebula indigo & starry cosmos', color: '#818cf8', bg: '#060919', textColor: '#f1f5f9' },
    { id: 'princess', name: 'Fairy Princess', desc: 'Iridescent diamond pink', color: '#ec4899', bg: '#fff2f6', textColor: '#701a3c' },
    { id: 'retro', name: 'Retro Arcade', desc: '80s phosphor CRT neon green', color: '#39ff14', bg: '#12131c', textColor: '#ffffff' },
    { id: 'sunset', name: 'Sunset Luxe', desc: 'Warm coral, gold & dusk violet', color: '#ff9052', bg: '#1f0b24', textColor: '#fff5eb' },
];

export default function VipCustomizerModal({ isOpen, onClose, page, onUpdated }) {
    const [selectedTheme, setSelectedTheme] = useState(page?.theme || 'royal');
    const [selectedMusic, setSelectedMusic] = useState(page?.music || 'musicbox');
    const [prevPage, setPrevPage] = useState(page);
    const [saving, setSaving] = useState(false);
    const [previewTrackId, setPreviewTrackId] = useState(null);
    const [vipPrice, setVipPrice] = useState(() => (typeof window !== 'undefined' ? getVipCardPrice(detectRegion()) : { label: '₹29' }));
    const audioControllerRef = useRef(null);

    useEffect(() => {
        setVipPrice(getVipCardPrice(detectRegion()));
    }, []);

    if (page !== prevPage) {
        setPrevPage(page);
        setSelectedTheme(page?.theme || 'royal');
        setSelectedMusic(page?.music || 'musicbox');
    }

    const toggleAudioPreview = (e, trackId) => {
        e.stopPropagation();
        if (previewTrackId === trackId) {
            stopAllAudioPreviews();
            audioControllerRef.current = null;
            setPreviewTrackId(null);
            return;
        }
        stopAllAudioPreviews();
        audioControllerRef.current = null;
        const controller = playAudioPreview(trackId, () => {
            setPreviewTrackId((curr) => (curr === trackId ? null : curr));
        });
        audioControllerRef.current = controller;
        setPreviewTrackId(trackId);
    };

    useEffect(() => {
        return () => {
            stopAllAudioPreviews();
            audioControllerRef.current = null;
        };
    }, []);

    if (!isOpen || !page) return null;

    const handleClose = () => {
        stopAllAudioPreviews();
        audioControllerRef.current = null;
        setPreviewTrackId(null);
        onClose();
    };

    const handleSave = async () => {
        if (!page.isVip) {
            handleClose();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('vip:open'));
            }
            return;
        }
        setSaving(true);
        stopAllAudioPreviews();
        audioControllerRef.current = null;
        setPreviewTrackId(null);
        try {
            const res = await fetch(`/api/birthday/${page.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme: selectedTheme,
                    music: selectedMusic,
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (onUpdated) onUpdated(data.page);
                window.location.reload();
            }
        } catch (e) {
            console.error('Save customization error:', e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customizer-title"
        >
            <div className="relative w-full max-w-lg bg-gradient-to-b from-[#190e2b] via-[#120a21] to-[#0a0514] text-white border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close customizer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center pb-4 pt-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 shadow-lg mb-2.5">
                        <Crown className="w-6 h-6 text-gray-950" />
                    </div>
                    <h2 id="customizer-title" className="text-2xl font-black text-white">
                        Customize VIP Look & Sound
                    </h2>
                    <p className="text-xs text-purple-200/80 mt-1">
                        Tailor the atmosphere and soundtrack for {page.recipientName} anytime.
                    </p>
                </div>

                {/* VIP Theme Selector */}
                <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1. Choose VIP Theme
                        </span>
                        <span className="text-[10px] text-amber-300/80 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
                            6 Luminous Themes
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {VIP_THEMES.map((th) => {
                            const isSelected = selectedTheme === th.id;
                            return (
                                <button
                                    key={th.id}
                                    type="button"
                                    onClick={() => setSelectedTheme(th.id)}
                                    className={cn(
                                        'p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[82px]',
                                        isSelected
                                            ? 'border-amber-400 ring-2 ring-amber-300/60 shadow-lg scale-[1.02]'
                                            : 'border-white/10 hover:border-white/30'
                                    )}
                                    style={{ backgroundColor: th.bg }}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-1 mb-1.5">
                                            <div
                                                className="w-5 h-5 rounded-full border-2 border-white/60 shadow-xs flex items-center justify-center text-[8px]"
                                                style={{ backgroundColor: th.color }}
                                            >
                                                👑
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-amber-400 font-black" />}
                                        </div>
                                        <span className="text-xs font-bold block" style={{ color: th.textColor }}>
                                            {th.name}
                                        </span>
                                        <span className="text-[9.5px] opacity-75 leading-tight block mt-0.5" style={{ color: th.textColor }}>
                                            {th.desc}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* VIP Soundtrack Selector */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5 text-purple-400" /> 2. Choose VIP Soundtrack
                        </span>
                        <span className="text-[10px] text-purple-200/80 font-bold bg-purple-400/20 px-2 py-0.5 rounded-full">
                            5 Studio Tracks
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {VIP_TRACKS.map((trk) => {
                            const isSelected = selectedMusic === trk.id;
                            const isPlayingThis = previewTrackId === trk.id;
                            return (
                                <div
                                    key={trk.id}
                                    onClick={() => setSelectedMusic(trk.id)}
                                    className={cn(
                                        'p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2',
                                        isSelected
                                            ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-300/40 shadow-sm'
                                            : 'border-white/10 hover:border-white/20 bg-white/5'
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xl shrink-0" aria-hidden="true">{trk.emoji}</span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{trk.name}</p>
                                            <p className="text-[10px] text-purple-200/70 truncate">{trk.desc}</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => toggleAudioPreview(e, trk.id)}
                                        className={cn(
                                            'shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all',
                                            isPlayingThis
                                                ? 'bg-amber-400 text-gray-950 ring-1 ring-amber-300 animate-pulse'
                                                : 'bg-white/15 hover:bg-white/25 text-white'
                                        )}
                                        title={isPlayingThis ? 'Stop' : 'Preview'}
                                    >
                                        {isPlayingThis ? <Square className="w-2.5 h-2.5 fill-gray-950" /> : <Play className="w-2.5 h-2.5 fill-white" />}
                                        <span>{isPlayingThis ? 'Stop' : 'Play'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-pink-500 text-gray-950 font-black text-sm shadow-lg hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-950" />
                        ) : !page.isVip ? (
                            <Crown className="w-4 h-4 text-gray-950" />
                        ) : (
                            <Check className="w-4 h-4 text-gray-950" />
                        )}
                        <span>{saving ? 'Saving...' : !page.isVip ? `Upgrade to VIP (${vipPrice.label}) to Save` : 'Apply & Save to Card'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
