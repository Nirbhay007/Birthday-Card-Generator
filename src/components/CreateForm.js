'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotoUploader from './PhotoUploader';
import WishInspirationModal from './WishInspirationModal';
import SupportButton from './SupportButton';
import {
    Loader2, Sparkles, Bell, ArrowLeft, ArrowRight, Check,
    User, Palette, Camera, Heart, Laugh, Scissors, Music,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRACKS, getTrackName } from '@/lib/music';

const DRAFT_KEY = 'birthdaygen-draft-v1';

const THEMES = [
    { id: 'elegant', name: 'Elegant', color: '#d4af37', bg: '#fdfbf7', textColor: '#111827' },
    { id: 'fun', name: 'Fun & Colorful', color: '#ff69b4', bg: '#fff0f5', textColor: '#111827' },
    { id: 'royal', name: 'Royal Gold 👑', color: '#f5c518', bg: '#1a0f2e', textColor: '#fdf6e3' },
    { id: 'midnight', name: 'Midnight Stars', color: '#818cf8', bg: '#0b1026', textColor: '#eef2ff' },
    { id: 'princess', name: 'Princess 💖', color: '#ec4899', bg: '#fff5f7', textColor: '#831843' },
    { id: 'unicorn', name: 'Unicorn Kids 🦄', color: '#8b5cf6', bg: '#f5f3ff', textColor: '#4c1d95' },
    { id: 'retro', name: 'Retro Neon', color: '#00ff00', bg: '#2b2b2b', textColor: '#ffffff' },
    { id: 'minimal', name: 'Minimal', color: '#000000', bg: '#ffffff', textColor: '#111827' },
];

const RELATIONSHIPS = [
    'Mom', 'Dad', 'Sister', 'Brother', 'Best Friend', 'Partner',
    'Husband', 'Wife', 'Boyfriend', 'Girlfriend', 'Son', 'Daughter',
    'Grandma', 'Grandpa', 'Friend', 'Colleague', 'Boss', 'Teacher',
];

const THEME_SUGGESTION = {
    Mom: 'princess', Dad: 'elegant', Sister: 'princess', Brother: 'retro',
    'Best Friend': 'fun', Partner: 'royal', Husband: 'royal', Wife: 'royal',
    Boyfriend: 'midnight', Girlfriend: 'princess', Son: 'unicorn', Daughter: 'unicorn',
    Grandma: 'elegant', Grandpa: 'elegant', Friend: 'fun', Colleague: 'minimal',
    Boss: 'minimal', Teacher: 'elegant',
};

const FUNNY_LINES = [
    'P.S. Your candles cost more than your cake this year. Blow them out with pride! 🎂',
    'P.S. You\'re not getting older, you\'re just leveling up with extra cake! 🎮🎂',
    'P.S. I\'d sing for you, but let\'s spare the neighbours. Have the loudest day! 🔊🎉',
    'P.S. Cake calories don\'t count on birthdays. Science(ish). Enjoy! 🍰',
];

const STEPS = [
    { id: 1, label: 'Who', icon: User },
    { id: 2, label: 'Words & Style', icon: Palette },
    { id: 3, label: 'Photos & Finish', icon: Camera },
];

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all';

function applyTone(message, tone, name) {
    const base = (message || '').trim();
    if (tone === 'warmer') {
        if (!base) return `${name ? `${name}, you` : 'You'} mean more to me than words can say. Today is all about celebrating your kindness, your laughter, and everything that makes you you. I hope this year wraps you in as much love as you give away every day. 💜`;
        let out = base;
        if (!/love|dear|special|grateful|thank/i.test(out)) {
            out = `${name ? `${name}, ` : ''}from the bottom of my heart — ${out.charAt(0).toLowerCase() + out.slice(1)}`;
        }
        if (!/💜|❤️|😘|🤗/.test(out)) out += ' 💜';
        return out;
    }
    if (tone === 'funnier') {
        if (!base) return 'Happy Birthday, legend! May your day have extra cake, zero awkward singing, and candles you can actually blow out in one go. 🎂';
        const line = FUNNY_LINES[base.length % FUNNY_LINES.length];
        return base.includes('P.S.') ? base : `${base} ${line}`;
    }
    // shorter
    if (!base) return base;
    const first = base.split(/(?<=[.!?])\s+/)[0] || base;
    if (first.length <= 160) return first;
    return first.split(' ').slice(0, 26).join(' ') + '…';
}

export default function CreateForm({ formData, setFormData }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [inspirationOpen, setInspirationOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [nameError, setNameError] = useState('');
    const [toneMsg, setToneMsg] = useState('');
    const restoredRef = useRef(false);
    // Guards against accidental submits: the Generate button sits exactly
    // where Continue was, so a double-click/double-tap on Continue would
    // otherwise land its second click on Generate and submit instantly.
    const stepShownAt = useRef(Date.now());
    const armedSubmit = useRef(false);

    const set = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

    // Timestamp each step + drop focus so a stray Enter/Space can't
    // re-trigger the just-unmounted Continue button.
    useEffect(() => {
        stepShownAt.current = Date.now();
        armedSubmit.current = false;
        try { document.activeElement?.blur?.(); } catch {}
    }, [step]);

    // Restore autosaved draft once (only when form is untouched)
    useEffect(() => {
        if (restoredRef.current) return;
        restoredRef.current = true;
        const t = setTimeout(() => {
            try {
                const raw = localStorage.getItem(DRAFT_KEY);
                if (!raw) return;
                const draft = JSON.parse(raw);
                setFormData((prev) => {
                    const untouched = !prev.recipientName && !prev.message && (prev.photos || []).length === 0;
                    if (untouched && draft && (draft.recipientName || draft.message)) {
                        return { ...prev, ...draft };
                    }
                    return prev;
                });
            } catch {}
        }, 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Autosave draft on change (skip empty)
    useEffect(() => {
        try {
            if (formData.recipientName || formData.message || (formData.photos || []).length > 0) {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...formData, savedAt: Date.now() }));
            }
        } catch {}
    }, [formData]);

    // Auto-populate message if user arrived from /wishes/[slug] or /ages/[age] with ?wish=...
    useEffect(() => {
        const wishParam = searchParams.get('wish');
        const fromParam = searchParams.get('from');
        if (wishParam && !formData.message) {
            setFormData((prev) => ({ ...prev, message: wishParam }));
            setStep(2);
        }
        if (fromParam && /^(wishes|ages)\/[a-z0-9-]+$/.test(fromParam) && formData.source !== fromParam) {
            setFormData((prev) => ({ ...prev, source: fromParam }));
        }
    }, [searchParams, formData.message, formData.source, setFormData]);

    const goNext = () => {
        if (step === 1 && !formData.recipientName.trim()) {
            setNameError('Please add their name — it makes the whole surprise personal ✨');
            return;
        }
        setNameError('');
        setStep((s) => Math.min(3, s + 1));
    };

    const handleTone = (tone) => {
        const next = applyTone(formData.message, tone, formData.recipientName.trim());
        set({ message: next });
        setToneMsg(tone === 'warmer' ? 'Made it warmer 💜' : tone === 'funnier' ? 'Added some giggles 😄' : 'Trimmed it short ✂️');
        setTimeout(() => setToneMsg(''), 2200);
    };

    const handleGenerateClick = (e) => {
        // Ignore taps that are really the 2nd half of a double-tap on Continue
        if (Date.now() - stepShownAt.current < 800) {
            e.preventDefault();
            return;
        }
        armedSubmit.current = true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Only an explicit click/tap/keypress ON the Generate button may submit.
        // This blocks Enter-key implicit submits from text inputs.
        if (step !== 3) {
            goNext();
            return;
        }
        if (!armedSubmit.current) return;
        armedSubmit.current = false;
        if (!formData.recipientName.trim()) {
            setStep(1);
            setNameError('Please add their name — it makes the whole surprise personal ✨');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/birthday', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                try { localStorage.removeItem(DRAFT_KEY); } catch {}
                router.push(`/b/${data.id}`);
            } else {
                alert('Failed to create page: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating page:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const suggestedTheme = formData.relationship ? THEME_SUGGESTION[formData.relationship] : null;
    const themeName = (THEMES.find((t) => t.id === formData.theme) || {}).name || formData.theme;

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100">
                <div className="space-y-2 text-center mb-6">
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Create a Birthday Page
                    </h2>
                    <p className="text-gray-600 text-sm">Three quick steps — your draft saves automatically.</p>
                </div>

                {/* Stepper */}
                <ol className="flex items-center gap-1 sm:gap-2 mb-8" aria-label="Creation progress">
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const done = step > s.id;
                        const active = step === s.id;
                        return (
                            <li key={s.id} className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => (s.id < step ? setStep(s.id) : s.id === 1 ? setStep(1) : null)}
                                    className={cn(
                                        'w-full flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-bold transition-all',
                                        active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                            : done ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer'
                                                : 'bg-gray-100 text-gray-400'
                                    )}
                                    aria-current={active ? 'step' : undefined}
                                >
                                    {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                    <span className="hidden xs:inline sm:inline">{i + 1}. {s.label}</span>
                                    <span className="xs:hidden sm:hidden">{i + 1}</span>
                                </button>
                            </li>
                        );
                    })}
                </ol>

                {/* STEP 1 — Who */}
                {step === 1 && (
                    <div className="space-y-5 pop-in">
                        <div>
                            <label htmlFor="recipientName" className="block text-sm font-semibold text-gray-800 mb-1">
                                Who is it for? <span className="text-red-500" aria-hidden="true">*</span>
                            </label>
                            <input
                                id="recipientName"
                                name="recipientName"
                                type="text"
                                required
                                aria-required="true"
                                autoFocus
                                placeholder="Recipient's Name (e.g. Sarah)"
                                className={cn(inputCls, nameError && 'border-red-400 ring-2 ring-red-100')}
                                value={formData.recipientName}
                                onChange={(e) => { set({ recipientName: e.target.value }); if (e.target.value.trim()) setNameError(''); }}
                            />
                            {nameError ? <p className="text-xs text-red-600 font-semibold mt-1.5">{nameError}</p> : null}
                        </div>

                        <div>
                            <label htmlFor="relationship" className="block text-sm font-semibold text-gray-800 mb-1">
                                Who are they to you? <span className="text-gray-400 text-xs font-normal">(Optional — personalizes the page)</span>
                            </label>
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Relationship">
                                {RELATIONSHIPS.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        role="radio"
                                        aria-checked={formData.relationship === r}
                                        onClick={() => set({ relationship: formData.relationship === r ? '' : r })}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer',
                                            formData.relationship === r
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'
                                        )}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="birthdayDate" className="block text-sm font-semibold text-gray-800 mb-1">
                                    Birthday date <span className="text-gray-400 text-xs font-normal">(free annual reminder 🎂)</span>
                                </label>
                                <input
                                    id="birthdayDate"
                                    name="birthdayDate"
                                    type="date"
                                    className={inputCls}
                                    value={formData.birthdayDate || ''}
                                    onChange={(e) => set({ birthdayDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="age" className="block text-sm font-semibold text-gray-800 mb-1">
                                    Turning age? 🎂 <span className="text-gray-400 text-xs font-normal">(sets the candles)</span>
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    min="1"
                                    max="120"
                                    placeholder="e.g. 21"
                                    className={inputCls}
                                    value={formData.age || ''}
                                    onChange={(e) => set({ age: e.target.value ? parseInt(e.target.value, 10) : '' })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="senderName" className="block text-sm font-semibold text-gray-800 mb-1">
                                Your name <span className="text-gray-400 text-xs font-normal">(adds &ldquo;With love, &hellip;&rdquo;)</span>
                            </label>
                            <input
                                id="senderName"
                                name="senderName"
                                type="text"
                                placeholder="e.g. Aarav"
                                maxLength={80}
                                className={inputCls}
                                value={formData.senderName || ''}
                                onChange={(e) => set({ senderName: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2 — Words & Style */}
                {step === 2 && (
                    <div className="space-y-5 pop-in">
                        <div>
                            <div className="flex items-center justify-between mb-1 gap-2">
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-800">
                                    Your message <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setInspirationOpen(true)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer shrink-0"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Pick a wish</span>
                                </button>
                            </div>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                placeholder="Write something sweet, funny, or memorable..."
                                className={cn(inputCls, 'resize-none')}
                                value={formData.message}
                                onChange={(e) => set({ message: e.target.value })}
                            />
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Magic touch:</span>
                                <button type="button" onClick={() => handleTone('warmer')} className="inline-flex items-center gap-1 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer">
                                    <Heart className="w-3.5 h-3.5" /> Warmer
                                </button>
                                <button type="button" onClick={() => handleTone('funnier')} className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer">
                                    <Laugh className="w-3.5 h-3.5" /> Funnier
                                </button>
                                <button type="button" onClick={() => handleTone('shorter')} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer">
                                    <Scissors className="w-3.5 h-3.5" /> Shorter
                                </button>
                                {toneMsg && <span className="text-xs font-semibold text-green-700 pop-in">{toneMsg}</span>}
                            </div>
                        </div>

                        <div>
                            <span id="theme-label" className="block text-sm font-semibold text-gray-800 mb-1">Choose a vibe <span className="text-xs font-normal text-green-700 bg-green-50 px-2 py-0.5 rounded-full ml-1">All free 🎉</span></span>
                            {suggestedTheme && suggestedTheme !== formData.theme && (
                                <button
                                    type="button"
                                    onClick={() => set({ theme: suggestedTheme })}
                                    className="mb-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                                >
                                    ✨ Perfect for {formData.relationship || 'them'}: {(THEMES.find((t) => t.id === suggestedTheme) || {}).name} — tap to apply
                                </button>
                            )}
                            <div role="radiogroup" aria-labelledby="theme-label" className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                {THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={formData.theme === theme.id}
                                        onClick={() => set({ theme: theme.id })}
                                        className={cn(
                                            'relative p-3 rounded-xl border-2 transition-all text-left overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer',
                                            formData.theme === theme.id ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'
                                        )}
                                        style={{ backgroundColor: theme.bg }}
                                    >
                                        <div className="relative z-10">
                                            <div className="w-6 h-6 rounded-full mb-2 border border-black/10" style={{ backgroundColor: theme.color }} />
                                            <span className="text-xs sm:text-sm font-medium" style={{ color: theme.textColor }}>{theme.name}</span>
                                        </div>
                                        {formData.theme === theme.id && (
                                            <div className="absolute top-2 right-2 text-purple-600" aria-hidden="true">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 mb-2">
                                <Music className="w-4 h-4 text-purple-600" /> Party music
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Music choice">
                                {TRACKS.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={(formData.music || 'classic') === t.id}
                                        onClick={() => set({ music: t.id })}
                                        className={cn(
                                            'p-3 rounded-xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600',
                                            (formData.music || 'classic') === t.id ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300 bg-white'
                                        )}
                                    >
                                        <span className="text-xl" aria-hidden="true">{t.emoji}</span>
                                        <span className="block text-xs font-bold text-gray-900 mt-1">{t.name}</span>
                                        <span className="block text-[11px] text-gray-500">{t.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 — Photos & Finish */}
                {step === 3 && (
                    <div className="space-y-5 pop-in">
                        <div>
                            <span className="block text-sm font-semibold text-gray-800 mb-1">Add favorite photos <span className="text-gray-400 text-xs font-normal">(up to 8 — they auto-shrink for fast sharing)</span></span>
                            <PhotoUploader
                                photos={formData.photos}
                                setPhotos={(photos) => setFormData((prev) => ({ ...prev, photos: typeof photos === 'function' ? photos(prev.photos) : photos }))}
                            />
                        </div>

                        <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2.5">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={formData.remindNextYear || false}
                                    onChange={(e) => set({ remindNextYear: e.target.checked })}
                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                                    <Bell className="w-3.5 h-3.5 text-purple-600" /> Remind me next year, 7 days before
                                </span>
                            </label>
                            <p className="text-[11px] text-gray-500 pl-6">
                                Pages stay active 30 days — with this ticked, we&apos;ll keep yours alive for next year 💜
                            </p>
                            {formData.remindNextYear && (
                                <input
                                    type="email"
                                    placeholder="Your email for the free reminder..."
                                    value={formData.reminderEmail || ''}
                                    onChange={(e) => set({ reminderEmail: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-purple-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                                />
                            )}
                        </div>

                        {/* Summary */}
                        <div className="rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 text-[11px] font-bold uppercase tracking-widest text-gray-500">Your surprise, at a glance</div>
                            <div className="p-4 text-sm space-y-1.5" data-theme={formData.theme} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                                <p className="text-lg font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Happy Birthday {formData.recipientName || '…'}! 🎉
                                </p>
                                <p className="text-xs opacity-80">
                                    {[formData.relationship && `For your ${formData.relationship}`, formData.age && `Turning ${formData.age}`, `${(formData.photos || []).length} photo${(formData.photos || []).length === 1 ? '' : 's'}`, themeName, getTrackName(formData.music || 'classic')].filter(Boolean).join(' • ')}
                                </p>
                                {formData.message && <p className="text-xs italic opacity-75 line-clamp-2">&ldquo;{formData.message}&rdquo;</p>}
                                {formData.senderName && <p className="text-xs font-semibold opacity-70">— With love, {formData.senderName}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <div className="flex items-center gap-3 mt-8">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep((s) => s - 1)}
                            className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-purple-300 hover:text-purple-700 transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={goNext}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-300"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            onClick={handleGenerateClick}
                            className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Wrapping your surprise...</>
                            ) : (
                                <><Sparkles className="w-5 h-5" aria-hidden="true" /> Generate Free Birthday Page</>
                            )}
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-gray-500 mt-5">
                    Free forever, no signup 💜 · <SupportButton variant="inline" />
                </p>
            </form>

            <WishInspirationModal
                isOpen={inspirationOpen}
                onClose={() => setInspirationOpen(false)}
                onSelectWish={(text) => { set({ message: text }); }}
            />
        </>
    );
}
