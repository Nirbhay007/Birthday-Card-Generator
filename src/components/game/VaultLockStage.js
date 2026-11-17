'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, KeyRound, HelpCircle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from './gameAudio';

export default function VaultLockStage({ recipientName, senderName, vaultCode = '1234', vaultClue, onComplete }) {
    const codeLength = (vaultCode || '1234').length;
    const [enteredCode, setEnteredCode] = useState('');
    const [isError, setIsError] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const defaultClue = `A secret code chosen with love by ${senderName || 'your loved one'}. (Hint: Could it be your birthday date, lucky number, or a special anniversary?)`;
    const activeClue = vaultClue || defaultClue;

    const handleKeyPress = (num) => {
        if (isUnlocked) return;
        if (enteredCode.length >= codeLength) return;

        soundEngine.playTick();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(15);
        }

        const next = enteredCode + num;
        setEnteredCode(next);
        setIsError(false);

        // Auto check when complete length entered
        if (next.length === codeLength) {
            checkCode(next);
        }
    };

    const handleDelete = () => {
        if (isUnlocked) return;
        soundEngine.playTick();
        setEnteredCode((prev) => prev.slice(0, -1));
        setIsError(false);
    };

    const checkCode = (candidate) => {
        const target = (vaultCode || '1234').trim().toLowerCase();
        const input = candidate.trim().toLowerCase();

        if (input === target) {
            // Success!
            setIsUnlocked(true);
            soundEngine.playFanfare();
            confetti({
                particleCount: 60,
                spread: 80,
                origin: { y: 0.55 },
                colors: ['#f59e0b', '#fbbf24', '#d97706', '#ec4899'],
            });
            setTimeout(() => {
                onComplete && onComplete();
            }, 1400);
        } else {
            // Incorrect
            setIsError(true);
            soundEngine.playBuzzer();
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([30, 50, 30]);
            }
            setTimeout(() => {
                setEnteredCode('');
                setIsError(false);
            }, 800);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto px-4 py-6 text-center">
            {/* Header */}
            <div className="mb-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-md">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    Chapter III: The Secret Vault
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Crack {recipientName}&apos;s Birthday Vault
                </h2>
                <p className="text-xs sm:text-sm text-gray-300">
                    The final seal guarding your hidden letter & mystery gift!
                </p>
            </div>

            {/* Vault Body */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 border border-amber-400/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-xl">
                {/* Clue Card */}
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>The Clue:</span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed italic">
                        &ldquo;{activeClue}&rdquo;
                    </p>
                </div>

                {/* Dial / Code Display */}
                <div className="mb-6 flex justify-center items-center gap-3">
                    {Array.from({ length: codeLength }).map((_, idx) => {
                        const char = enteredCode[idx];
                        return (
                            <motion.div
                                key={idx}
                                animate={
                                    isError
                                        ? { x: [-10, 10, -8, 8, -4, 4, 0] }
                                        : isUnlocked
                                        ? { scale: [1, 1.15, 1], borderColor: '#10b981' }
                                        : {}
                                }
                                transition={{ duration: 0.4 }}
                                className={`w-12 h-14 rounded-2xl flex items-center justify-center font-mono text-2xl font-black transition-all ${
                                    isUnlocked
                                        ? 'bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                                        : isError
                                        ? 'bg-red-950/80 border-2 border-red-500 text-red-300'
                                        : char
                                        ? 'bg-amber-950/60 border-2 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                        : 'bg-slate-800/60 border border-white/10 text-gray-500'
                                }`}
                            >
                                {char ? (isUnlocked ? char : '●') : ''}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Lock Status Icon */}
                <div className="mb-6 flex justify-center">
                    <motion.div
                        animate={
                            isUnlocked
                                ? { rotate: [0, -15, 0], scale: 1.1 }
                                : isError
                                ? { rotate: [-10, 10, -10, 0] }
                                : {}
                        }
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                            isUnlocked
                                ? 'bg-emerald-500 text-gray-950 shadow-emerald-500/50'
                                : 'bg-slate-800 border border-white/15 text-amber-400'
                        }`}
                    >
                        {isUnlocked ? (
                            <Unlock className="w-7 h-7 stroke-[2.5]" />
                        ) : (
                            <Lock className="w-7 h-7 stroke-[2.5]" />
                        )}
                    </motion.div>
                </div>

                {/* Tactile Keypad */}
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => handleKeyPress(num.toString())}
                            disabled={isUnlocked}
                            className="h-13 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 text-xl font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="h-13 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        title="Need a hint?"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span>Hint</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleKeyPress('0')}
                        disabled={isUnlocked}
                        className="h-13 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 active:scale-95 text-xl font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                        0
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isUnlocked}
                        className="h-13 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                        ⌫
                    </button>
                </div>

                {/* Hint Disclosure */}
                <AnimatePresence>
                    {showHint && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-3 rounded-xl bg-purple-900/40 border border-purple-400/30 text-xs text-purple-200"
                        >
                            💡 <strong>Secret Clue:</strong> {activeClue}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
