'use client';

import { useState, useRef } from 'react';
import { Check, CheckCircle2, Link2, Sparkles, Palette, Music as MusicIcon, Upload, Loader2, Trash2, AlertCircle, X, RefreshCw, Image as ImageIcon, Zap, Crown, Play } from 'lucide-react';
import { fill } from './occasions';
import { PTHEMES } from './looks';
import { RELATIONSHIPS, getTone, getRelationshipQuotes } from './relationships';
import { TRACKS, PREMIUM_TRACKS } from '@/lib/music';
import Reveal from './Reveal';

export const EMPTY_CUSTOM = {
    letter: '',
    reasons: [
        { t: '', d: '' },
        { t: '', d: '' },
        { t: '', d: '' },
    ],
    vows: ['', '', ''],
};

const LIMITS = { letter: 800, title: 40, line: 140, vow: 140 };

const inputCls =
    'w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-[#f6f1e7] placeholder-[#6d6486] outline-none focus:border-[#f2c14e]/70 focus:ring-2 focus:ring-[#f2c14e]/20 transition-all';
const stepCls =
    'rounded-[1.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 sm:p-7 space-y-4';
const templateLinkCls =
    'text-[11px] font-bold text-[#b9aed4] hover:text-white underline decoration-dotted underline-offset-4 transition-colors';

/**
 * "Make it yours" — Studio editor supporting both:
 * 1. ⚡ Instant Cinema (15s setup, zero homework: Photo + 1-Tap Heartfelt Quote)
 * 2. 👑 Grand Keepsake (Full 5-act story with 3 memories & 3 promises)
 */
export default function CustomizePanel({
    deck,
    to,
    value,
    onChange,
    ptheme,
    onPThemeChange,
    music,
    onMusicChange,
    rel,
    onRelChange,
    toName,
    fromName,
    ageInput,
    onToChange,
    onFromChange,
    onAgeChange,
    showContinue,
    onContinue,
    musicUrl,
    musicName,
    onCustomMusicChange,
    mode = 'cinema',
    onModeChange,
    photoUrl = null,
    onPhotoChange,
    instantQuote = '',
    onInstantQuoteChange,
    onWatchCinema = null,
}) {
    const [filled, setFilled] = useState(null);
    const [uploadingMusic, setUploadingMusic] = useState(false);
    const [musicError, setMusicError] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const musicInputRef = useRef(null);
    const photoInputRef = useRef(null);
    const tone = getTone(rel);
    const quickQuotes = getRelationshipQuotes(rel);

    const handleAudioUpload = async (e) => {
        setMusicError('');
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        if (file.size > 8 * 1024 * 1024) {
            setMusicError(`Audio file exceeds 8MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a song under 8MB.`);
            return;
        }

        const isAudio = file.type.startsWith('audio/') || /\.(mp3|m4a|wav|aac|ogg|webm)$/i.test(file.name);
        if (!isAudio) {
            setMusicError('Please choose a valid audio file (MP3, M4A, WAV, AAC, or OGG).');
            return;
        }

        setUploadingMusic(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 40);
                onCustomMusicChange?.({ url: data.url, name: cleanName });
                onMusicChange('custom');
            } else {
                setMusicError(data.error || 'Failed to upload song. Please try again.');
            }
        } catch (err) {
            console.error('Audio upload error:', err);
            setMusicError('Network error while uploading song. Please try again.');
        } finally {
            setUploadingMusic(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        setPhotoError('');
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        if (file.size > 5 * 1024 * 1024) {
            setPhotoError(`Photo exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a photo under 5MB.`);
            return;
        }

        if (!file.type.startsWith('image/')) {
            setPhotoError('Please choose a valid image file (JPG, PNG, WebP).');
            return;
        }

        setUploadingPhoto(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                onPhotoChange?.(data.url);
            } else {
                setPhotoError(data.error || 'Failed to upload photo. Please try again.');
            }
        } catch (err) {
            console.error('Photo upload error:', err);
            setPhotoError('Network error while uploading photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const applyQuote = (q) => {
        onInstantQuoteChange?.(q);
        onChange({ ...value, letter: q });
        flash('letter');
    };

    const set = (patch) => onChange({ ...value, ...patch });
    const setReason = (i, patch) => {
        set({ reasons: value.reasons.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
    };
    const setVow = (i, v) => {
        set({ vows: value.vows.map((x, j) => (j === i ? v : x)) });
    };

    const flash = (key) => {
        setFilled(key);
        setTimeout(() => setFilled(null), 2200);
    };

    const useLetterTemplate = () => {
        const text = (tone.letterMid || deck.letterMid).slice(0, LIMITS.letter);
        set({ letter: text });
        onInstantQuoteChange?.(text);
        flash('letter');
    };
    const useReasonsTemplate = () => {
        set({ reasons: deck.reasons.slice(0, 3).map((r) => ({ t: r.t.slice(0, LIMITS.title), d: fill(r.d, { to }).slice(0, LIMITS.line) })) });
        flash('reasons');
    };
    const useVowsTemplate = () => {
        set({ vows: (tone.vows || deck.vows).map((v) => v.slice(0, LIMITS.vow)) });
        flash('vows');
    };

    const letterPreview = value.letter.trim()
        ? value.letter.trim().slice(0, 140) + (value.letter.trim().length > 140 ? '…' : '')
        : '';

    return (
        <section id="prm-customize" className="prm-act relative px-5 sm:px-8 py-24 sm:py-32" aria-label="Make it yours">
            <div className="max-w-2xl mx-auto">
                <Reveal className="text-center"><p className="prm-eyebrow mb-6">✦ Make it yours ✦</p></Reveal>
                <Reveal delay={120}>
                    <h2 className="prm-serif prm-h-act text-center mb-4">
                        Our words are nice. <span className="prm-gold-text">Yours are better.</span>
                    </h2>
                </Reveal>
                <Reveal delay={200}>
                    <p className="prm-lead text-sm sm:text-base text-center mb-10">
                        Four tiny steps. Write it like you talk. Whatever you write here is exactly
                        what {to || 'they'} will read. Leave anything blank and our words fill in quietly.
                    </p>
                </Reveal>

                {/* Mode Selector Pill / Segmented Control */}
                <Reveal>
                    <div className="w-full max-w-lg mx-auto mb-8">
                        {/* Segmented Control Container */}
                        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-xl shadow-2xl">
                            <button
                                type="button"
                                onClick={() => onModeChange?.('cinema')}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-3 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
                                    mode === 'cinema'
                                        ? 'bg-gradient-to-r from-[#f2c14e] via-[#f7cf6e] to-[#fb7185] text-[#1c0826] font-extrabold shadow-[0_4px_20px_rgba(242,193,78,0.3)] scale-[1.01]'
                                        : 'text-[#b9aed4] hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className={`w-4 h-4 shrink-0 ${mode === 'cinema' ? 'text-[#1c0826]' : 'text-[#f2c14e]'}`} />
                                    <span className="text-xs sm:text-sm font-extrabold tracking-tight">Instant Cinema</span>
                                </div>
                                <span
                                    className={`text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${
                                        mode === 'cinema'
                                            ? 'bg-black/15 text-[#1c0826]'
                                            : 'bg-white/10 text-[#a599c2]'
                                    }`}
                                >
                                    15s Setup
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => onModeChange?.('keepsake')}
                                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-3 px-3 rounded-xl transition-all duration-300 cursor-pointer ${
                                    mode === 'keepsake'
                                        ? 'bg-gradient-to-r from-[#f2c14e] via-[#f7cf6e] to-[#fb7185] text-[#1c0826] font-extrabold shadow-[0_4px_20px_rgba(242,193,78,0.3)] scale-[1.01]'
                                        : 'text-[#b9aed4] hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <Crown className={`w-4 h-4 shrink-0 ${mode === 'keepsake' ? 'text-[#1c0826]' : 'text-[#f2c14e]'}`} />
                                    <span className="text-xs sm:text-sm font-extrabold tracking-tight">Grand Keepsake</span>
                                </div>
                                <span
                                    className={`text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${
                                        mode === 'keepsake'
                                            ? 'bg-black/15 text-[#1c0826]'
                                            : 'bg-white/10 text-[#a599c2]'
                                    }`}
                                >
                                    Full Story
                                </span>
                            </button>
                        </div>

                        {/* Explanatory Sub-label */}
                        <p className="text-center text-[11px] sm:text-xs text-[#9f94b8] mt-2.5 transition-all">
                            {mode === 'cinema' ? (
                                <>⚡ <span className="text-[#f7dc9a] font-semibold">Instant Cinema</span>: 1 photo + 1 quote generates a fullscreen film tribute.</>
                            ) : (
                                <>👑 <span className="text-[#f7dc9a] font-semibold">Grand Keepsake</span>: Full multi-chapter scroll with letter, 3 reasons why, vows & photo vault.</>
                            )}
                        </p>

                        {/* Dedicated Action Button for Cinema Mode */}
                        {mode === 'cinema' && onWatchCinema && (
                            <div className="flex justify-center mt-4">
                                <button
                                    type="button"
                                    onClick={onWatchCinema}
                                    className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.03] hover:from-white/[0.14] hover:to-white/[0.07] border border-[#f2c14e]/45 hover:border-[#f2c14e] text-[#f7dc9a] hover:text-white transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_30px_rgba(242,193,78,0.25)] active:scale-95 cursor-pointer backdrop-blur-md"
                                >
                                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#f2c14e] to-[#fb7185] flex items-center justify-center text-[#241031] shadow-sm group-hover:scale-110 transition-transform">
                                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold tracking-wide">
                                        {showContinue ? 'Preview 15s Cinema Teaser' : 'Play Full Cinema Tribute'}
                                    </span>
                                    <span
                                        className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                                            showContinue
                                                ? 'bg-[#f2c14e]/15 border border-[#f2c14e]/30 text-[#f7dc9a]'
                                                : 'bg-[#7ee2a8]/15 border border-[#7ee2a8]/30 text-[#7ee2a8]'
                                        }`}
                                    >
                                        {showContinue ? 'Preview' : 'Unlocked ✦'}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </Reveal>

                <div className="space-y-4">
                    {/* Step 1 — the names */}
                    <Reveal>
                        <div className={stepCls}>
                            <p className="font-extrabold text-[#f7dc9a]">1. The names</p>
                            <p className="text-xs text-[#b9aed4] -mt-3">Who is this for, and who is it from? This appears everywhere, including the magic link.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label htmlFor="prm-to" className="block text-[11px] font-bold text-[#b9aed4] mb-1">For (recipient)</label>
                                    <input
                                        id="prm-to"
                                        value={toName}
                                        maxLength={40}
                                        onChange={(e) => onToChange(e.target.value)}
                                        placeholder="Priya"
                                        autoComplete="off"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prm-from" className="block text-[11px] font-bold text-[#b9aed4] mb-1">From (you)</label>
                                    <input
                                        id="prm-from"
                                        value={fromName}
                                        maxLength={60}
                                        onChange={(e) => onFromChange(e.target.value)}
                                        placeholder="Rahul"
                                        autoComplete="off"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                            <div className="max-w-[180px]">
                                <label htmlFor="prm-age" className="block text-[11px] font-bold text-[#b9aed4] mb-1">Age they are turning (optional)</label>
                                <input
                                    id="prm-age"
                                    value={ageInput}
                                    inputMode="numeric"
                                    onChange={(e) => onAgeChange(e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                                    placeholder="24"
                                    autoComplete="off"
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </Reveal>

                    {/* Step 2 — Who is it for */}
                    <Reveal>
                        <div className={stepCls}>
                            <p className="font-extrabold text-[#f7dc9a]">2. Who are they to you?</p>
                            <p className="text-xs text-[#b9aed4] -mt-3">Pick one. The whole universe adjusts its manners. Romantic stays dreamy, family turns warm, friends get playful.</p>
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Who is this for">
                                {RELATIONSHIPS.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={rel === r.id}
                                        onClick={() => onRelChange(rel === r.id ? '' : r.id)}
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${rel === r.id ? 'bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] scale-105 shadow-md' : 'border border-white/15 text-[#b9aed4] hover:text-white hover:border-white/35'}`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* Step 3 — Hero Memory Photo */}
                    <Reveal>
                        <div className={stepCls}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-extrabold text-[#f7dc9a] inline-flex items-center gap-1.5">
                                        <ImageIcon className="w-4 h-4 text-[#f2c14e]" /> 3. Memory portrait
                                    </p>
                                    <p className="text-xs text-[#b9aed4] mt-0.5">
                                        Upload a favorite photo of {toName || 'them'}. Renders in floating starlight with 3D tilt.
                                    </p>
                                </div>
                                {photoUrl && (
                                    <button
                                        type="button"
                                        onClick={() => onPhotoChange?.(null)}
                                        className="text-[11px] font-bold text-[#fda4af] hover:text-red-300 underline pt-1 cursor-pointer"
                                    >
                                        Remove photo
                                    </button>
                                )}
                            </div>

                            {photoUrl ? (
                                <div className="flex items-center gap-4 rounded-2xl border border-[#f2c14e]/40 bg-[rgba(242,193,78,0.06)] p-3">
                                    <img
                                        src={photoUrl}
                                        alt="Memory preview"
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-amber-300/40 shadow-md shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-[#f7dc9a] truncate">Photo loaded ✨</p>
                                        <p className="text-[11px] text-[#cfc4e8]">Framed inside the 3D Starlight Monument</p>
                                        <button
                                            type="button"
                                            onClick={() => photoInputRef.current?.click()}
                                            disabled={uploadingPhoto}
                                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#f7dc9a] hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                                        >
                                            <RefreshCw className="w-3 h-3" /> Change photo
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    disabled={uploadingPhoto}
                                    className="w-full rounded-2xl border border-dashed border-[#f2c14e]/40 hover:border-[#f2c14e] bg-[rgba(242,193,78,0.04)] hover:bg-[rgba(242,193,78,0.08)] p-5 text-center transition-all cursor-pointer group"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-[#f2c14e]/20 border border-[#f2c14e]/40 flex items-center justify-center text-[#f2c14e]">
                                            {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#f7dc9a] group-hover:text-white transition-colors">
                                                {uploadingPhoto ? 'Uploading photo...' : 'Tap to upload a photo of them'}
                                            </p>
                                            <p className="text-[11px] text-[#b9aed4] mt-0.5">JPG, PNG, WebP • Max 5MB • Instant 3D tilt magic</p>
                                        </div>
                                    </div>
                                </button>
                            )}

                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />

                            {photoError && (
                                <div role="alert" className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3.5 py-2.5 text-xs text-red-200">
                                    <span className="flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                        {photoError}
                                    </span>
                                    <button type="button" onClick={() => setPhotoError('')} className="text-red-400 hover:text-white p-1">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </Reveal>

                    {/* Step 4 — Heartfelt Words */}
                    {mode === 'cinema' ? (
                        /* ⚡ INSTANT CINEMA WORDS: Plug & Play Quotes */
                        <Reveal>
                            <div className={stepCls}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-extrabold text-[#f7dc9a] inline-flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-[#f2c14e]" /> 4. Heartfelt dedication
                                        </p>
                                        <p className="text-xs text-[#b9aed4] mt-0.5">
                                            Tap any heartfelt quote below to plug it in, or write your own note.
                                        </p>
                                    </div>
                                    <button type="button" onClick={useLetterTemplate} className={`${templateLinkCls} shrink-0 pt-1`}>
                                        {filled === 'letter' ? 'Filled ✓' : 'Surprise me'}
                                    </button>
                                </div>

                                {/* Plug-and-play quick quote chips */}
                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold text-[#f7dc9a]/80 uppercase tracking-wider">
                                        ⚡ 1-Tap Heartfelt Quotes:
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        {quickQuotes.map((quote, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => applyQuote(quote)}
                                                className={`text-left text-xs p-3 rounded-xl border transition-all cursor-pointer ${
                                                    value.letter === quote || instantQuote === quote
                                                        ? 'border-[#f2c14e] bg-[rgba(242,193,78,0.12)] text-[#fbf7ee] shadow-sm'
                                                        : 'border-white/10 bg-white/[0.02] text-[#cfc4e8] hover:border-white/25 hover:text-white'
                                                }`}
                                            >
                                                &ldquo;{quote}&rdquo;
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label htmlFor="prm-instant-note" className="block text-[11px] font-bold text-[#b9aed4] mb-1">
                                        Or write your personal note:
                                    </label>
                                    <textarea
                                        id="prm-instant-note"
                                        rows={3}
                                        maxLength={LIMITS.letter}
                                        value={value.letter}
                                        onChange={(e) => {
                                            onChange({ ...value, letter: e.target.value });
                                            onInstantQuoteChange?.(e.target.value);
                                        }}
                                        placeholder="Add any memory, inside joke, or heartfelt words here..."
                                        className={`${inputCls} resize-y min-h-[90px] leading-relaxed`}
                                    />
                                    <p className="text-right text-[11px] text-[#6d6486] mt-1">{value.letter.length}/{LIMITS.letter}</p>
                                </div>
                            </div>
                        </Reveal>
                    ) : (
                        /* 👑 GRAND KEEPSAKE WORDS: Letter + Reasons + Vows */
                        <>
                            {/* The letter */}
                            <Reveal>
                                <div className={stepCls}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-extrabold text-[#f7dc9a]">4. The personal letter</p>
                                            <p className="text-xs text-[#b9aed4] mt-0.5">One honest paragraph. This becomes the centerpiece of your letter.</p>
                                        </div>
                                        <button type="button" onClick={useLetterTemplate} className={`${templateLinkCls} shrink-0 pt-1`}>
                                            {filled === 'letter' ? 'Filled ✓' : `Use ${tone.id === 'romantic' ? deck.label.toLowerCase() : tone.id} words`}
                                        </button>
                                    </div>
                                    <div>
                                        <textarea
                                            rows={4}
                                            maxLength={LIMITS.letter}
                                            value={value.letter}
                                            onChange={(e) => {
                                                onChange({ ...value, letter: e.target.value });
                                                onInstantQuoteChange?.(e.target.value);
                                            }}
                                            placeholder="Share a memory, what makes them special to you, or something you want them to always remember..."
                                            aria-label="Your letter paragraph"
                                            className={`${inputCls} resize-y min-h-[110px] leading-relaxed`}
                                        />
                                        <p className="text-right text-[11px] text-[#6d6486] mt-1">{value.letter.length}/{LIMITS.letter}</p>
                                    </div>
                                    {letterPreview && (
                                        <p className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 prm-serif italic text-sm leading-relaxed text-[#e9e2f5]">
                                            “{letterPreview}”
                                        </p>
                                    )}
                                </div>
                            </Reveal>

                            {/* Reasons */}
                            <Reveal>
                                <div className={stepCls}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-extrabold text-[#f7dc9a]">5. Three honest reasons</p>
                                            <p className="text-xs text-[#b9aed4] mt-0.5">One line each. These become the highlight cards in &ldquo;Why You Mean So Much&rdquo;.</p>
                                        </div>
                                        <button type="button" onClick={useReasonsTemplate} className={`${templateLinkCls} shrink-0 pt-1`}>
                                            {filled === 'reasons' ? 'Filled ✓' : `Use ${tone.id === 'romantic' ? deck.label.toLowerCase() : tone.id} words`}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {value.reasons.map((r, i) => (
                                            <div key={i} className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-2">
                                                <input
                                                    value={r.t}
                                                    maxLength={LIMITS.title}
                                                    onChange={(e) => setReason(i, { t: e.target.value })}
                                                    placeholder={['e.g. Always there for me', 'e.g. Contagious laugh', 'One more quality'][i]}
                                                    aria-label={`Reason ${i + 1} title`}
                                                    className={inputCls}
                                                />
                                                <input
                                                    value={r.d}
                                                    maxLength={LIMITS.line}
                                                    onChange={(e) => setReason(i, { d: e.target.value })}
                                                    placeholder="And a short line explaining why this means so much"
                                                    aria-label={`Reason ${i + 1} story`}
                                                    className={inputCls}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>

                            {/* Vows */}
                            <Reveal>
                                <div className={stepCls}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-extrabold text-[#f7dc9a]">6. Three personal promises</p>
                                            <p className="text-xs text-[#b9aed4] mt-0.5">Heartfelt, meaningful promises that seal your message.</p>
                                        </div>
                                        <button type="button" onClick={useVowsTemplate} className={`${templateLinkCls} shrink-0 pt-1`}>
                                            {filled === 'vows' ? 'Filled ✓' : `Use ${tone.id === 'romantic' ? deck.label.toLowerCase() : tone.id} words`}
                                        </button>
                                    </div>
                                    <div className="space-y-2.5">
                                        {value.vows.map((v, i) => (
                                            <input
                                                key={i}
                                                value={v}
                                                maxLength={LIMITS.vow}
                                                onChange={(e) => setVow(i, e.target.value)}
                                                placeholder={['I promise to always...', 'I promise to stand by you when...', 'I promise that no matter what...'][i]}
                                                aria-label={`Promise ${i + 1}`}
                                                className={inputCls}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </>
                    )}

                    {/* Step 4 — look and sound */}
                    <Reveal>
                        <div className={stepCls}>
                            <p className="font-extrabold text-[#f7dc9a] inline-flex items-center gap-1.5">
                                <Palette className="w-4 h-4" aria-hidden="true" /> 6. The look
                            </p>
                            <p className="text-xs text-[#b9aed4] -mt-3">The whole universe repaints itself. Pick the one that feels like them.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" role="radiogroup" aria-label="Premium look">
                                {PTHEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={ptheme === t.id}
                                        onClick={() => onPThemeChange(t.id)}
                                        className={`rounded-2xl border-2 p-3 text-left transition-all ${ptheme === t.id ? 'border-[#f2c14e] shadow-[0_0_30px_rgba(242,193,78,0.25)]' : 'border-white/10 hover:border-white/30'}`}
                                    >
                                        <span className="block h-12 rounded-xl mb-2" style={{ background: t.swatch }} aria-hidden="true" />
                                        <span className="flex items-center gap-1 text-xs font-bold">
                                            {ptheme === t.id && <Check className="w-3.5 h-3.5 text-[#7ee2a8]" aria-hidden="true" />}
                                            {t.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <p className="font-extrabold text-[#f7dc9a] inline-flex items-center gap-1.5 pt-2">
                                <MusicIcon className="w-4 h-4" aria-hidden="true" /> And the sound
                            </p>
                            <p className="text-xs text-[#b9aed4] -mt-3">Starts playing the moment they break the seal. Choose a studio recording or upload their favorite song from your device.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Music">
                                {[...PREMIUM_TRACKS, TRACKS.find((t) => t.id === 'off')].filter(Boolean).map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={music === t.id}
                                        onClick={() => onMusicChange(t.id)}
                                        className={`rounded-2xl border px-4 py-3 text-left transition-all ${music === t.id ? 'border-[#f2c14e] bg-[rgba(242,193,78,0.08)]' : 'border-white/10 hover:border-white/30'}`}
                                    >
                                        <span className="flex items-center gap-2 text-sm font-bold">
                                            <span aria-hidden="true">{t.emoji}</span> {t.name}
                                            {music === t.id && <Check className="w-4 h-4 ml-auto text-[#7ee2a8]" aria-hidden="true" />}
                                        </span>
                                        <span className="block text-[11px] text-[#6d6486] mt-0.5">{t.desc}</span>
                                    </button>
                                ))}

                                {/* Custom Music Option */}
                                {musicUrl ? (
                                    <div
                                        onClick={() => onMusicChange('custom')}
                                        role="radio"
                                        aria-checked={music === 'custom'}
                                        className={`col-span-1 sm:col-span-2 rounded-2xl border px-4 py-3 text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${music === 'custom' ? 'border-[#f2c14e] bg-[rgba(242,193,78,0.1)] shadow-[0_0_20px_rgba(242,193,78,0.15)]' : 'border-white/15 bg-white/[0.02] hover:border-white/30'}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-xl" aria-hidden="true">🎵</span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-[#f7dc9a] truncate flex items-center gap-1.5">
                                                    <span className="truncate">{musicName || 'Your Custom Song'}</span>
                                                    {music === 'custom' && <Check className="w-4 h-4 text-[#7ee2a8] shrink-0" aria-hidden="true" />}
                                                </p>
                                                <p className="text-[11px] text-[#b9aed4]">Uploaded from your device • Cleared for gifting</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={() => musicInputRef.current?.click()}
                                                disabled={uploadingMusic}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f7dc9a] hover:text-white px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                            >
                                                <RefreshCw className="w-3 h-3" /> Change
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onCustomMusicChange?.(null);
                                                    onMusicChange('beats');
                                                }}
                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#fda4af] hover:text-red-300 px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={false}
                                        disabled={uploadingMusic}
                                        onClick={() => musicInputRef.current?.click()}
                                        className="col-span-1 sm:col-span-2 rounded-2xl border border-dashed border-[#f2c14e]/40 hover:border-[#f2c14e] bg-[rgba(242,193,78,0.04)] hover:bg-[rgba(242,193,78,0.08)] px-4 py-3 text-left transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="flex items-center gap-2 text-sm font-bold text-[#f7dc9a] group-hover:text-white transition-colors">
                                                {uploadingMusic ? <Loader2 className="w-4 h-4 animate-spin text-[#f2c14e]" /> : <Upload className="w-4 h-4 text-[#f2c14e]" />}
                                                {uploadingMusic ? 'Uploading your song from device...' : 'Upload your own song from device'}
                                            </span>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f2c14e]/20 text-[#f7dc9a]">
                                                Premium
                                            </span>
                                        </div>
                                        <span className="block text-[11px] text-[#b9aed4] mt-0.5">MP3, M4A, WAV, AAC, OGG • Max 8MB</span>
                                    </button>
                                )}
                            </div>

                            <input
                                ref={musicInputRef}
                                type="file"
                                accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
                                className="hidden"
                                onChange={handleAudioUpload}
                            />

                            {musicError && (
                                <div role="alert" className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3.5 py-2.5 text-xs text-red-200">
                                    <span className="flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                        {musicError}
                                    </span>
                                    <button type="button" onClick={() => setMusicError('')} className="text-red-400 hover:text-white p-1" aria-label="Dismiss error">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </Reveal>

                    {/* Mode Alternate Transition Card */}
                    <Reveal>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                            {mode === 'cinema' ? (
                                <>
                                    <p className="text-xs text-[#b9aed4]">
                                        Want to add 3 memories and 3 personal promises too?
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => onModeChange?.('keepsake')}
                                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#f7dc9a] hover:text-white underline decoration-dotted underline-offset-4 cursor-pointer"
                                    >
                                        <Crown className="w-3.5 h-3.5 text-[#f2c14e]" />
                                        Switch to Grand Keepsake (Full Story) →
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs text-[#b9aed4]">
                                        Short on time? Prefer a fast 15-second visual card without extra typing?
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => onModeChange?.('cinema')}
                                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#f7dc9a] hover:text-white underline decoration-dotted underline-offset-4 cursor-pointer"
                                    >
                                        <Zap className="w-3.5 h-3.5 text-[#f2c14e]" />
                                        Switch to Instant Cinema (15s Setup) →
                                    </button>
                                </>
                            )}
                        </div>
                    </Reveal>

                    {showContinue ? (
                        <>
                            <Reveal>
                                <p className="text-center text-xs text-[#6d6486] inline-flex items-center justify-center gap-1.5 w-full">
                                    <Sparkles className="w-3.5 h-3.5 text-[#f2c14e]" aria-hidden="true" />
                                    Your words, photo, look and music all travel inside the private link when you unlock.
                                </p>
                            </Reveal>

                            <Reveal>
                                <button
                                    type="button"
                                    onClick={onContinue}
                                    className="prm-shimmer-btn w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-base transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer"
                                >
                                    Looking perfect. Continue to unlock
                                    <span aria-hidden="true">→</span>
                                </button>
                            </Reveal>
                        </>
                    ) : (
                        <Reveal>
                            <div className="rounded-2xl border border-[#7ee2a8]/40 bg-[rgba(126,226,168,0.06)] p-5 text-center space-y-3">
                                <div className="inline-flex items-center gap-2 text-sm font-bold text-[#7ee2a8]">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Universe Unlocked · All edits update live
                                </div>
                                <p className="text-xs text-[#b9aed4] max-w-md mx-auto leading-relaxed">
                                    Your updates to {toName || 'them'}’s names, photos, words, and music automatically sync to your magic link.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const el = document.getElementById('prm-magiclink');
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        else window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="prm-shimmer-btn inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                    <Link2 className="w-4 h-4" /> View Magic Link & Share
                                </button>
                            </div>
                        </Reveal>
                    )}
                </div>
            </div>
        </section>
    );
}
