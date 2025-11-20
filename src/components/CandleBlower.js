'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Wind } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

export default function CandleBlower({ onBlow, audioEnabled }) {
    const [listening, setListening] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [volume, setVolume] = useState(0);
    const [candlesBlown, setCandlesBlown] = useState(false);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

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
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setListening(false);
    };

    const detectBlow = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setVolume(average);

        // Threshold for "blowing" - this might need tuning
        if (average > 40 && !candlesBlown) {
            handleBlowOut();
        } else {
            animationFrameRef.current = requestAnimationFrame(detectBlow);
        }
    };

    const handleBlowOut = () => {
        setCandlesBlown(true);
        stopListening();
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
        if (onBlow) onBlow();
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-8">
            {/* Candles */}
            <div className="relative flex items-end justify-center space-x-8 h-40">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="relative flex flex-col items-center">
                        <div className={cn(
                            "w-4 h-12 bg-yellow-400 rounded-full blur-sm absolute -top-8 transition-opacity duration-500 animate-pulse",
                            candlesBlown ? "opacity-0" : "opacity-100"
                        )} />
                        <div className={cn(
                            "w-2 h-8 bg-orange-500 rounded-full absolute -top-4 transition-opacity duration-500",
                            candlesBlown ? "opacity-0" : "opacity-100"
                        )} />
                        <div className="w-4 h-32 bg-gradient-to-b from-pink-300 to-pink-500 rounded-t-lg shadow-lg" />
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="text-center space-y-4">
                {!candlesBlown ? (
                    <>
                        {listening ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-center space-x-2 text-purple-600 animate-pulse">
                                    <Wind className="w-6 h-6" />
                                    <span className="font-bold">Blow into your mic!</span>
                                </div>
                                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                                    <div
                                        className="h-full bg-purple-500 transition-all duration-75"
                                        style={{ width: `${Math.min(volume * 2, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={startListening}
                                className="px-6 py-3 bg-purple-600 text-white rounded-full font-bold shadow-lg hover:bg-purple-700 transition-all flex items-center space-x-2 mx-auto"
                            >
                                <Mic className="w-5 h-5" />
                                <span>Enable Mic to Blow</span>
                            </button>
                        )}

                        {(permissionDenied || !listening) && (
                            <button
                                onClick={handleBlowOut}
                                className="text-sm text-gray-500 underline hover:text-gray-700 mt-2 block mx-auto"
                            >
                                Or click here to blow manually
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-2xl font-bold text-purple-600 animate-bounce">
                        Yay! Happy Birthday! 🎉
                    </div>
                )}
            </div>
        </div>
    );
}
