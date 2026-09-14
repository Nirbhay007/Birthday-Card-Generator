'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import {
    resolveTrackId,
    getTrackName,
    getTrackSrc,
    schedulePolyphonicMelody,
    BIRTHDAY_OPENED_EVENT,
} from '@/lib/music';

export default function AudioPlayer({ track = 'classic', src = null, autoPlay = true, customName = null }) {
    const [playing, setPlaying] = useState(false);
    const activeTrack = resolveTrackId(track);
    const resolvedSrc = src || getTrackSrc(activeTrack);
    const isSynth = !resolvedSrc && activeTrack !== 'off';

    const audioRef = useRef(null);
    const ctxRef = useRef(null);
    const cancelLoopRef = useRef(null);
    const wantSound = useRef(activeTrack !== 'off' && autoPlay);
    const trackRef = useRef(activeTrack);

    useEffect(() => {
        trackRef.current = activeTrack;
    }, [activeTrack]);

    const stopSynth = useCallback(() => {
        if (cancelLoopRef.current) cancelLoopRef.current();
        cancelLoopRef.current = null;
        if (ctxRef.current) {
            try { ctxRef.current.close(); } catch { }
            ctxRef.current = null;
        }
    }, []);

    const startSynthLoop = useCallback(() => {
        if (ctxRef.current) return true; // already running
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return false;
            ctxRef.current = new Ctx();
            if (ctxRef.current.state === 'suspended') {
                ctxRef.current.resume().catch(() => { });
            }
            const loop = () => {
                if (!wantSound.current || !ctxRef.current) return;
                const currentId = trackRef.current;
                cancelLoopRef.current = schedulePolyphonicMelody(ctxRef.current, currentId, () => {
                    if (wantSound.current && ctxRef.current) {
                        loop();
                    }
                });
            };
            loop();
            return true;
        } catch (e) {
            console.error('Synth audio failed:', e);
            stopSynth();
            return false;
        }
    }, [stopSynth]);

    const startPlayback = useCallback(() => {
        if (!wantSound.current || trackRef.current === 'off') return;
        if (isSynth) {
            if (startSynthLoop()) setPlaying(true);
        } else if (audioRef.current) {
            audioRef.current.play().then(() => setPlaying(true)).catch(() => { });
        }
    }, [isSynth, startSynthLoop]);

    // Autoplay attempt on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            startPlayback();
        }, 100);
        return () => clearTimeout(timer);
    }, [startPlayback]);

    // Tap on gift box triggers audio playback reliably inside user gesture
    useEffect(() => {
        const onOpened = () => startPlayback();
        window.addEventListener(BIRTHDAY_OPENED_EVENT, onOpened);
        return () => window.removeEventListener(BIRTHDAY_OPENED_EVENT, onOpened);
    }, [startPlayback]);

    // Mobile fallback gesture unlock
    useEffect(() => {
        if (playing) return;
        const unlockAudio = (e) => {
            if (e?.target && e.target.closest?.('[data-audio-toggle]')) return;
            if (wantSound.current) {
                startPlayback();
            }
        };
        window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
        window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
        return () => {
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
    }, [playing, startPlayback]);

    useEffect(() => {
        const onPreviewStarted = () => {
            if (playing || wantSound.current) {
                try { audioRef.current?.pause(); } catch { }
                stopSynth();
                setPlaying(false);
            }
        };

        const onPreviewStopped = () => {
            if (wantSound.current) {
                startPlayback();
            }
        };

        window.addEventListener('bgen:preview_started', onPreviewStarted);
        window.addEventListener('bgen:preview_stopped', onPreviewStopped);

        return () => {
            window.removeEventListener('bgen:preview_started', onPreviewStarted);
            window.removeEventListener('bgen:preview_stopped', onPreviewStopped);
        };
    }, [playing, startPlayback, stopSynth]);

    // Hot-switch playback to VIP track immediately upon payment activation
    useEffect(() => {
        const onVipActivated = (e) => {
            const newTrack = e?.detail?.track;
            if (newTrack && newTrack !== 'off') {
                const target = resolveTrackId(newTrack);
                trackRef.current = target;
                const newSrc = getTrackSrc(target);
                if (audioRef.current && newSrc) {
                    try { audioRef.current.pause(); } catch { }
                    stopSynth();
                    audioRef.current.src = newSrc;
                    audioRef.current.load();
                    if (wantSound.current) {
                        audioRef.current.play().then(() => setPlaying(true)).catch(() => { });
                    }
                } else if (!newSrc && target !== 'off') {
                    try { audioRef.current?.pause(); } catch { }
                    stopSynth();
                    if (wantSound.current) {
                        startSynthLoop();
                        setPlaying(true);
                    }
                }
            }
        };

        window.addEventListener('bgen:vip_activated', onVipActivated);
        return () => window.removeEventListener('bgen:vip_activated', onVipActivated);
    }, [stopSynth, startSynthLoop]);

    useEffect(() => () => stopSynth(), [stopSynth]);

    // Track/Src switching
    const prevTrack = useRef(activeTrack);
    useEffect(() => {
        if (prevTrack.current === activeTrack) return;
        prevTrack.current = activeTrack;

        if (!wantSound.current || !playing) return;
        try { audioRef.current?.pause(); } catch { }
        stopSynth();
        if (isSynth) {
            startSynthLoop();
        } else if (activeTrack !== 'off') {
            try {
                audioRef.current?.load();
                audioRef.current?.play().catch(() => { });
            } catch { }
        }
    });

    if (activeTrack === 'off') return null;

    const displayName = getTrackName(activeTrack, customName);

    const togglePlay = async () => {
        if (playing) {
            wantSound.current = false;
            if (!isSynth) audioRef.current?.pause();
            stopSynth();
            setPlaying(false);
        } else {
            wantSound.current = true;
            startPlayback();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1.5">
            {activeTrack !== 'classic' && (
                <span className="text-[10px] font-bold bg-gray-900/85 text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg max-w-[200px] truncate border border-amber-400/30">
                    <Music className="w-3 h-3 shrink-0 text-amber-400" /> <span className="truncate">{displayName}</span>
                </span>
            )}
            {!isSynth && resolvedSrc && (
                <audio
                    ref={audioRef}
                    src={resolvedSrc}
                    loop
                    preload="auto"
                />
            )}
            <button
                data-audio-toggle="true"
                onClick={togglePlay}
                className="bg-gray-900/90 text-white backdrop-blur-md p-3.5 rounded-full shadow-2xl hover:bg-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-purple-500 flex items-center justify-center cursor-pointer border border-white/20"
                aria-label={playing ? `Mute background music (${displayName})` : `Play background music (${displayName})`}
                title={playing ? 'Mute music' : 'Play music'}
            >
                {playing ? <Volume2 className="w-6 h-6 text-amber-400" /> : <VolumeX className="w-6 h-6 text-gray-400" />}
            </button>
            <span className="sr-only" aria-live="polite">
                {playing ? 'Background birthday music is currently playing' : 'Background birthday music is muted'}
            </span>
        </div>
    );
}
