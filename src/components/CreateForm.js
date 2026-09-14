'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhotoUploader from './PhotoUploader';
import CinemaTeaserCard from './premium/CinemaTeaserCard';
import WishInspirationModal from './WishInspirationModal';
import SupportButton from './SupportButton';
import {
    Loader2, Sparkles, Bell, ArrowLeft, ArrowRight, Check,
    User, Palette, Camera, Heart, Laugh, Scissors, Music, Crown, Play, Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FREE_TRACKS, VIP_TRACKS, ALL_TRACKS, getTrackName, playAudioPreview, stopAllAudioPreviews } from '@/lib/music';

const DRAFT_KEY = 'birthdaygen-draft-v1';

const THEMES = [
    // 2 Free Themes
    { id: 'fun', name: 'Fun & Colorful', color: '#ff69b4', bg: '#fff0f5', textColor: '#262626', badge: 'Free' },
    { id: 'elegant', name: 'Classic Ivory', color: '#d4af37', bg: '#fdfbf7', textColor: '#2c2c2c', badge: 'Free' },
    // VIP Themes (unlocked with paid ₹29 upgrade)
    { id: 'royal', name: 'Royal Gold', color: '#f5c518', bg: '#120722', textColor: '#fff9e6', vip: true },
    { id: 'neon', name: 'Cyber Neon', color: '#00f2fe', bg: '#070814', textColor: '#ffffff', vip: true },
    { id: 'midnight', name: 'Cosmic Galaxy', color: '#818cf8', bg: '#060919', textColor: '#f1f5f9', vip: true },
    { id: 'princess', name: 'Fairy Princess', color: '#ec4899', bg: '#fff2f6', textColor: '#701a3c', vip: true },
    { id: 'retro', name: 'Retro Arcade', color: '#39ff14', bg: '#12131c', textColor: '#ffffff', vip: true },
    { id: 'sunset', name: 'Sunset Luxe', color: '#ff9052', bg: '#1f0b24', textColor: '#fff5eb', vip: true },
];

const FORM_TRACKS = [
    ...FREE_TRACKS,
    ...VIP_TRACKS,
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

function formatDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const FROM_MAP = {
    'wishes/best-friend': { relationship: 'Best Friend', theme: 'fun' },
    'wishes/mom': { relationship: 'Mom', theme: 'princess' },
    'wishes/dad': { relationship: 'Dad', theme: 'elegant' },
    'wishes/sister': { relationship: 'Sister', theme: 'princess' },
    'wishes/brother': { relationship: 'Brother', theme: 'retro' },
    'wishes/romantic': { relationship: 'Partner', theme: 'royal' },
    'wishes/husband': { relationship: 'Husband', theme: 'royal' },
    'wishes/wife': { relationship: 'Wife', theme: 'royal' },
    'wishes/boyfriend': { relationship: 'Boyfriend', theme: 'midnight' },
    'wishes/girlfriend': { relationship: 'Girlfriend', theme: 'princess' },
    'wishes/son': { relationship: 'Son', theme: 'unicorn' },
    'wishes/daughter': { relationship: 'Daughter', theme: 'unicorn' },
    'wishes/grandma': { relationship: 'Grandma', theme: 'elegant' },
    'wishes/grandpa': { relationship: 'Grandpa', theme: 'elegant' },
    'wishes/coworker': { relationship: 'Colleague', theme: 'minimal' },
    'wishes/teacher': { relationship: 'Teacher', theme: 'elegant' },
    'wishes/funny': { relationship: 'Friend', theme: 'fun' },
    'wishes/short-sweet': { relationship: 'Friend', theme: 'fun' },
};

export default function CreateForm({ formData, setFormData }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [inspirationOpen, setInspirationOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [nameError, setNameError] = useState('');
    const [dateError, setDateError] = useState('');
    const [toneMsg, setToneMsg] = useState('');
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [createdCard, setCreatedCard] = useState(null);
    const [previewTrackId, setPreviewTrackId] = useState(null);
    const audioControllerRef = useRef(null);
    const [wishLoadedNotice, setWishLoadedNotice] = useState('');
    const wishAppliedRef = useRef(false);

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

    // Allow belated birthdays up to 30 days in the past, and upcoming up to 365 days ahead
    const { minDate, maxDate } = React.useMemo(() => {
        const now = new Date();
        const min = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        const max = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 365);
        return {
            minDate: formatDateInputValue(min),
            maxDate: formatDateInputValue(max),
        };
    }, []);
    const restoredRef = useRef(false);
    // Guards against accidental submits: the Generate button sits exactly
    // where Continue was, so a double-click/double-tap on Continue would
    // otherwise land its second click on Generate and submit instantly.
    const stepShownAt = useRef(0);
    const armedSubmit = useRef(false);
    const formRef = useRef(null);

    const scrollToFormTop = () => {
        setTimeout(() => {
            const el = document.getElementById('create') || formRef.current;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    };

    const set = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

    // Timestamp each step + drop focus so a stray Enter/Space can't
    // re-trigger the just-unmounted Continue button.
    useEffect(() => {
        stepShownAt.current = Date.now();
        armedSubmit.current = false;
        try { document.activeElement?.blur?.(); } catch { }
    }, [step]);

    // Restore autosaved draft once (only when form is untouched and no incoming wish param)
    useEffect(() => {
        if (restoredRef.current) return;
        restoredRef.current = true;
        const t = setTimeout(() => {
            try {
                if (wishAppliedRef.current) return;
                const raw = localStorage.getItem(DRAFT_KEY);
                if (!raw) return;
                const draft = JSON.parse(raw);
                if (draft && (draft.recipientName || draft.message)) {
                    setFormData((prev) => {
                        const untouched = !prev.recipientName && !prev.message && (prev.photos || []).length === 0;
                        if (untouched) {
                            const { savedStep: _s, ...restDraft } = draft;
                            return { ...prev, ...restDraft };
                        }
                        return prev;
                    });
                    if (draft.savedStep && draft.savedStep >= 1 && draft.savedStep <= 3) {
                        setStep(draft.savedStep);
                    }
                }
            } catch { }
        }, 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Autosave draft on change (skip empty)
    useEffect(() => {
        try {
            if (formData.recipientName || formData.message || (formData.photos || []).length > 0) {
                const cleanPhotos = (formData.photos || []).filter((p) => typeof p === 'string' && p.startsWith('http'));
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...formData, photos: cleanPhotos, savedStep: step, savedAt: Date.now() }));
            }
        } catch { }
    }, [formData, step]);

    // Auto-populate message if user arrived from /wishes/[slug] or /ages/[age] with ?wish=...
    useEffect(() => {
        const wishParam = searchParams.get('wish');
        const fromParam = searchParams.get('from');

        if (wishParam && !wishAppliedRef.current) {
            wishAppliedRef.current = true;
            const patch = { message: wishParam };

            if (fromParam && FROM_MAP[fromParam]) {
                patch.relationship = FROM_MAP[fromParam].relationship;
                patch.theme = FROM_MAP[fromParam].theme;
            } else if (fromParam) {
                const ageMatch = fromParam.match(/^ages\/(\d+)$/);
                if (ageMatch) {
                    patch.age = parseInt(ageMatch[1], 10);
                }
            }

            if (fromParam && /^(wishes|ages)\/[a-z0-9-]+$/.test(fromParam)) {
                patch.source = fromParam;
            }

            setFormData((prev) => ({ ...prev, ...patch }));
            setWishLoadedNotice('✨ Selected wish loaded into your card! Enter their name below to begin.');

            // Scroll smoothly to creator form
            setTimeout(() => {
                const el = document.getElementById('create');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [searchParams, setFormData]);

    const goNext = () => {
        if (step === 1) {
            if (!formData.recipientName.trim()) {
                setNameError('Please add their name — it makes the whole surprise personal ✨');
                return;
            }
            if (formData.birthdayDate) {
                if (formData.birthdayDate < minDate) {
                    setDateError('Date cannot be more than 30 days in the past (for belated wishes)');
                    return;
                }
                if (formData.birthdayDate > maxDate) {
                    setDateError('Please select a birthday within the next 12 months');
                    return;
                }
            }
        }
        setNameError('');
        setDateError('');
        setStep((s) => Math.min(3, s + 1));
        scrollToFormTop();
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
        if (formData.birthdayDate) {
            if (formData.birthdayDate < minDate) {
                setStep(1);
                setDateError('Date cannot be more than 30 days in the past (for belated wishes)');
                return;
            }
            if (formData.birthdayDate > maxDate) {
                setStep(1);
                setDateError('Please select a birthday within the next 12 months');
                return;
            }
        }
        setLoading(true);
        setLoadingMessage('Uploading photos...');
        try {
            const finalPhotoUrls = [];
            const rawPhotos = formData.photos || [];
            for (let i = 0; i < rawPhotos.length; i++) {
                const item = rawPhotos[i];
                if (typeof item === 'string') {
                    finalPhotoUrls.push(item);
                } else if (item && item.file) {
                    setLoadingMessage(`Uploading photo ${i + 1} of ${rawPhotos.length}...`);
                    const fd = new FormData();
                    fd.append('file', item.file);
                    const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
                    const uploadData = await uploadRes.json();
                    if (uploadData.success && uploadData.url) {
                        finalPhotoUrls.push(uploadData.url);
                    } else {
                        throw new Error(uploadData.error || 'Failed to upload photo');
                    }
                }
            }

            setLoadingMessage('Wrapping your surprise...');
            const res = await fetch('/api/birthday', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    photos: finalPhotoUrls,
                }),
            });
            const data = await res.json();
            if (data.success) {
                try {
                    localStorage.removeItem(DRAFT_KEY);
                    localStorage.setItem(`bgen_owner_${data.id}`, '1');
                } catch { }
                router.push(`/b/${data.id}?created=1`);
            } else {
                alert('Failed to create page: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating page:', error);
            alert(error.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    const suggestedTheme = formData.relationship ? THEME_SUGGESTION[formData.relationship] : null;
    const themeName = (THEMES.find((t) => t.id === formData.theme) || {}).name || formData.theme;

    return (
        <>
            <form ref={formRef} onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-purple-100">
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
                                    onClick={() => {
                                        if (s.id < step || s.id === 1) {
                                            setStep(s.id);
                                            scrollToFormTop();
                                        }
                                    }}
                                    className={cn(
                                        'w-full flex items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-bold transition-all',
                                        active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                            : done ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer'
                                                : 'bg-gray-100 text-gray-400'
                                    )}
                                    aria-current={active ? 'step' : undefined}
                                >
                                    {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">{i + 1}. {s.label}</span>
                                    <span className="sm:hidden">{i + 1}</span>
                                </button>
                            </li>
                        );
                    })}
                </ol>

                {/* STEP 1 — Who */}
                {step === 1 && (
                    <div className="space-y-5 pop-in">
                        {wishLoadedNotice && (
                            <div className="flex items-center justify-between gap-2 p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs font-semibold shadow-xs">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                                    {wishLoadedNotice}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setWishLoadedNotice('')}
                                    className="text-purple-600 hover:text-purple-800 font-bold px-1.5 py-0.5 rounded hover:bg-purple-100 transition-colors"
                                    aria-label="Dismiss notice"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
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
                                    min={minDate}
                                    max={maxDate}
                                    className={cn(inputCls, dateError && 'border-red-400 ring-2 ring-red-100')}
                                    value={formData.birthdayDate || ''}
                                    onChange={(e) => {
                                        set({ birthdayDate: e.target.value });
                                        if (dateError) setDateError('');
                                    }}
                                />
                                {dateError ? (
                                    <p className="text-xs text-red-600 font-semibold mt-1.5">{dateError}</p>
                                ) : (
                                    <p className="text-[11px] text-gray-400 mt-1">Upcoming or up to 30 days belated</p>
                                )}
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
                            <div className="flex items-center justify-between mb-1.5">
                                <span id="theme-label" className="text-sm font-semibold text-gray-800">
                                    Choose visual theme
                                </span>
                                <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
                                    2 Free · 6 VIP Themes 👑
                                </span>
                            </div>
                            {suggestedTheme && suggestedTheme !== formData.theme && (
                                <button
                                    type="button"
                                    onClick={() => set({ theme: suggestedTheme })}
                                    className="mb-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                                >
                                    ✨ Recommended for {formData.relationship || 'them'}: {(THEMES.find((t) => t.id === suggestedTheme) || {}).name} — tap to apply
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
                                            'relative p-3 rounded-2xl border-2 transition-all text-left overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer',
                                            formData.theme === theme.id
                                                ? theme.vip
                                                    ? 'border-amber-400 ring-2 ring-amber-300/60 shadow-lg scale-[1.02]'
                                                    : 'border-purple-600 ring-2 ring-purple-200 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                        )}
                                        style={{ backgroundColor: theme.bg }}
                                    >
                                        <div className="relative z-10">
                                            <div
                                                className="w-7 h-7 rounded-full mb-2 border-2 border-white/60 shadow-xs flex items-center justify-center text-[10px]"
                                                style={{ backgroundColor: theme.color }}
                                            >
                                                {theme.vip ? '👑' : '✨'}
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold block" style={{ color: theme.textColor }}>
                                                {theme.name}
                                            </span>
                                            <span className="text-[10px] opacity-75 font-medium block" style={{ color: theme.textColor }}>
                                                {theme.vip ? 'Luminous VIP Glow' : 'Simple & Clean'}
                                            </span>
                                        </div>
                                        {theme.vip ? (
                                            <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-gradient-to-r from-amber-300 to-amber-400 text-gray-950 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                                                👑 VIP
                                            </span>
                                        ) : (
                                            <span className="absolute top-2 right-2 text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                                                Free
                                            </span>
                                        )}
                                        {formData.theme === theme.id && (
                                            <div className="absolute bottom-2 right-2 text-amber-500" aria-hidden="true">
                                                <Check className="w-4 h-4 font-bold" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {THEMES.find((t) => t.id === formData.theme)?.vip && (
                                <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/60 to-purple-50 border border-amber-300/80 flex items-center gap-2.5 text-xs text-amber-950 pop-in shadow-2xs">
                                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>
                                        <strong>{(THEMES.find((t) => t.id === formData.theme) || {}).name} (VIP Theme)</strong>: Radiant illuminated borders, custom luxury gift box, and glowing atmosphere selected!
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                                    <Music className="w-4 h-4 text-purple-600" /> Birthday soundtrack
                                </span>
                                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                    1 Free Tune · 6 VIP Soundtracks 👑
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="radiogroup" aria-label="Music choice">
                                {FORM_TRACKS.map((t) => {
                                    const isPlayingThis = previewTrackId === t.id;
                                    const isSelected = (formData.music || 'classic') === t.id;
                                    return (
                                        <div
                                            key={t.id}
                                            role="radio"
                                            tabIndex={0}
                                            aria-checked={isSelected}
                                            onClick={() => set({ music: t.id })}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set({ music: t.id }); } }}
                                            className={cn(
                                                'p-3 rounded-2xl border-2 text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-600 relative group flex flex-col justify-between select-none',
                                                isSelected
                                                    ? t.vip
                                                        ? 'border-amber-400 bg-amber-50/70 ring-2 ring-amber-300/60 shadow-md'
                                                        : 'border-purple-600 bg-purple-50 ring-2 ring-purple-200 shadow-sm'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            )}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="text-xl" aria-hidden="true">{t.emoji}</span>
                                                    {t.vip ? (
                                                        <span className="text-[9px] font-extrabold bg-[#f2c14e] text-[#241031] px-1.5 py-0.5 rounded-full shadow-2xs">
                                                            👑 VIP
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                                                            Free
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="block text-xs font-bold text-gray-900 leading-snug">{t.name}</span>
                                                <span className="block text-[10.5px] text-gray-500 leading-tight mt-0.5">{t.desc}</span>
                                            </div>
                                            {t.id !== 'off' && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        set({ music: t.id });
                                                        toggleAudioPreview(e, t.id);
                                                    }}
                                                    className={cn(
                                                        'mt-2.5 w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs',
                                                        isPlayingThis
                                                            ? 'bg-amber-400 text-gray-950 ring-2 ring-amber-300 animate-pulse'
                                                            : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                                                    )}
                                                    title={isPlayingThis ? 'Stop preview' : 'Listen to preview'}
                                                >
                                                    {isPlayingThis ? (
                                                        <>
                                                            <Square className="w-2.5 h-2.5 fill-gray-950" />
                                                            <span>Stop</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-2.5 h-2.5 fill-purple-800" />
                                                            <span>Preview</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {FORM_TRACKS.find((t) => t.id === formData.music)?.vip && (
                                <div className="mt-2.5 p-3 rounded-2xl bg-purple-50/90 border border-purple-200/90 flex items-center gap-2.5 text-xs text-purple-950 pop-in shadow-2xs">
                                    <Crown className="w-4 h-4 text-purple-600 shrink-0" />
                                    <span>
                                        You selected <strong>{(FORM_TRACKS.find((t) => t.id === formData.music) || {}).name}</strong>. Ready to play on your card!
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3 — Photos & Finish */}
                {step === 3 && (
                    <div className="space-y-5 pop-in">
                        <div>
                            <span className="block text-sm font-semibold text-gray-800 mb-1">
                                Add favorite photos <span className="text-gray-500 text-xs font-normal">(up to 9 photos)</span>
                            </span>
                            <PhotoUploader
                                photos={formData.photos}
                                setPhotos={(photos) => setFormData((prev) => ({ ...prev, photos: typeof photos === 'function' ? photos(prev.photos) : photos }))}
                                maxPhotos={9}
                            />
                            {(formData.photos || []).length > 2 && (
                                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 pop-in">
                                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>{(formData.photos || []).length} photos added! Cherished memory gallery (3–9 photos) unlocks for ₹29 on creation, or keep first 2 in free mode.</span>
                                </div>
                            )}
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
                                Photos stay active 7 days after the birthday — tick below to keep them for next year 💜
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

                        {/* Mobile-only Premium Teaser — desktop sees this in the LivePreview sidebar */}
                        <div className="lg:hidden mt-2">
                            <CinemaTeaserCard
                                recipientName={formData.recipientName}
                                senderName={formData.senderName}
                                relationship={formData.relationship}
                                photoSrc={
                                    formData.photos && formData.photos.length > 0
                                        ? (typeof formData.photos[0] === 'string' ? formData.photos[0] : formData.photos[0]?.preview)
                                        : null
                                }
                                compact
                            />
                        </div>
                    </div>
                )}

                {/* Nav — stacked on phones (Generate on top), side-by-side on desktop */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 mt-8">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => {
                                setStep((s) => s - 1);
                                scrollToFormTop();
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-purple-300 hover:text-purple-700 transition-all cursor-pointer"
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
                            className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-[0.98] disabled:transform-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 cursor-pointer"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> {loadingMessage || 'Wrapping your surprise...'}</>
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
