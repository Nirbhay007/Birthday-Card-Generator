'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, ArrowRight, Play, RefreshCw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from './gameAudio';

const TARGET_SCORE = 200;

export default function StarCatcherStage({ recipientName, onComplete }) {
    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'cleared'
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(1);
    const [comboText, setComboText] = useState('');

    const gameLoopRef = useRef(null);
    const catcherRef = useRef({ x: 200, width: 80, height: 18 });
    const itemsRef = useRef([]);
    const particlesRef = useRef([]);
    const scoreRef = useRef(0);
    const comboRef = useRef(1);

    const startGame = () => {
        scoreRef.current = 0;
        comboRef.current = 1;
        setScore(0);
        setCombo(1);
        setComboText('');
        itemsRef.current = [];
        particlesRef.current = [];
        setGameState('playing');
        soundEngine.playPop();
    };

    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions responsive to container
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        catcherRef.current.x = canvas.width / 2 - 40;

        let lastSpawn = Date.now();
        let animationFrameId;

        // Handle Touch and Mouse movements
        const updateCatcherPos = (clientX) => {
            const canvasRect = canvas.getBoundingClientRect();
            const relativeX = clientX - canvasRect.left;
            catcherRef.current.x = Math.max(
                0,
                Math.min(canvas.width - catcherRef.current.width, relativeX - catcherRef.current.width / 2)
            );
        };

        const handleMouseMove = (e) => updateCatcherPos(e.clientX);
        const handleTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                e.preventDefault();
                updateCatcherPos(e.touches[0].clientX);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Item types
        const ITEM_TYPES = [
            { type: 'star', emoji: '⭐', points: 15, size: 24, speed: 2.2, color: '#f59e0b' },
            { type: 'heart', emoji: '💖', points: 25, size: 26, speed: 2.6, color: '#ec4899' },
            { type: 'cake', emoji: '🎂', points: 40, size: 28, speed: 3.0, color: '#8b5cf6' },
            { type: 'gift', emoji: '🎁', points: 50, size: 30, speed: 3.2, color: '#10b981' },
        ];

        // Main 60fps Loop
        const loop = () => {
            const now = Date.now();

            // Spawn items
            if (now - lastSpawn > 550) {
                lastSpawn = now;
                const template = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
                itemsRef.current.push({
                    ...template,
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: -20,
                    rotation: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 0.05,
                });
            }

            // Clear frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Basket / Star Magnet Catcher
            const catcher = catcherRef.current;
            const catcherY = canvas.height - 35;

            // Glowing catcher trail
            const gradient = ctx.createLinearGradient(catcher.x, 0, catcher.x + catcher.width, 0);
            gradient.addColorStop(0, '#ec4899');
            gradient.addColorStop(0.5, '#f59e0b');
            gradient.addColorStop(1, '#8b5cf6');

            ctx.save();
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 12;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(catcher.x, catcherY, catcher.width, catcher.height, 10);
            ctx.fill();
            ctx.restore();

            // Draw catcher rim light
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(catcher.x + 4, catcherY + 2, catcher.width - 8, 3, 2);
            ctx.fill();

            // Update & Draw Items
            for (let i = itemsRef.current.length - 1; i >= 0; i--) {
                const it = itemsRef.current[i];
                it.y += it.speed;
                it.rotation += it.rotSpeed;

                ctx.save();
                ctx.translate(it.x, it.y);
                ctx.rotate(it.rotation);
                ctx.font = `${it.size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(it.emoji, 0, 0);
                ctx.restore();

                // Collision detection with catcher
                if (
                    it.y + it.size / 2 >= catcherY &&
                    it.y - it.size / 2 <= catcherY + catcher.height &&
                    it.x >= catcher.x - 10 &&
                    it.x <= catcher.x + catcher.width + 10
                ) {
                    // Item Caught!
                    soundEngine.playChime(Math.floor(scoreRef.current / 20));

                    // Combo increment
                    comboRef.current += 1;
                    const earned = it.points * Math.min(comboRef.current, 4);
                    scoreRef.current += earned;

                    setScore(scoreRef.current);
                    setCombo(comboRef.current);

                    if (comboRef.current >= 4) {
                        setComboText(`🔥 ULTRA COMBO x${Math.min(comboRef.current, 4)}!`);
                    } else if (comboRef.current >= 2) {
                        setComboText(`✨ COMBO x${comboRef.current}!`);
                    }

                    // Create burst particles
                    for (let p = 0; p < 8; p++) {
                        particlesRef.current.push({
                            x: it.x,
                            y: it.y,
                            vx: (Math.random() - 0.5) * 5,
                            vy: (Math.random() - 0.5) * 5 - 2,
                            color: it.color,
                            radius: Math.random() * 3 + 2,
                            alpha: 1,
                        });
                    }

                    itemsRef.current.splice(i, 1);

                    // Check win condition
                    if (scoreRef.current >= TARGET_SCORE) {
                        setGameState('cleared');
                        soundEngine.playFanfare();
                        confetti({
                            particleCount: 50,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
                        });
                        return;
                    }
                    continue;
                }

                // Remove missed items
                if (it.y > canvas.height + 40) {
                    itemsRef.current.splice(i, 1);
                    comboRef.current = 1;
                    setCombo(1);
                    setComboText('');
                }
            }

            // Draw and Update Particles
            for (let p = particlesRef.current.length - 1; p >= 0; p--) {
                const pt = particlesRef.current[p];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.alpha -= 0.035;

                if (pt.alpha <= 0) {
                    particlesRef.current.splice(p, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = pt.alpha;
                ctx.fillStyle = pt.color;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState]);

    return (
        <div className="relative w-full max-w-xl mx-auto px-4 py-6 text-center">
            {/* Header */}
            <div className="mb-4 space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-purple-500/10 text-purple-300 border border-purple-500/20 backdrop-blur-md">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Chapter II: The Wish Collector
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Catch {recipientName}&apos;s Birthday Stars!
                </h2>
                <p className="text-xs sm:text-sm text-gray-300">
                    Slide your finger or mouse to steer the glowing star catcher.
                </p>
            </div>

            {/* Live Progress Bar & Scoreboard */}
            <div className="mb-3 flex items-center justify-between bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md text-xs">
                <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Target Score</p>
                    <p className="text-sm font-black text-amber-300">{score} / {TARGET_SCORE}</p>
                </div>

                <div className="flex-1 mx-4">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400"
                            animate={{ width: `${Math.min(100, (score / TARGET_SCORE) * 100)}%` }}
                            transition={{ duration: 0.2 }}
                        />
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Multiplier</p>
                    <p className="text-sm font-black text-pink-400">x{Math.min(combo, 4)}</p>
                </div>
            </div>

            {/* Combo Callout */}
            <div className="h-5 mb-1">
                {comboText && (
                    <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xs font-black text-amber-300 tracking-wide drop-shadow"
                    >
                        {comboText}
                    </motion.span>
                )}
            </div>

            {/* Canvas Stage */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950/70 to-slate-950 border border-purple-500/30 shadow-2xl">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block cursor-none touch-none"
                />

                {/* Overlay: Ready to start */}
                {gameState === 'ready' && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-3xl shadow-lg animate-pulse">
                            ⭐
                        </div>
                        <h3 className="text-xl font-black text-white">Ready to Collect Wishes?</h3>
                        <p className="text-xs text-gray-300 max-w-xs">
                            Collect falling birthday stars, cupcakes & gifts to reach {TARGET_SCORE} points and unlock the vault!
                        </p>
                        <button
                            type="button"
                            onClick={startGame}
                            className="py-3 px-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-black text-sm flex items-center gap-2 hover:brightness-110 shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start Arcade</span>
                        </button>
                    </div>
                )}

                {/* Overlay: Stage Cleared */}
                {gameState === 'cleared' && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)]"
                        >
                            <Trophy className="w-8 h-8 text-gray-950" />
                        </motion.div>
                        <h3 className="text-2xl font-black text-amber-300">Chapter II Cleared!</h3>
                        <p className="text-xs text-gray-200 max-w-xs">
                            Incredible reflexes, {recipientName}! All wishing stars have been collected and charged into the secret vault.
                        </p>
                        <button
                            type="button"
                            onClick={() => onComplete && onComplete({ score })}
                            className="py-3 px-8 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-gray-950 font-black text-sm flex items-center gap-2 hover:brightness-110 shadow-xl cursor-pointer transform hover:scale-105 transition-all"
                        >
                            <span>Crack Chapter III: The Secret Vault</span>
                            <ArrowRight className="w-4 h-4 text-gray-950" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
