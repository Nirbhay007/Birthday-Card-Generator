'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { Crown, PencilLine, Link2, Check, Send } from 'lucide-react';
import AudioPlayer from '@/components/AudioPlayer';
import PremiumExperience from './PremiumExperience';
import Paywall from './Paywall';
import Reveal from './Reveal';
import CursorGlow from './CursorGlow';
import CustomizePanel, { EMPTY_CUSTOM } from './CustomizePanel';
import SupportCard from './SupportCard';
import { getOccasion, OCCASION_IDS } from './occasions';
import { PTHEME_IDS } from './looks';
import { REL_IDS, getTone } from './relationships';
import { TRACKS, PREMIUM_TRACKS, getTrackSrc } from '@/lib/music';

const DEVICE_KEY = 'bgen-premium-unlocked-v1'; // legacy session receipt
const KEYS_KEY = 'bgen-premium-keys-v1'; // remembered magic-link keys
const SNAP_KEY = 'bgen-premium-studio-v1'; // last paid universe (no key inside)
const SNAP_PARAMS = ['occasion', 'to', 'from', 'age', 'msg', 'rs', 'vs', 'theme', 'music', 'for'];

function readStoredKeys() {
    try {
        const raw = localStorage.getItem(KEYS_KEY);
        const arr = JSON.parse(raw || '[]');
        return Array.isArray(arr) ? arr.filter((k) => typeof k === 'string') : [];
    } catch {
        return [];
    }
}

function celebrate() {
    try {
        confetti({ particleCount: 220, spread: 100, origin: { y: 0.6 }, disableForReducedMotion: true, colors: ['#f2c14e', '#fff7dd', '#fb7185', '#c084fc'] });
    } catch {}
}

/**
 * /premium — live demo, teaser locker, and paywall in one cinematic page.
 * Personalize: /premium?occasion=anniversary&to=Priya&from=Rahul&age=2&msg=...
 * Paid access: /premium?...&key=unlock_… (magic link, no accounts needed).
 */
export default function PremiumPage({ to, from, message, age, occasion, unlockKey, customReasons, customVows, initialPTheme, initialMusic, initialRel, giftPreview }) {
    const deck = getOccasion(occasion);
    const [forceGift, setForceGift] = useState(false);
    // Gift mode = the recipient's eyes only: pure universe, zero studio
    // chrome (no ribbon, editor, paywall or closer). Magic links (?key=)
    // always open this way; ?gift=1 previews it. Deliberately no way out
    // from inside a gift view: recipients must never meet studio tools.
    // Owners edit at /premium on their own device (snapshot restores it).
    const giftMode = !!unlockKey || !!giftPreview || forceGift;
    const [ptheme, setPtheme] = useState(() => (PTHEME_IDS.includes(initialPTheme) ? initialPTheme : 'midnight'));
    const [music, setMusic] = useState(() => {
        // Premium-exclusive recordings first; every legacy id still plays.
        const ids = [...PREMIUM_TRACKS.map((t) => t.id), ...TRACKS.map((t) => t.id)];
        return ids.includes(initialMusic) ? initialMusic : 'beats';
    });
    const [rel, setRel] = useState(() => (REL_IDS.includes(initialRel) ? initialRel : ''));
    const tone = getTone(rel);
    // Studio identity: editable on-page (URL params only prefill). Recipients
    // in gift mode always see the link's values.
    const [toName, setToName] = useState(to);
    const [fromName, setFromName] = useState(from);
    const [ageInput, setAgeInput] = useState(age ? String(age) : '');
    const effTo = toName.trim() || to;
    const effFrom = fromName.trim() || from;
    const parsedAge = /^\d{1,3}$/.test(ageInput.trim()) ? parseInt(ageInput.trim(), 10) : NaN;
    const effAge = ageInput.trim() === '' ? age : Number.isFinite(parsedAge) && parsedAge >= 1 && parsedAge <= 120 ? parsedAge : null;
    // Lazy init: remembered keys unlock instantly (verified when first saved).
    // suppressHydrationWarning on <main> covers returning paid visitors.
    const [unlocked, setUnlocked] = useState(() => {
        try {
            if (typeof window === 'undefined') return false;
            if (sessionStorage.getItem(DEVICE_KEY)) return true;
            return readStoredKeys().length > 0;
        } catch {
            return false;
        }
    });
    const [lastKey, setLastKey] = useState(null);
    const [knownKey] = useState(() => {
        try {
            return readStoredKeys()[0] || null;
        } catch {
            return null;
        }
    });
    const [receiptIssue, setReceiptIssue] = useState(false);
    const [copied, setCopied] = useState(false);
    const [keyError, setKeyError] = useState(false);
    const [custom, setCustom] = useState(EMPTY_CUSTOM);
    const keyChecked = useRef(false);

    // Giver's live edits win; otherwise honour customs arriving via magic link.
    const editorActive =
        custom.letter.trim() ||
        custom.reasons.some((r) => r.t.trim() || r.d.trim()) ||
        custom.vows.some((v) => v.trim());
    const effectiveCustom = editorActive
        ? custom
        : customReasons?.length || customVows?.length
          ? { letter: '', reasons: customReasons || [], vows: customVows || [] }
          : null;

    const buildStudioParams = useCallback(
        (key) => {
            const p = new URLSearchParams();
            p.set('occasion', deck.id);
            p.set('to', effTo);
            p.set('from', effFrom);
            if (effAge) p.set('age', String(effAge));
            const letter = custom.letter.trim() || message || '';
            if (letter) p.set('msg', letter);
            const eff = editorActive
                ? custom
                : customReasons?.length || customVows?.length
                  ? { reasons: customReasons || [], vows: customVows || [] }
                  : null;
            const rs = (eff?.reasons || []).filter((r) => r.t || r.d);
            const vs = (eff?.vows || []).filter((v) => v);
            if (rs.length) p.set('rs', JSON.stringify(rs));
            if (vs.length) p.set('vs', JSON.stringify(vs));
            if (ptheme !== 'midnight') p.set('theme', ptheme);
            if (music !== 'beats') p.set('music', music);
            if (rel) p.set('for', rel);
            if (key) p.set('key', key);
            return p;
        },
        [deck.id, effTo, effFrom, effAge, message, custom, editorActive, customReasons, customVows, ptheme, music, rel]
    );

    const buildMagicLink = useCallback(
        (key) => {
            try {
                return `${window.location.origin}/premium?${buildStudioParams(key).toString()}`;
            } catch {
                return '';
            }
        },
        [buildStudioParams]
    );

    const linkKey = lastKey || knownKey;
    const magicLink = linkKey && !giftMode ? buildMagicLink(linkKey) : '';

    // Snapshot the paid universe (key excluded on purpose: restore lands in
    // YOUR studio, unlocked via remembered keys, never a stranger's gift).
    // Storage-only effect, no setState.
    const canSnapshot = !!(lastKey || (knownKey && unlocked));
    const snapString = canSnapshot ? JSON.stringify(Object.fromEntries(buildStudioParams(''))) : '';
    useEffect(() => {
        if (!snapString) return;
        try {
            localStorage.setItem(SNAP_KEY, snapString);
        } catch {}
    }, [snapString]);

    // Bare /premium + snapshot on this device = returning payer. Restore
    // their universe with a clean reload (server renders it, no hacks).
    // ?fresh=1 clears the snapshot for starting a brand-new gift.
    useEffect(() => {
        try {
            const q = new URLSearchParams(window.location.search);
            if (q.get('fresh')) {
                // Full reset for a brand-new gift: forget snapshot AND remembered
                // keys/session, so the studio returns to locked demo and can be
                // paid for again. (Paid magic links keep working independently.)
                try {
                    localStorage.removeItem(SNAP_KEY);
                    localStorage.removeItem(KEYS_KEY);
                    sessionStorage.removeItem(DEVICE_KEY);
                } catch {}
                window.location.replace('/premium');
                return;
            }
            if (SNAP_PARAMS.concat('key').some((k) => q.get(k))) return;
            const raw = localStorage.getItem(SNAP_KEY);
            if (!raw) return;
            const obj = JSON.parse(raw);
            const clean = new URLSearchParams();
            for (const k of SNAP_PARAMS) {
                const v = obj?.[k];
                if (typeof v === 'string' && v) clean.set(k, v);
            }
            if ([...clean].length === 0) return;
            window.location.replace(`/premium?${clean.toString()}`);
        } catch {}
    }, []);

    // URL magic link (?key=): verify once, then remember the key on this device.
    useEffect(() => {
        if (keyChecked.current || !unlockKey || unlocked) return;
        keyChecked.current = true;
        (async () => {
            try {
                const r = await fetch('/api/premium/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider: 'key', key: unlockKey }),
                });
                const d = await r.json().catch(() => ({}));
                if (d.success) {
                    const keys = readStoredKeys();
                    if (!keys.includes(unlockKey)) {
                        try { localStorage.setItem(KEYS_KEY, JSON.stringify([...keys, unlockKey])); } catch {}
                    }
                    // Remember this gift's shape too, so a later bare visit
                    // restores it (recipients recovering their universe).
                    try {
                        const q = new URLSearchParams(window.location.search);
                        const clean = {};
                        for (const k of SNAP_PARAMS) {
                            const v = q.get(k);
                            if (v) clean[k] = v;
                        }
                        if (Object.keys(clean).length) localStorage.setItem(SNAP_KEY, JSON.stringify(clean));
                    } catch {}
                    setUnlocked(true);
                    celebrate();
                } else {
                    setKeyError(true);
                }
            } catch {
                setKeyError(true);
            }
        })();
    }, [unlockKey, unlocked]);

    const scrollToPaywall = useCallback(() => {
        try { document.getElementById('prm-paywall')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    }, []);

    // Locker CTA lands on the editor, not the cash register: names and words
    // first, payment after they have seen what they are buying.
    const scrollToCustomize = useCallback(() => {
        try { document.getElementById('prm-customize')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    }, []);

    const handleUnlocked = useCallback(
        ({ testMode, unlockKey: key, receiptKept = true } = {}) => {
            try { sessionStorage.setItem(DEVICE_KEY, '1'); } catch {}
            if (key) {
                const keys = readStoredKeys();
                if (!keys.includes(key)) {
                    try { localStorage.setItem(KEYS_KEY, JSON.stringify([...keys, key])); } catch {}
                }
                setLastKey(key);
            } else if (!testMode && receiptKept === false) {
                // Real money moved but our receipt did not persist: the payer
                // is unlocked here, but must hear it straight + get a path.
                setReceiptIssue(true);
            }
            setUnlocked(true);
            celebrate();
            // Paid moment: land them exactly on the magic link (or the honest
            // notice when no link could be minted). Test unlocks continue in.
            setTimeout(() => {
                try { document.getElementById(key || receiptKept === false ? 'prm-magiclink' : 'prm-letter')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
            }, key ? 650 : 450);
        },
        []
    );

    const copyMagicLink = async () => {
        if (!magicLink) return;
        try {
            await navigator.clipboard.writeText(magicLink);
        } catch {
            try {
                const ta = document.createElement('textarea');
                ta.value = magicLink;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            } catch {}
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const whatsappHref = magicLink
        ? `https://wa.me/?text=${encodeURIComponent(`I made you something special. Open it when you are alone and can smile freely:\n${magicLink}`)}`
        : '';

    // Payer-only preview: see the universe exactly as the recipient will.
    // A history entry is pushed so the browser BACK button exits the preview
    // instead of dumping the giver out of the site mid-purchase.
    const previewAsRecipient = () => {
        try {
            window.history.pushState({ prmPreview: true }, '');
        } catch {}
        setForceGift(true);
        setTimeout(() => {
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
        }, 80);
    };
    const exitPreview = () => {
        setForceGift(false);
        setTimeout(() => {
            try { document.getElementById('prm-magiclink')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
        }, 80);
    };

    // Browser back inside the preview returns to the studio, not off-site.
    // Event-handler setState only — no effect-lint concerns.
    useEffect(() => {
        const onPopState = () => setForceGift(false);
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);
    // Occasion pills carry the ENTIRE studio state, so switching vibes never
    // drops names, words, look, music or relationship (reload-safe too).
    const studioHref = (occId) => {
        try {
            const p = buildStudioParams('');
            p.set('occasion', occId);
            return `/premium?${p.toString()}`;
        } catch {
            return `/premium?occasion=${occId}`;
        }
    };

    return (
        <main className="min-h-screen bg-[#070412] text-[#f6f1e7]" data-ptheme={ptheme} suppressHydrationWarning>
            <CursorGlow />
            {forceGift && (lastKey || knownKey) && (
                <button
                    type="button"
                    onClick={exitPreview}
                    className="fixed bottom-20 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-extrabold text-white shadow-2xl transition-all max-w-[calc(100vw-2rem)]"
                >
                    ← Back to your magic link
                </button>
            )}
            {/* Studio ribbon (givers only — recipients never see this) */}
            {!giftMode && (
            <div className="sticky top-0 z-40 border-b border-[rgba(242,193,78,0.25)] bg-[rgba(7,4,18,0.85)] backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-[#f2c14e] shrink-0" aria-hidden="true" />
                        <span className="text-[#cfc4e8]">
                            <strong className="text-[#f7dc9a]">Premium studio.</strong>{' '}
                            <span className="hidden sm:inline">Names first, then words, then unlock. </span>
                            <span className="inline-flex items-center gap-3">
                                <button type="button" onClick={scrollToCustomize} className="underline decoration-dotted underline-offset-4 hover:text-white inline-flex items-center gap-1">
                                    <PencilLine className="w-3.5 h-3.5" aria-hidden="true" /> Start below
                                </button>
                                <Link href="/premium?fresh=1" title="Forget this device's saved universe and start over" className="underline decoration-dotted underline-offset-4 hover:text-white">
                                    Start fresh
                                </Link>
                            </span>
                        </span>
                    </span>
                    <span className="inline-flex flex-wrap items-center justify-center gap-1" role="group" aria-label="Pick an occasion">
                        {OCCASION_IDS.map((id) => (
                            <Link
                                key={id}
                                href={studioHref(id)}
                                aria-current={deck.id === id ? 'true' : undefined}
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${deck.id === id ? 'bg-[#f2c14e] text-[#241031]' : 'text-[#b9aed4] hover:text-white border border-white/15'}`}
                            >
                                {getOccasion(id).label}
                            </Link>
                        ))}
                    </span>
                </div>
            </div>
            )}

            {keyError && (
                <p role="alert" className="max-w-xl mx-auto mt-4 px-4 text-center text-xs font-semibold text-[#fda4af]">
                    That link did not unlock anything. It may be mistyped. The preview below is still free.
                    Paid already? WhatsApp us your payment ID (link below) and we will fix it.
                </p>
            )}

            {/* Fresh-purchase magic link: lands in view right after paying */}
            {receiptIssue && !magicLink && (
                <div id="prm-magiclink" className="max-w-2xl mx-auto px-4 mt-6 scroll-mt-24">
                    <div className="rounded-2xl border border-amber-400/50 bg-amber-400/[0.07] p-5 text-center">
                        <p className="font-extrabold text-[#f7dc9a] mb-1">You are unlocked on this device. One honest note.</p>
                        <p className="text-xs text-[#b9aed4] mb-4 leading-relaxed">
                            Your payment went through, but our receipt book hiccuped, so we could not
                            mint your permanent shareable link yet. Nothing is lost. Message us your
                            payment ID on WhatsApp and we will send your link within a day.
                        </p>
                        <SupportCard compact />
                    </div>
                </div>
            )}
            {magicLink && !giftMode && (
                <div id="prm-magiclink" className="max-w-2xl mx-auto px-4 mt-6 scroll-mt-24">
                    <div className="rounded-2xl border border-[rgba(242,193,78,0.5)] bg-[rgba(242,193,78,0.08)] p-5 text-center">
                        <p className="font-extrabold text-[#f7dc9a] mb-1">{lastKey ? `🎉 Universe unlocked. Now send it to ${effTo}!` : '🔗 Your magic link. Still yours.'}</p>
                        <p className="text-xs text-[#b9aed4] mb-4">{lastKey ? 'This magic link opens the full experience on any device. No account, no expiry. Send it before you forget.' : 'Opens the full experience on any device. No account, no expiry.'}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <code className="flex-1 min-w-0 truncate rounded-xl bg-black/40 border border-white/10 px-3 py-2.5 text-[11px] text-left text-[#e9e2f5]">{magicLink}</code>
                            <div className="grid grid-cols-2 sm:flex gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={copyMagicLink}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] text-sm font-extrabold hover:opacity-95 transition-opacity"
                                >
                                    {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />}
                                    {copied ? 'Copied!' : 'Copy link'}
                                </button>
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-extrabold hover:brightness-105 transition-all"
                                    aria-label={`Send the magic link to ${effTo} on WhatsApp`}
                                >
                                    <Send className="w-4 h-4" aria-hidden="true" /> WhatsApp
                                </a>
                                <button
                                    type="button"
                                    onClick={previewAsRecipient}
                                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-extrabold hover:bg-white/10 transition-all"
                                >
                                    <span aria-hidden="true">👁</span> See what {effTo} sees
                                </button>
                            </div>
                        </div>
                        <div className="mt-3">
                            <SupportCard compact />
                        </div>
                    </div>
                </div>
            )}

            <PremiumExperience
                to={effTo}
                from={effFrom}
                message={message}
                age={effAge}
                deck={deck}
                custom={effectiveCustom}
                tone={tone}
                unlocked={unlocked}
                giftMode={giftMode}
                onUnlockRequest={scrollToCustomize}
                audioSlot={<AudioPlayer track={music} src={getTrackSrc(music) || '/happy-birthday.mp3'} />}
            />

            {!giftMode && (
                <CustomizePanel deck={deck} to={effTo} value={custom} onChange={setCustom} ptheme={ptheme} onPThemeChange={setPtheme} music={music} onMusicChange={setMusic} rel={rel} onRelChange={setRel} toName={toName} fromName={fromName} ageInput={ageInput} onToChange={setToName} onFromChange={setFromName} onAgeChange={setAgeInput} showContinue={!unlocked} onContinue={scrollToPaywall} />
            )}

            {!unlocked && !giftMode && <Paywall onUnlocked={handleUnlocked} />}

            {!unlocked && !giftMode && (
                <div className="max-w-xl mx-auto px-5 sm:px-8 pb-4">
                    <SupportCard />
                </div>
            )}

            {/* Giver-facing closer (recipients never see the sales pitch) */}
            {!giftMode && (
            <section className="relative px-5 sm:px-8 pb-24 pt-4" aria-label="How premium works">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="prm-divider mb-14" aria-hidden="true" />
                    <Reveal><p className="prm-eyebrow mb-6">✦ How gifting premium works ✦</p></Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                        {[
                            { n: '1', t: 'Preview the magic', d: 'Unseal Act I above. It is free. Feel exactly what they will feel in the first ten seconds.' },
                            { n: '2', t: 'Make it theirs, then unlock', d: 'Add names, write it in your words, pick the look and music. ₹49 / $1, one payment, no account.' },
                            { n: '3', t: 'Send the magic link', d: 'You get a private link that opens everything on any device. Then wait for the voice note. There is always a voice note.' },
                        ].map((s, i) => (
                            <Reveal key={s.t} delay={i * 120}>
                                <div className="prm-card rounded-2xl p-6 h-full">
                                    <p className="prm-serif text-4xl font-extrabold prm-gold-text" aria-hidden="true">{s.n}</p>
                                    <h3 className="font-bold text-[#f7dc9a] mt-2 mb-1.5">{s.t}</h3>
                                    <p className="text-sm leading-relaxed text-[#b9aed4]">{s.d}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                    <Reveal delay={150}>
                        <p className="prm-lead text-sm mt-10 max-w-xl mx-auto">
                            A WhatsApp happy birthday costs nothing and is worth exactly that.
                            This costs less than chai for two, and lands like you hired an orchestra.
                        </p>
                    </Reveal>
                </div>
            </section>
            )}
        </main>
    );
}
