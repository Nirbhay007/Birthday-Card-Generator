'use client';

import { useState } from 'react';
import { Check, Sparkles, Palette, Music as MusicIcon } from 'lucide-react';
import { fill } from './occasions';
import { PTHEMES } from './looks';
import { RELATIONSHIPS, getTone } from './relationships';
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
 * "Make it yours" — four small steps in plain language. Each step says where
 * its words appear, offers the occasion template as a starting point, and
 * everything flows into the unlocked experience AND the magic link.
 */
export default function CustomizePanel({ deck, to, value, onChange, ptheme, onPThemeChange, music, onMusicChange, rel, onRelChange, toName, fromName, ageInput, onToChange, onFromChange, onAgeChange, showContinue, onContinue }) {
    const [filled, setFilled] = useState(null);
    const tone = getTone(rel);

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
        set({ letter: (tone.letterMid || deck.letterMid).slice(0, LIMITS.letter) });
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

                    {/* Who is it for — sets the tone of voice */}
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
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${rel === r.id ? 'bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031]' : 'border border-white/15 text-[#b9aed4] hover:text-white hover:border-white/35'}`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            {rel && tone.id !== 'romantic' && deck.id === 'birthday' && (
                                <p className="text-[11px] leading-relaxed text-[#f7dc9a]/90 bg-[rgba(242,193,78,0.07)] border border-[rgba(242,193,78,0.25)] rounded-xl px-3.5 py-2.5">
                                    Heads up: Birthday words lean a little romantic. Tweak them below in your voice, or switch to the Friendship occasion up top for playful.
                                </p>
                            )}
                        </div>
                    </Reveal>

                    {/* Step 1 — the letter */}
                    <Reveal>
                        <div className={stepCls}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-extrabold text-[#f7dc9a]">3. The heart of it</p>
                                    <p className="text-xs text-[#b9aed4] mt-0.5">One honest paragraph. This becomes the middle of the letter in Act II.</p>
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
                                    onChange={(e) => set({ letter: e.target.value })}
                                    placeholder="That story only you two know. The night everything changed. The thing they did last month that you still think about..."
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

                    {/* Step 2 — reasons */}
                    <Reveal>
                        <div className={stepCls}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-extrabold text-[#f7dc9a]">4. Three reasons</p>
                                    <p className="text-xs text-[#b9aed4] mt-0.5">One line each. These become the star cards in Act III.</p>
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
                                            placeholder={['A title, like “Fries thief”', 'Another title', 'One more'][i]}
                                            aria-label={`Reason ${i + 1} title`}
                                            className={inputCls}
                                        />
                                        <input
                                            value={r.d}
                                            maxLength={LIMITS.line}
                                            onChange={(e) => setReason(i, { d: e.target.value })}
                                            placeholder="And the one line story behind it"
                                            aria-label={`Reason ${i + 1} story`}
                                            className={inputCls}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* Step 3 — vows */}
                    <Reveal>
                        <div className={stepCls}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-extrabold text-[#f7dc9a]">5. Three promises</p>
                                    <p className="text-xs text-[#b9aed4] mt-0.5">Funny is fine. Soppy is fine. These seal Act IV.</p>
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
                                        placeholder={['I vow to always...', 'I vow to never...', 'I vow that ten years from now...'][i]}
                                        aria-label={`Promise ${i + 1}`}
                                        className={inputCls}
                                    />
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* Step 4 — look and sound */}
                    <Reveal>
                        <div className={stepCls}>
                            <p className="font-extrabold text-[#f7dc9a] inline-flex items-center gap-1.5">
                                <Palette className="w-4 h-4" aria-hidden="true" /> 6. The look
                            </p>
                            <p className="text-xs text-[#b9aed4] -mt-3">The whole universe repaints itself. Pick the one that feels like them.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="radiogroup" aria-label="Premium look">
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
                            <p className="text-xs text-[#b9aed4] -mt-3">Starts playing the moment they break the seal. Real studio recordings, reserved for premium. Royalty-free, cleared for gifting.</p>
                            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Music">
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
                            </div>
                        </div>
                    </Reveal>

                    <Reveal>
                        <p className="text-center text-xs text-[#6d6486] inline-flex items-center justify-center gap-1.5 w-full">
                            <Sparkles className="w-3.5 h-3.5 text-[#f2c14e]" aria-hidden="true" />
                            Your words, look and music all travel inside the magic link after you unlock.
                        </p>
                    </Reveal>

                    {showContinue && (
                        <Reveal>
                            <button
                                type="button"
                                onClick={onContinue}
                                className="prm-shimmer-btn w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#f2c14e] to-[#fb7185] text-[#241031] font-extrabold text-base transition-transform hover:scale-[1.01] active:scale-95"
                            >
                                Looking perfect. Continue to unlock
                                <span aria-hidden="true">→</span>
                            </button>
                        </Reveal>
                    )}
                </div>
            </div>
        </section>
    );
}
