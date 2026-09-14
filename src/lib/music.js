/**
 * Music track catalogue + Polyphonic Web Audio Synthesizer Engine.
 * 
 * Free tier:
 * - 'classic': Bundled local MP3 (/happy-birthday.mp3)
 * - 'off': Silent
 * 
 * VIP tier (₹29 upgrade):
 * - 'rock': Rock & Roll Birthday (High-voltage electric guitars, punchy drums & driving rock energy)
 * - 'party': Electronic Party Pop (Punchy dance beat, bass pulse & bright hooks)
 * - 'retro': Cyber Synthwave 80s (Nostalgic analog detuned synth lead & 80s drum groove)
 * - 'musicbox': Starlight Music Box (Celestial chime bells with sparkling harmonics)
 * - 'strings': Royal Symphony Strings (Lush cinematic strings with rich harmony)
 * - 'piano': Moonlight Jazz Piano (Warm romantic grand piano chords)
 */

export const FREE_TRACKS = [
    { id: 'classic', name: 'Classic Birthday Song', desc: 'The familiar sing-along', emoji: '🎂', vip: false },
    { id: 'off', name: 'No Music', desc: 'Silent surprise', emoji: '🔇', vip: false },
];

export const VIP_TRACKS = [
    { id: 'rock', name: 'Rock & Roll Birthday', desc: 'Punchy live drums, overdrive electric guitars & high-voltage energy', emoji: '🎸', vip: true },
    { id: 'party', name: 'Electronic Party Pop', desc: 'Upbeat bouncy dance drop & festival hooks', emoji: '🎉', vip: true },
    { id: 'piano', name: 'Moonlight Jazz Piano', desc: 'Warm romantic keys, upright bass & brushed swing drums', emoji: '🎹', vip: true },
    { id: 'strings', name: 'Royal Symphony Strings', desc: 'Lush cinematic string orchestra & rich harmony', emoji: '🎻', vip: true },
    { id: 'retro', name: 'Cyber Retro 8-Bit', desc: 'Nostalgic arcade chiptune & retro synth groove', emoji: '👾', vip: true },
    { id: 'musicbox', name: 'Starlight Music Box', desc: 'Dreamy acoustic music box chime bells', emoji: '🎠', vip: true },
    { id: 'acoustic', name: 'Acoustic Guitar Serenade', desc: 'Warm acoustic fingerstyle guitar & gentle melody', emoji: '🪕', vip: true },
    { id: 'reggae', name: 'Island Reggae Birthday', desc: 'Sunny Caribbean reggae groove & upbeat rhythm', emoji: '🌴', vip: true },
];

export const ALL_TRACKS = [...FREE_TRACKS, ...VIP_TRACKS];

// Backward-compatibility exports for /premium universe
export const TRACKS = ALL_TRACKS;
export const PREMIUM_TRACKS = VIP_TRACKS;

export function getTrackSrc(id, customUrl = null) {
    const target = resolveTrackId(id);
    if (target === 'custom') return customUrl || null;
    if (target === 'classic') return '/happy-birthday.mp3';
    if (target === 'rock') return '/audio/rock.mp3';
    if (target === 'party') return '/audio/party.mp3';
    if (target === 'piano') return '/audio/piano.mp3';
    if (target === 'strings') return '/audio/strings.mp3';
    if (target === 'retro') return '/audio/retro.mp3';
    if (target === 'musicbox') return '/audio/musicbox.mp3';
    if (target === 'acoustic') return '/audio/acoustic.mp3';
    if (target === 'reggae') return '/audio/reggae.mp3';
    if (target === 'techno') return '/audio/techno.mp3';
    return null;
}

// Legacy alias mapping for DB cards
export const TRACK_ALIASES = {
    beats: 'party',
    waltz: 'musicbox',
    lullaby: 'musicbox',
    fanfare: 'strings',
};

export const NOTE_FREQS = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

// Happy Birthday lead melody with accompaniment: [leadNote, beats, bassRootNote, chordNote]
export const POLYPHONIC_BIRTHDAY = [
    // Phrase 1: "Happy Birthday to you"
    ['G4', 0.75, 'C3', 'E4'],
    ['G4', 0.25, null, null],
    ['A4', 1.0, 'F3', 'C5'],
    ['G4', 1.0, 'C3', 'E4'],
    ['C5', 1.0, 'E3', 'G4'],
    ['B4', 2.0, 'G3', 'D4'],

    // Phrase 2: "Happy Birthday to you"
    ['G4', 0.75, 'G3', 'D4'],
    ['G4', 0.25, null, null],
    ['A4', 1.0, 'F3', 'D5'],
    ['G4', 1.0, 'G3', 'D4'],
    ['D5', 1.0, 'F3', 'B4'],
    ['C5', 2.0, 'C3', 'E4'],

    // Phrase 3: "Happy Birthday dear friend"
    ['G4', 0.75, 'C3', 'E4'],
    ['G4', 0.25, null, null],
    ['G5', 1.0, 'C3', 'E5'],
    ['E5', 1.0, 'A3', 'C5'],
    ['C5', 1.0, 'F3', 'A4'],
    ['B4', 1.0, 'D3', 'G4'],
    ['A4', 1.75, 'F3', 'C5'],

    // Phrase 4: "Happy Birthday to you"
    ['F5', 0.75, 'F3', 'A4'],
    ['F5', 0.25, null, null],
    ['E5', 1.0, 'C3', 'G4'],
    ['C5', 1.0, 'E3', 'G4'],
    ['D5', 1.0, 'G3', 'B4'],
    ['C5', 2.5, 'C3', 'E4'],
];

export const SYNTH_PRESETS = {
    rock: {
        tempo: 140,
        type: 'sawtooth',
        dualOsc: true,
        detune: 14,
        filterCutoff: 3200,
        filterType: 'lowpass',
        gain: 0.28,
        decay: 0.9,
        hasDrums: true,
        drumStyle: 'rock',
        electricOverdrive: true,
        powerChords: true,
    },
    party: {
        tempo: 128,
        type: 'triangle',
        dualOsc: true,
        detune: 12,
        filterCutoff: 3000,
        filterType: 'lowpass',
        gain: 0.26,
        decay: 0.8,
        hasDrums: true,
        drumStyle: 'dance',
        bassPunch: true,
    },
    retro: {
        tempo: 122,
        type: 'sawtooth',
        dualOsc: true,
        detune: 16,
        filterCutoff: 2400,
        filterType: 'lowpass',
        gain: 0.22,
        decay: 1.0,
        hasDrums: true,
        drumStyle: 'synthwave',
        retroArp: true,
    },
    musicbox: {
        tempo: 110,
        type: 'sine',
        dualOsc: true,
        detune: 5,
        filterCutoff: 3800,
        filterType: 'lowpass',
        gain: 0.28,
        decay: 1.8,
        bellHarmonic: true,
    },
    strings: {
        tempo: 96,
        type: 'sawtooth',
        dualOsc: true,
        detune: 8,
        filterCutoff: 1600,
        filterType: 'lowpass',
        gain: 0.18,
        attack: 0.12,
        decay: 1.4,
        warmChorus: true,
    },
    piano: {
        tempo: 104,
        type: 'sine',
        dualOsc: true,
        detune: 3,
        filterCutoff: 2200,
        filterType: 'lowpass',
        gain: 0.26,
        attack: 0.02,
        decay: 1.5,
        acousticWarmth: true,
    },
};

export function resolveTrackId(rawId) {
    if (!rawId) return 'classic';
    const clean = String(rawId).trim().toLowerCase();
    return TRACK_ALIASES[clean] || clean;
}

export function getTrackName(id, customName = null) {
    if (id === 'custom') return customName || 'Your Custom Song';
    const target = resolveTrackId(id);
    const found = ALL_TRACKS.find((t) => t.id === target);
    return found ? found.name : 'Classic Birthday Song';
}

export function isVipTrack(id) {
    const target = resolveTrackId(id);
    return VIP_TRACKS.some((t) => t.id === target);
}

/**
 * Distortion curve for rock electric guitar overdrive
 */
function makeDistortionCurve(k = 25) {
    const n = 256;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

/**
 * Creates a shared 1-second white noise buffer for drums
 */
let sharedNoiseBuffer = null;
function getNoiseBuffer(ctx) {
    if (sharedNoiseBuffer && sharedNoiseBuffer.sampleRate === ctx.sampleRate) {
        return sharedNoiseBuffer;
    }
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    sharedNoiseBuffer = buffer;
    return sharedNoiseBuffer;
}

/**
 * Schedules one polyphonic melody loop in Web Audio API.
 * Features full live drums (kick, snare, hi-hats, crash), electric rock power chords,
 * driving bass, and soaring lead melodies.
 */
export function schedulePolyphonicMelody(ctx, presetKey, onEnd) {
    const key = resolveTrackId(presetKey);
    const preset = SYNTH_PRESETS[key] || SYNTH_PRESETS.rock;
    const beatSec = 60 / (preset.tempo || 110);
    const timers = [];
    const activeNodes = [];

    // Master filter node
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = preset.filterType || 'lowpass';
    masterFilter.frequency.value = preset.filterCutoff || 2800;
    masterFilter.Q.value = preset.warmChorus ? 2.5 : 1.2;

    // Distortion node for rock overdrive
    let distortionNode = null;
    let cabinetFilter = null;
    if (preset.electricOverdrive) {
        distortionNode = ctx.createWaveShaper();
        distortionNode.curve = makeDistortionCurve(30);
        distortionNode.oversample = '2x';

        // Guitar cabinet simulator filter
        cabinetFilter = ctx.createBiquadFilter();
        cabinetFilter.type = 'bandpass';
        cabinetFilter.frequency.value = 2600;
        cabinetFilter.Q.value = 1.4;

        distortionNode.connect(cabinetFilter);
        cabinetFilter.connect(masterFilter);
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);

    masterFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    let t = ctx.currentTime + 0.06;

    // --- DRUM GENERATORS ---
    const triggerKick = (time, intensity = 1.0) => {
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(175, time);
            osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

            const vol = 0.65 * intensity;
            gain.gain.setValueAtTime(vol, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(time);
            osc.stop(time + 0.25);
            activeNodes.push(osc);
        } catch { }
    };

    const triggerSnare = (time, intensity = 1.0) => {
        try {
            const noise = ctx.createBufferSource();
            noise.buffer = getNoiseBuffer(ctx);

            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = preset.drumStyle === 'dance' ? 1200 : 900;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.45 * intensity, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            noise.start(time);
            noise.stop(time + 0.18);
            activeNodes.push(noise);

            // Snare tonal body
            const osc = ctx.createOscillator();
            const toneGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(210, time);
            osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
            toneGain.gain.setValueAtTime(0.35 * intensity, time);
            toneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

            osc.connect(toneGain);
            toneGain.connect(masterGain);
            osc.start(time);
            osc.stop(time + 0.14);
            activeNodes.push(osc);
        } catch { }
    };

    const triggerHiHat = (time, open = false) => {
        try {
            const noise = ctx.createBufferSource();
            noise.buffer = getNoiseBuffer(ctx);

            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 7500;

            const gain = ctx.createGain();
            const decay = open ? 0.22 : 0.045;
            gain.gain.setValueAtTime(open ? 0.25 : 0.16, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            noise.start(time);
            noise.stop(time + decay + 0.02);
            activeNodes.push(noise);
        } catch { }
    };

    const triggerCrash = (time) => {
        try {
            const noise = ctx.createBufferSource();
            noise.buffer = getNoiseBuffer(ctx);

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 5500;
            filter.Q.value = 0.8;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.38, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);

            noise.start(time);
            noise.stop(time + 1.25);
            activeNodes.push(noise);
        } catch { }
    };

    // --- MELODY & HARMONY VOICES ---
    const playVoice = (freq, duration, volumeMultiplier = 1, isBass = false, isPowerChord = false) => {
        if (!freq || freq <= 0) return;
        try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = isBass ? (preset.drumStyle === 'rock' ? 'sawtooth' : 'triangle') : preset.type;
            osc.frequency.setValueAtTime(freq, t);

            // Detuned second voice for rich chorus
            if (preset.dualOsc && !isBass) {
                const osc2 = ctx.createOscillator();
                osc2.type = preset.type;
                osc2.frequency.setValueAtTime(freq, t);
                osc2.detune.setValueAtTime(preset.detune || 8, t);
                osc2.connect(gainNode);
                osc2.start(t);
                osc2.stop(t + duration + 0.4);
                activeNodes.push(osc2);
            }

            // High bell chime overtone for music box
            if (preset.bellHarmonic && !isBass) {
                const oscBell = ctx.createOscillator();
                oscBell.type = 'sine';
                oscBell.frequency.setValueAtTime(freq * 2, t);
                const bellGain = ctx.createGain();
                bellGain.gain.setValueAtTime(0.0001, t);
                bellGain.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
                bellGain.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(0.35, duration));
                oscBell.connect(bellGain).connect(masterFilter);
                oscBell.start(t);
                oscBell.stop(t + 0.4);
                activeNodes.push(oscBell);
            }

            const baseVol = (preset.gain || 0.22) * volumeMultiplier;
            const attackTime = preset.attack || 0.02;
            const decayTime = Math.min(duration * (preset.decay || 1.2), duration + 0.5);

            gainNode.gain.setValueAtTime(0.0001, t);
            gainNode.gain.exponentialRampToValueAtTime(baseVol, t + attackTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, t + decayTime);

            osc.connect(gainNode);

            // Route electric power chords to overdrive, lead/bass to master filter
            if (isPowerChord && distortionNode) {
                gainNode.connect(distortionNode);
            } else {
                gainNode.connect(masterFilter);
            }

            osc.start(t);
            osc.stop(t + duration + 0.6);
            activeNodes.push(osc);
        } catch { }
    };

    // Crash cymbal at the very start of the track
    if (preset.hasDrums) {
        triggerCrash(t);
    }

    let beatCounter = 0;

    POLYPHONIC_BIRTHDAY.forEach(([lead, beats, bass, harmony], noteIdx) => {
        const dur = beats * beatSec;
        const leadFreq = NOTE_FREQS[lead];
        const bassFreq = bass ? NOTE_FREQS[bass] : null;
        const harmonyFreq = harmony ? NOTE_FREQS[harmony] : null;

        // Play Lead Voice
        playVoice(leadFreq, dur, 1.0, false, false);

        // Play Harmony Voice
        if (harmonyFreq) {
            playVoice(harmonyFreq, dur, 0.6, false, false);
        }

        // Play Bass Voice
        if (bassFreq) {
            playVoice(bassFreq, dur * 1.1, 0.75, true, false);

            // Power chord 5th for rock feel
            if (preset.powerChords) {
                const fifthFreq = bassFreq * 1.5; // Perfect fifth
                playVoice(fifthFreq, dur * 0.9, 0.55, false, true);
            }
        }

        // Schedule Drums throughout the measure
        if (preset.hasDrums) {
            const steps = Math.max(1, Math.round(beats * 2)); // 8th note steps
            const stepDuration = dur / steps;
            for (let s = 0; s < steps; s++) {
                const drumTime = t + s * stepDuration;
                const currentBeat = (beatCounter + s * 0.5) % 4;

                // Hi-Hat on every 8th note
                triggerHiHat(drumTime, s === 0 && currentBeat === 0);

                // Kick on beat 1 and 3 (and syncopated for dance)
                if (currentBeat === 0 || currentBeat === 2 || (preset.drumStyle === 'dance' && currentBeat % 1 === 0)) {
                    triggerKick(drumTime, 1.0);
                }

                // Snare / Clap on beat 2 and 4
                if (currentBeat === 1 || currentBeat === 3) {
                    triggerSnare(drumTime, 1.1);
                }
            }
            beatCounter = (beatCounter + beats) % 4;

            // Crash on turnaround (measure 3 phrase start)
            if (noteIdx === 12 || noteIdx === 20) {
                triggerCrash(t);
            }
        }

        t += dur;
    });

    const totalDurationMs = Math.max(1000, (t - ctx.currentTime) * 1000 + 700);
    const endTimer = setTimeout(() => {
        if (onEnd) onEnd();
    }, totalDurationMs);
    timers.push(endTimer);

    return () => {
        timers.forEach(clearTimeout);
        try {
            masterGain.gain.cancelScheduledValues(0);
            masterGain.gain.setValueAtTime(0, 0);
            masterGain.disconnect();
        } catch { }
        activeNodes.forEach((node) => {
            try { node.stop(0); } catch { }
            try { node.disconnect(); } catch { }
        });
    };
}

/**
 * Module-level tracker for active preview playback.
 * Enforces strictly ONE sound playing at any time across the application.
 */
let currentPreview = null;

export function stopAllAudioPreviews() {
    if (currentPreview) {
        try {
            currentPreview.stop();
        } catch { }
        currentPreview = null;
    }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bgen:preview_stopped'));
    }
}

/**
 * Universal preview player for CreateForm & VipCustomizerModal.
 * Instantly stops any previously playing preview, isolates playback,
 * and notifies listeners.
 */
export function playAudioPreview(trackId, onEnded) {
    // 1. Immediately terminate any existing preview
    stopAllAudioPreviews();

    const target = resolveTrackId(trackId);

    if (target === 'off') {
        if (onEnded) onEnded();
        return { stop: () => { } };
    }

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bgen:preview_started', { detail: { trackId: target } }));
    }

    // High-fidelity MP3 playback for all tracks with audio files
    const audioSrc = getTrackSrc(target);
    if (audioSrc) {
        try {
            const audio = new Audio(audioSrc);
            audio.currentTime = 0;
            audio.play().catch(() => { });
            audio.onended = () => {
                if (currentPreview?.id === target) currentPreview = null;
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('bgen:preview_stopped'));
                }
                if (onEnded) onEnded();
            };

            const controller = {
                id: target,
                stop: () => {
                    try {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.src = '';
                    } catch { }
                },
            };
            currentPreview = controller;
            return controller;
        } catch {
            if (onEnded) onEnded();
            return { stop: () => { } };
        }
    }

    // VIP Synthesized Track (Rock, Party, Retro, Musicbox, Strings, Piano)
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
            if (onEnded) onEnded();
            return { stop: () => { } };
        }
        const ctx = new Ctx();
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }

        let cancelSchedule = null;
        let isStopped = false;

        const cleanup = () => {
            if (isStopped) return;
            isStopped = true;
            if (cancelSchedule) cancelSchedule();
            try {
                ctx.close().catch(() => { });
            } catch { }
            if (currentPreview?.id === target) currentPreview = null;
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('bgen:preview_stopped'));
            }
            if (onEnded) onEnded();
        };

        cancelSchedule = schedulePolyphonicMelody(ctx, target, () => {
            cleanup();
        });

        const controller = {
            id: target,
            stop: () => {
                cleanup();
            },
        };
        currentPreview = controller;
        return controller;
    } catch {
        if (onEnded) onEnded();
        return { stop: () => { } };
    }
}

export const BIRTHDAY_OPENED_EVENT = 'birthday:opened';
