'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { MELODY, MELODIES, NOTE_FREQS, SYNTH_CONFIG, getTrackName, BIRTHDAY_OPENED_EVENT } from '@/lib/music';

function scheduleMelodyLoop(ctx, config, melody, onEnd) {
    const timers = [];
    const beatMs = config.beat * 1000;
    let t = ctx.currentTime + 0.1;

    (melody || MELODY).forEach(([note, beats]) => {
        const freq = NOTE_FREQS[note];
        const dur = beats * config.beat;
        const delayMs = Math.max(0, (t - ctx.currentTime) * 1000);
        timers.push(setTimeout(() => {
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = config.type;
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(config.gain, ctx.currentTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + Math.min(dur * config.decay, dur + 0.6));
                osc.connect(gain).connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + dur + 0.7);
            } catch {}
        }, delayMs));
        t += dur;
    });

    const totalMs = (t - ctx.currentTime) * 1000 + 900;
    timers.push(setTimeout(onEnd, totalMs));
    return () => timers.forEach(clearTimeout);
}

export default function AudioPlayer({ track = 'classic', src = '/happy-birthday.mp3', autoPlay = true, customName = null }) {
    const [playing, setPlaying] = useState(false);
    // If a remote MP3 ever fails (CDN hiccup, blocked hotlink), silently melt
    // into the built-in synth waltz rather than leaving them in silence.
    const [audioFailed, setAudioFailed] = useState(false);
    const activeTrack = audioFailed ? 'waltz' : track;
    const isSynth = !!SYNTH_CONFIG[activeTrack];
    const audioRef = useRef(null);
    const ctxRef = useRef(null);
    const cancelLoopRef = useRef(null);
    // Whether the user wants sound (independent of browser autoplay blocks)
    const wantSound = useRef(track !== 'off' && autoPlay);
    const trackRef = useRef(activeTrack);

    useEffect(() => {
        trackRef.current = activeTrack;
    }, [activeTrack]);

    const stopSynth = useCallback(() => {
        if (cancelLoopRef.current) cancelLoopRef.current();
        cancelLoopRef.current = null;
        if (ctxRef.current) {
            try { ctxRef.current.close(); } catch {}
            ctxRef.current = null;
        }
    }, []);

    const startSynthLoop = useCallback(() => {
        if (ctxRef.current) return true; // already playing
        const config = SYNTH_CONFIG[trackRef.current];
        if (!config) return false;
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            ctxRef.current = new Ctx();
            if (ctxRef.current.state === 'suspended') {
                ctxRef.current.resume().catch(() => {});
            }
            const loop = () => {
                if (!wantSound.current || !ctxRef.current) return;
                const trackId = trackRef.current;
                const cfg = SYNTH_CONFIG[trackId];
                if (!cfg) return;
                cancelLoopRef.current = scheduleMelodyLoop(ctxRef.current, cfg, MELODIES[trackId] || MELODY, () => {
                    if (wantSound.current && ctxRef.current) loop();
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
        if (!wantSound.current) return;
        if (SYNTH_CONFIG[trackRef.current]) {
            if (startSynthLoop()) setPlaying(true);
        } else if (trackRef.current !== 'off') {
            audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
        }
    }, [startSynthLoop]);

    // Best-effort autoplay on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            startPlayback();
        }, 100);
        return () => clearTimeout(timer);
    }, [startPlayback]);

    // The gift-open tap is a real gesture: this listener runs synchronously
    // inside it, so browsers (incl. iOS Safari) allow audio to start here.
    useEffect(() => {
        const onOpened = () => startPlayback();
        window.addEventListener(BIRTHDAY_OPENED_EVENT, onOpened);
        return () => window.removeEventListener(BIRTHDAY_OPENED_EVENT, onOpened);
    }, [startPlayback]);

    // First-touch fallback for mobile browsers: if initial mount autoplay was blocked
    // due to browser autoplay policies, start audio on the first user interaction.
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

    useEffect(() => () => stopSynth(), [stopSynth]);

    // CDN fallback recovery: if remote file died, synth waltz takes over
    useEffect(() => {
        if (audioFailed && wantSound.current) startPlayback();
    }, [audioFailed, startPlayback]);

    // Seamless track/src switching
    const prevTrack = useRef(activeTrack);
    const prevSrc = useRef(src);
    useEffect(() => {
        const trackChanged = prevTrack.current !== activeTrack;
        const srcChanged = prevSrc.current !== src;
        if (!trackChanged && !srcChanged) return;

        prevTrack.current = activeTrack;
        prevSrc.current = src;

        if (!wantSound.current || !playing) return;
        try { audioRef.current?.pause(); } catch {}
        stopSynth();
        if (SYNTH_CONFIG[activeTrack]) {
            startSynthLoop();
        } else if (activeTrack !== 'off') {
            try {
                audioRef.current?.load();
                audioRef.current?.play().catch(() => {});
            } catch {}
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
                <span className="text-[10px] font-bold bg-gray-900/85 text-purple-200 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg max-w-[200px] truncate">
                    <Music className="w-3 h-3 shrink-0" /> <span className="truncate">{displayName}</span>
                </span>
            )}
            {!isSynth && (
                <audio
                    ref={audioRef}
                    src={src}
                    loop
                    preload={activeTrack === 'classic' ? 'auto' : 'none'}
                    onError={() => setAudioFailed(true)}
                />
            )}
            <button
                data-audio-toggle="true"
                onClick={togglePlay}
                className="bg-gray-900/90 text-white backdrop-blur-md p-3.5 rounded-full shadow-2xl hover:bg-gray-800 transition-all focus:outline-none focus:ring-4 focus:ring-purple-500 flex items-center justify-center cursor-pointer"
                aria-label={playing ? `Mute background music (${displayName})` : `Play background music (${displayName})`}
                title={playing ? 'Mute music' : 'Play music'}
            >
                {playing ? <Volume2 className="w-6 h-6 text-purple-400" /> : <VolumeX className="w-6 h-6 text-gray-400" />}
            </button>
            <span className="sr-only" aria-live="polite">
                {playing ? 'Background birthday music is currently playing' : 'Background birthday music is muted'}
            </span>
        </div>
    );
}
