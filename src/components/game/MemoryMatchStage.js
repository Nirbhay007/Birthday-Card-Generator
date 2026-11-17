'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Star, CheckCircle2, ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from './gameAudio';

const DEFAULT_MEMORIES = [
    { id: 1, text: "Your Unstoppable Smile", icon: "✨", note: "The one that lights up every single room!" },
    { id: 2, text: "Late Night Talks", icon: "🌙", note: "Solving world mysteries till 3 AM." },
    { id: 3, text: "Endless Adventures", icon: "🚀", note: "Every journey with you is pure magic." },
    { id: 4, text: "Inside Jokes", icon: "😂", note: "Things only the two of us will ever understand." },
];

export default function MemoryMatchStage({ recipientName, senderName, photos = [], customMemories = [], onComplete }) {
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [moves, setMoves] = useState(0);
    const [activeNote, setActiveNote] = useState(null);
    const [isComplete, setIsComplete] = useState(false);

    // Initialize deck
    useEffect(() => {
        let baseItems = [];

        if (photos && photos.length >= 2) {
            baseItems = photos.slice(0, 4).map((p, idx) => ({
                id: idx + 1,
                photo: typeof p === 'string' ? p : p.url,
                text: customMemories[idx]?.text || `Special Memory #${idx + 1}`,
                note: customMemories[idx]?.note || "A moment etched forever in my heart."
            }));
        } else if (customMemories && customMemories.length >= 2) {
            baseItems = customMemories.slice(0, 4).map((m, idx) => ({
                id: idx + 1,
                photo: m.photo || null,
                text: m.text || `Memory #${idx + 1}`,
                note: m.note || "One of my absolute favourite moments with you."
            }));
        } else {
            baseItems = DEFAULT_MEMORIES;
        }

        // Duplicate each item to create pairs
        const deck = [];
        baseItems.forEach((item, itemIdx) => {
            deck.push({ ...item, uid: `${item.id}-a`, pairId: item.id });
            deck.push({ ...item, uid: `${item.id}-b`, pairId: item.id });
        });

        // Fisher-Yates shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        setCards(deck);
        setMatchedIds([]);
        setFlippedIndices([]);
        setMoves(0);
        setIsComplete(false);
    }, [photos, customMemories]);

    const handleCardClick = (index) => {
        if (flippedIndices.length === 2) return;
        if (flippedIndices.includes(index)) return;
        if (matchedIds.includes(cards[index].pairId)) return;

        soundEngine.playCardFlip();
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves((m) => m + 1);
            const [firstIdx, secondIdx] = newFlipped;
            const firstCard = cards[firstIdx];
            const secondCard = cards[secondIdx];

            if (firstCard.pairId === secondCard.pairId) {
                // Match found!
                soundEngine.playChime(matchedIds.length);
                const nextMatched = [...matchedIds, firstCard.pairId];
                setMatchedIds(nextMatched);
                setFlippedIndices([]);
                setActiveNote({
                    text: firstCard.text,
                    note: firstCard.note,
                    photo: firstCard.photo,
                });

                confetti({
                    particleCount: 25,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
                });

                // Check if all matched
                const totalPairs = cards.length / 2;
                if (nextMatched.length === totalPairs) {
                    setTimeout(() => {
                        soundEngine.playFanfare();
                        setIsComplete(true);
                    }, 800);
                }
            } else {
                // Not a match: flip back after brief pause
                setTimeout(() => {
                    setFlippedIndices([]);
                }, 900);
            }
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto px-4 py-6 text-center">
            {/* Header */}
            <div className="mb-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    Chapter I: Memory Constellation
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Match {recipientName}&apos;s Memories
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
                    Flip and connect the twin stars of shared moments to unlock the next chapter.
                </p>

                {/* Score & Moves bar */}
                <div className="flex items-center justify-center gap-6 pt-2 text-xs font-semibold text-gray-400">
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                        <span>Pairs:</span>
                        <span className="text-amber-400 font-bold">{matchedIds.length} / {cards.length / 2 || 4}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                        <span>Moves:</span>
                        <span className="text-purple-400 font-bold">{moves}</span>
                    </div>
                </div>
            </div>

            {/* Active Memory Note Toast */}
            <AnimatePresence>
                {activeNote && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/60 via-amber-900/40 to-pink-900/60 border border-amber-400/30 backdrop-blur-md shadow-lg flex items-center justify-between text-left gap-3"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🌟</span>
                            <div>
                                <p className="text-xs font-bold text-amber-200">{activeNote.text}</p>
                                <p className="text-[11px] text-gray-200 italic">&ldquo;{activeNote.note}&rdquo;</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveNote(null)}
                            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-md"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Cards Grid */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-lg mx-auto">
                {cards.map((card, idx) => {
                    const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.pairId);
                    const isMatched = matchedIds.includes(card.pairId);

                    return (
                        <div
                            key={card.uid}
                            onClick={() => handleCardClick(idx)}
                            className="aspect-square relative cursor-pointer select-none perspective-[1000px]"
                        >
                            <motion.div
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="w-full h-full relative rounded-2xl preserve-3d shadow-md"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {/* Card Front (Face down mystery back) */}
                                <div
                                    className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-purple-500/30 flex flex-col items-center justify-center backface-hidden hover:border-amber-400/50 transition-colors shadow-inner"
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                    </div>
                                    <span className="text-[10px] text-purple-300/70 font-mono mt-1">★</span>
                                </div>

                                {/* Card Back (Face up revealed content) */}
                                <div
                                    className={`absolute inset-0 w-full h-full rounded-2xl p-1.5 flex flex-col items-center justify-center text-center backface-hidden ${
                                        isMatched
                                            ? 'bg-gradient-to-br from-amber-950/80 via-emerald-950/80 to-slate-900 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                            : 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border border-purple-400'
                                    }`}
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)',
                                    }}
                                >
                                    {card.photo ? (
                                        <div className="w-full h-full rounded-xl overflow-hidden relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={card.photo}
                                                alt={card.text}
                                                className="w-full h-full object-cover"
                                            />
                                            {isMatched && (
                                                <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                                    <CheckCircle2 className="w-6 h-6 text-amber-300 drop-shadow" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-1">
                                            <span className="text-xl mb-1">{card.icon || '💫'}</span>
                                            <span className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                                                {card.text}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Stage Victory Modal / Overlay */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-6 rounded-3xl bg-gradient-to-b from-slate-900/95 via-purple-950/90 to-slate-950/95 border border-amber-400/40 shadow-2xl backdrop-blur-xl max-w-md mx-auto space-y-4"
                    >
                        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                            <Trophy className="w-7 h-7 text-gray-950" />
                        </div>
                        <h3 className="text-xl font-black text-amber-300">
                            Chapter I Mastered!
                        </h3>
                        <p className="text-xs text-gray-200">
                            Every star aligned! {recipientName}, you solved all memories in just {moves} moves.
                        </p>
                        <button
                            type="button"
                            onClick={() => onComplete && onComplete({ moves })}
                            className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-gray-950 font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                            <span>Enter Chapter II: The Wish Collector</span>
                            <ArrowRight className="w-4 h-4 text-gray-950" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
