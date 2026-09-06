'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Wind, RotateCcw, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

function getCandleCount(age) {
    if (typeof age === 'number' && Number.isFinite(age)) {
        if (age >= 1 && age <= 7) return age;
        if (age > 7) return 7;
    }
    return 5;
}

function fireCelebration() {
    const defaults = { origin: { y: 0.6 }, disableForReducedMotion: true };
    confetti({ ...defaults, particleCount: 160, spread: 75, startVelocity: 42 });
    setTimeout(() => {
        confetti({ ...defaults, particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
        confetti({ ...defaults, particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    }, 250);
    setTimeout(() => {
        confetti({ ...defaults, particleCount: 110, spread: 100, startVelocity: 32, scalar: 0.9, origin: { y: 0.5 } });
    }, 550);
    setTimeout(() => {
        confetti({ ...defaults, particleCount: 60, spread: 120, shapes: ['star'], colors: ['#FFD700', '#FF6B9D', '#8B5CF6', '#ffffff'], origin: { y: 0.4 } });
    }, 900);
}

const CANDLE_COLORS = [
    'repeating-linear-gradient(135deg, #ff5d8f 0 6px, #ffffff 6px 12px)',
    'repeating-linear-gradient(135deg, #8b5cf6 0 6px, #ffffff 6px 12px)',
    'repeating-linear-gradient(135deg, #06b6d4 0 6px, #ffffff 6px 12px)',
    'repeating-linear-gradient(135deg, #f59e0b 0 6px, #ffffff 6px 12px)',
    'repeating-linear-gradient(135deg, #10b981 0 6px, #ffffff 6px 12px)',
    'repeating-linear-gradient(135deg, #ef4444 0 6px, #ffffff 6px 12px)',
    'repeating-linear-gradient(135deg, #ec4899 0 6px, #a78bfa 6px 12px)',
];

export default function CandleBlower({ onBlow, age, recipientName }) {
    const [listening, setListening] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [volume, setVolume] = useState(0);
    const [candlesBlown, setCandlesBlown] = useState(false);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const blownRef = useRef(false);

    const candleCount = getCandleCount(age);

    useEffect(() => {
        return () => stopListening();
    }, []);

    const startListening = async () => {
        try {
            const stream = await navigator?.mediaDevices?.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            setListening(true);
            setPermissionDenied(false);
            detectBlow();
        } catch (err) {
            console.error('Microphone access denied:', err);
            setPermissionDenied(true);
        }
    };

    const stopListening = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        try { microphoneRef.current?.disconnect(); } catch {}
        try { audioContextRef.current?.close(); } catch {}
        try { streamRef.current?.getTracks()?.forEach((t) => t.stop()); } catch {}
        microphoneRef.current = null;
        audioContextRef.current = null;
        analyserRef.current = null;
        setListening(false);
    };

    const detectBlow = () => {
        if (!analyserRef.current) return;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setVolume(average);
        if (average > 35 && !blownRef.current) {
            handleBlowOut();
        } else {
            animationFrameRef.current = requestAnimationFrame(detectBlow);
        }
    };

    const handleBlowOut = () => {
        if (blownRef.current) return;
        blownRef.current = true;
        setCandlesBlown(true);
        stopListening();
        fireCelebration();
        if (onBlow) onBlow();
    };

    const handleReplay = () => {
        blownRef.current = false;
        setCandlesBlown(false);
        setVolume(0);
    };

    return (
        <section className="flex flex-col items-center justify-center space-y-6 py-6" aria-label="Interactive virtual candle blowing section">
            {typeof age === 'number' && age >= 1 && (
                <div className="pop-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-white/60 shadow-sm text-sm font-bold text-gray-800">
                    <PartyPopper className="w-4 h-4 text-pink-600" aria-hidden="true" />
                    <span>Turning {age}! Make a wish{recipientName ? `, ${recipientName}` : ''} ✨</span>
                </div>
            )}

            {/* Cake */}
            <div className="relative flex flex-col items-center select-none" role="img" aria-label={candlesBlown ? 'Birthday cake with blown out candles' : 'Birthday cake with lit candles'}>
                {/* Candles row */}
                <div className="relative flex items-end justify-center gap-2 sm:gap-3 h-28 mb-[-6px] z-10">
                    {Array.from({ length: candleCount }).map((_, i) => (
                        <div key={i} className="relative flex flex-col items-center" style={{ height: '100%' }}>
                            {/* smoke */}
                            {candlesBlown && (
                                <span
                                    className="candle-smoke absolute -top-1 w-2 h-2 rounded-full bg-gray-400/80 blur-[1px]"
                                    style={{ animationDelay: `${i * 0.12}s` }}
                                    aria-hidden="true"
                                />
                            )}
                            {/* glow */}
                            {!candlesBlown && (
                                <span className="flame-glow absolute top-0 w-8 h-8 rounded-full bg-amber-300/50 blur-md" aria-hidden="true" />
                            )}
                            {/* flame */}
                            <span
                                className={cn(
                                    'relative block w-3.5 h-6 rounded-full transition-all duration-700',
                                    candlesBlown ? 'opacity-0 scale-50' : 'opacity-100 flame-flicker'
                                )}
                                style={{
                                    background: candlesBlown ? 'transparent' : 'radial-gradient(circle at 50% 75%, #fff7cc 0%, #fbbf24 38%, #f97316 68%, #dc2626 100%)',
                                    boxShadow: candlesBlown ? 'none' : '0 0 14px 4px rgba(251,191,36,0.65)',
                                }}
                                aria-hidden="true"
                            />
                            {/* wick */}
                            <span className="block w-[2px] h-2 bg-gray-800" aria-hidden="true" />
                            {/* striped candle body */}
                            <span
                                className="block w-3.5 sm:w-4 h-16 sm:h-20 rounded-t-md rounded-b-sm border border-black/10 shadow-sm"
                                style={{ background: CANDLE_COLORS[i % CANDLE_COLORS.length] }}
                                aria-hidden="true"
                            />
                        </div>
                    ))}
                </div>

                {/* Top frosting */}
                <div className="relative z-[5] w-64 sm:w-80 h-8 bg-gradient-to-b from-white to-pink-100 rounded-t-2xl border border-pink-200 shadow-sm overflow-visible">
                    <div className="absolute -bottom-3 left-0 w-full flex justify-around" aria-hidden="true">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <span key={i} className="block w-5 h-5 bg-pink-100 border-b border-x border-pink-200 rounded-b-full" />
                        ))}
                    </div>
                    <div className="absolute top-1.5 left-0 w-full flex justify-center gap-2" aria-hidden="true">
                        <span>🍓</span><span>🫐</span><span>🍓</span><span>🫐</span><span>🍓</span>
                    </div>
                </div>
                {/* Cake body top tier */}
                <div className="w-64 sm:w-80 h-20 bg-gradient-to-b from-pink-300 via-pink-400 to-rose-500 border-x border-pink-600/20 flex items-center justify-center shadow-lg">
                    <span className="text-white/95 font-extrabold tracking-widest text-sm sm:text-base drop-shadow">★ HAPPY BIRTHDAY ★</span>
                </div>
                {/* Divider icing */}
                <div className="w-72 sm:w-96 h-4 bg-gradient-to-b from-white to-amber-100 border border-amber-200 rounded-full shadow-sm z-10" aria-hidden="true" />
                {/* Cake body bottom tier */}
                <div className="w-72 sm:w-96 h-24 bg-gradient-to-b from-violet-400 via-purple-500 to-indigo-600 rounded-b-3xl border border-purple-700/20 shadow-xl flex items-center justify-center gap-3 text-2xl" aria-hidden="true">
                    <span>🎈</span><span>🎁</span><span>🎈</span>
                </div>
                {/* Plate */}
                <div className="mt-[-4px] w-80 sm:w-[28rem] h-5 bg-gradient-to-b from-gray-100 to-gray-300 rounded-full shadow-md border border-gray-200" aria-hidden="true" />
            </div>

            {/* Controls */}
            <div className="text-center space-y-3 max-w-sm">
                {!candlesBlown ? (
                    <>
                        {listening ? (
                            <div className="space-y-2 pop-in">
                                <div className="flex items-center justify-center space-x-2 text-purple-700 animate-pulse">
                                    <Wind className="w-6 h-6" aria-hidden="true" />
                                    <span className="font-bold text-lg">Blow into your microphone!</span>
                                </div>
                                <div className="w-52 h-3 bg-gray-200 rounded-full overflow-hidden mx-auto border border-gray-300" aria-label="Microphone volume indicator">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-75"
                                        style={{ width: `${Math.min(volume * 2.2, 100)}%` }}
                                    />
                                </div>
                                <button onClick={stopListening} className="text-xs text-gray-500 underline hover:text-gray-700">Stop listening</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={startListening}
                                    className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2 mx-auto focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer"
                                    aria-label="Enable microphone to blow out virtual birthday candles"
                                >
                                    <Mic className="w-5 h-5" aria-hidden="true" />
                                    <span>🎤 Tap & Blow the Candles</span>
                                </button>
                                {permissionDenied && (
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                        Mic blocked — allow microphone access, or use the button below. Your audio never leaves your device.
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleBlowOut}
                            className="text-sm font-medium text-gray-700 underline hover:text-purple-700 mt-1 block mx-auto focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md px-2 py-1 cursor-pointer"
                        >
                            Or tap here to blow them out ✨
                        </button>
                    </>
                ) : (
                    <div className="space-y-3 pop-in" role="status" aria-live="assertive">
                        <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-bounce">
                            Yay! Wish made! 🎉
                        </div>
                        <button
                            onClick={handleReplay}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Relight candles & play again
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
