'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Heart, Sparkles, Mail, Copy, Check, RotateCcw, Award, Share2, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from './gameAudio';

export default function GrandRevealStage({
    recipientName,
    senderName,
    message,
    giftTitle = 'Surprise Dinner & Celebration on Me!',
    giftCode = 'BDAY-VIP-2026',
    giftNote = 'Redeemable anytime this year! You deserve the world and more. ❤️',
    onReplay
}) {
    const [letterOpened, setLetterOpened] = useState(false);
    const [giftBoxOpened, setGiftBoxOpened] = useState(false);
    const [scratchPercent, setScratchPercent] = useState(0);
    const [isScratchCleared, setIsScratchCleared] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);

    // Initial Celebration Confetti
    useEffect(() => {
        soundEngine.playFanfare();
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.7 },
                colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'],
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.7 },
                colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'],
            });

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    // Setup Scratch Card Canvas
    useEffect(() => {
        if (!giftBoxOpened || isScratchCleared) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Render shimmering metallic foil coating
        const foilGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        foilGradient.addColorStop(0, '#c0c0c0');
        foilGradient.addColorStop(0.25, '#f3f4f6');
        foilGradient.addColorStop(0.5, '#9ca3af');
        foilGradient.addColorStop(0.75, '#e5e7eb');
        foilGradient.addColorStop(1, '#c0c0c0');

        ctx.fillStyle = foilGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scratch pattern / instructions
        ctx.fillStyle = '#4b5563';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨ SCRATCH WITH FINGER TO REVEAL ✨', canvas.width / 2, canvas.height / 2);

        let lastSoundTime = 0;

        const scratch = (clientX, clientY) => {
            const canvasRect = canvas.getBoundingClientRect();
            const x = clientX - canvasRect.left;
            const y = clientY - canvasRect.top;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fill();

            // Scratch audio throttled
            const now = Date.now();
            if (now - lastSoundTime > 80) {
                lastSoundTime = now;
                soundEngine.playScratch();
            }

            // Calculate scratched percentage periodically
            if (Math.random() < 0.2) {
                checkScratchPercent();
            }
        };

        const checkScratchPercent = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let transparentPixels = 0;
            const totalPixels = data.length / 4;

            for (let i = 3; i < data.length; i += 16) {
                if (data[i] === 0) transparentPixels++;
            }

            const pct = Math.round((transparentPixels / (totalPixels / 4)) * 100);
            setScratchPercent(pct);

            if (pct >= 55) {
                setIsScratchCleared(true);
                soundEngine.playFanfare();
                confetti({
                    particleCount: 50,
                    spread: 80,
                    origin: { y: 0.6 },
                });
            }
        };

        const onMouseDown = (e) => {
            isDrawingRef.current = true;
            scratch(e.clientX, e.clientY);
        };
        const onMouseMove = (e) => {
            if (isDrawingRef.current) scratch(e.clientX, e.clientY);
        };
        const onMouseUp = () => {
            isDrawingRef.current = false;
        };

        const onTouchStart = (e) => {
            if (e.touches && e.touches[0]) {
                isDrawingRef.current = true;
                scratch(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const onTouchMove = (e) => {
            if (isDrawingRef.current && e.touches && e.touches[0]) {
                e.preventDefault();
                scratch(e.touches[0].clientX, e.touches[0].clientY);
            }
        };
        const onTouchEnd = () => {
            isDrawingRef.current = false;
        };

        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [giftBoxOpened, isScratchCleared]);

    const handleCopyCode = () => {
        if (!giftCode) return;
        soundEngine.playPop();
        navigator.clipboard?.writeText(giftCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto px-4 py-8 text-center space-y-8">
            {/* Triumphant Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 text-gray-950 shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5 text-gray-950" />
                    Vault Unlocked • Quest Complete!
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Happy Birthday, {recipientName}! 🎉
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
                    You have conquered every challenge! Here are the secret treasures hidden inside with all of {senderName ? `${senderName}'s` : ''} love.
                </p>
            </motion.div>

            {/* Part 1: The Wax-Sealed Secret Letter */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 via-purple-950/40 to-slate-950/90 border border-amber-400/30 shadow-2xl backdrop-blur-xl text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-amber-400" />
                        <h3 className="text-base sm:text-lg font-bold text-white">
                            A Secret Letter from {senderName || 'Your Loved One'}
                        </h3>
                    </div>
                    {!letterOpened && (
                        <span className="text-[11px] font-bold text-amber-400 animate-pulse">
                            Tap to unseal ✉️
                        </span>
                    )}
                </div>

                {!letterOpened ? (
                    <motion.div
                        onClick={() => {
                            soundEngine.playPop();
                            setLetterOpened(true);
                            confetti({ particleCount: 20, spread: 50, origin: { y: 0.6 } });
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer py-12 px-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-purple-950/40 border-2 border-dashed border-amber-400/40 flex flex-col items-center justify-center text-center space-y-4 shadow-inner"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-700 border-2 border-amber-300 flex items-center justify-center shadow-lg transform rotate-6">
                            <span className="text-2xl">💌</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-300">Wax-Sealed Private Parchment</p>
                            <p className="text-xs text-gray-400 mt-1">Tap anywhere to break the wax seal and open</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.9 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        className="rounded-2xl p-6 sm:p-8 bg-[#faf8f5] text-[#2c2416] shadow-xl space-y-4 font-serif leading-relaxed"
                    >
                        <div className="flex items-center justify-between text-xs text-amber-900/60 font-sans uppercase tracking-widest font-bold">
                            <span>Confidential & Pure Love</span>
                            <span>Birthday Edition</span>
                        </div>

                        <div className="text-lg sm:text-xl font-bold font-sans text-gray-900">
                            Dearest {recipientName},
                        </div>

                        <p className="text-sm sm:text-base leading-relaxed text-gray-800 whitespace-pre-line">
                            {message ||
                                "On your special day, I wanted to create something truly magical just for you. You bring so much light, laughter, and joy into the world, and every memory we share is a treasure I hold close. May this year bring you all the love and happiness you deserve!"}
                        </p>

                        <div className="pt-4 border-t border-amber-900/15 flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-sans font-bold text-gray-700">
                                Forever with love,<br />
                                <span className="text-amber-800 text-base">{senderName || 'Your Loved One'} 💜</span>
                            </p>
                            <span className="text-2xl">🎂</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Part 2: The Mystery Gift Box & Scratch-to-Reveal Card */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-950/90 border border-purple-400/30 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 text-left">
                    <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-pink-400" />
                        <h3 className="text-base sm:text-lg font-bold text-white">
                            The Hidden Gift Inside
                        </h3>
                    </div>
                    <span className="text-[11px] font-bold text-pink-400">
                        {giftBoxOpened ? 'Scratch card active 🎟️' : 'Wrapped 🎁'}
                    </span>
                </div>

                {!giftBoxOpened ? (
                    <div className="py-10 flex flex-col items-center justify-center space-y-5">
                        <motion.div
                            animate={{ y: [-4, 4, -4] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-amber-500 p-1 flex items-center justify-center shadow-[0_0_35px_rgba(236,72,153,0.4)]"
                        >
                            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                                <Gift className="w-12 h-12 text-pink-400 drop-shadow" />
                            </div>
                        </motion.div>

                        <p className="text-xs text-gray-300 max-w-xs">
                            A surprise gift has been packed inside for you! Tap to untie the ribbon and unwrap.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                soundEngine.playPop();
                                setGiftBoxOpened(true);
                                confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
                            }}
                            className="py-3 px-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-sm flex items-center gap-2 hover:brightness-110 shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                        >
                            <span>Untie Ribbon & Unwrap Gift</span>
                            <Sparkles className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-300">
                            Rub your finger or mouse over the silver card to scratch off the coating!
                        </p>

                        {/* Scratch Card Container */}
                        <div className="relative w-full max-w-md h-52 mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/40">
                            {/* Underneath Revealed Gift */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-slate-900 to-purple-950 p-6 flex flex-col items-center justify-center text-center space-y-2">
                                <span className="text-3xl">🎁</span>
                                <h4 className="text-lg font-black text-amber-300 leading-tight">
                                    {giftTitle}
                                </h4>
                                <p className="text-xs text-gray-300 max-w-xs italic">
                                    &ldquo;{giftNote}&rdquo;
                                </p>

                                {giftCode && (
                                    <div className="mt-2 flex items-center gap-2 bg-black/50 border border-amber-400/30 px-3 py-1.5 rounded-xl">
                                        <span className="font-mono text-xs font-bold text-amber-200">
                                            {giftCode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                                            title="Copy Code"
                                        >
                                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Scratch Canvas Overlay */}
                            {!isScratchCleared && (
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
                                />
                            )}
                        </div>

                        {/* Scratched Progress Bar */}
                        {!isScratchCleared && (
                            <div className="text-xs text-gray-400">
                                <span>Scratched: {scratchPercent}%</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions: Replay & Share */}
            <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
                <button
                    type="button"
                    onClick={() => onReplay && onReplay()}
                    className="py-2.5 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay Birthday Quest</span>
                </button>
            </div>
        </div>
    );
}
