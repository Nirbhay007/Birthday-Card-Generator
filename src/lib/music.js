/**
 * Music track catalogue + Happy Birthday melody data.
 * Classic = bundled mp3. Music Box / Party Pop are synthesized
 * with Web Audio (no assets, no licensing issues).
 */

export const TRACKS = [
    { id: 'classic', name: 'Classic Birthday Song', desc: 'The familiar sing-along', emoji: '🎂' },
    { id: 'musicbox', name: 'Sweet Music Box', desc: 'Soft & tender', emoji: '🎠' },
    { id: 'party', name: 'Party Pop', desc: 'Upbeat & bouncy', emoji: '🎉' },
    { id: 'off', name: 'No music', desc: 'Silent surprise', emoji: '🔇' },
];

/**
 * Premium-exclusive tracks: real studio recordings (Pixabay Content License:
 * free for commercial use, no attribution required). Each is a hotlink to the
 * Pixabay CDN, verified to stream in browsers. If a CDN ever blocks us, the
 * player silently falls back to the built-in synth waltz below.
 */
export const PREMIUM_TRACKS = [
    {
        id: 'beats',
        name: 'Party Beats',
        desc: 'Modern birthday bounce',
        emoji: '🎉',
        src: 'https://cdn.pixabay.com/download/audio/2026/09/02/audio_a422a12456.mp3?filename=paulyudin-happy-birthday-birthday-music-595942.mp3',
        credit: 'PaulYudin',
    },
    {
        id: 'strings',
        name: 'Royal Strings',
        desc: 'Elegant string quartet',
        emoji: '🎻',
        src: 'https://cdn.pixabay.com/download/audio/2026/01/22/audio_25e64d5b94.mp3?filename=nastelbom-happy-birthday-471481.mp3',
        credit: 'NastelBom',
    },
    {
        id: 'piano',
        name: 'Moonlight Piano',
        desc: 'Tender romantic keys',
        emoji: '🎹',
        src: 'https://cdn.pixabay.com/download/audio/2026/08/12/audio_75f0a11aee.mp3?filename=leberch-romantic-piano-584476.mp3',
        credit: 'leberch',
    },
];

/** Display names for the built-in synth loops (fallback + legacy links). */
export const SYNTH_NAMES = {
    waltz: 'Starlight Waltz',
    lullaby: 'Golden Lullaby',
    fanfare: 'Royal Fanfare',
};

export const NOTE_FREQS = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0,
};

// [note, beats] — Happy Birthday melody
export const MELODY = [
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 1.75],
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 1.75],
    ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1.75],
    ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
];

// Premium-original melodies (each loops seamlessly back to its first note).
const WALTZ_MELODY = [
    ['E5', 1], ['G5', 1], ['A5', 1.5], ['G5', 0.5], ['E5', 1], ['D5', 1],
    ['C5', 1.5], ['D5', 0.5], ['E5', 1], ['G5', 1], ['E5', 1.5], ['D5', 0.5], ['C5', 2],
];
const LULLABY_MELODY = [
    ['C4', 1], ['E4', 1], ['G4', 1], ['C5', 2], ['B4', 1], ['G4', 1],
    ['A4', 1], ['G4', 2], ['F4', 1], ['E4', 1], ['D4', 1], ['C4', 2.5],
];
const FANFARE_MELODY = [
    ['C5', 0.5], ['C5', 0.5], ['C5', 0.5], ['G4', 0.5], ['A4', 0.5], ['C5', 1],
    ['D5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['G4', 1], ['C5', 1.75],
];

export const MELODIES = {
    musicbox: MELODY,
    party: MELODY,
    waltz: WALTZ_MELODY,
    lullaby: LULLABY_MELODY,
    fanfare: FANFARE_MELODY,
};

export const SYNTH_CONFIG = {
    musicbox: { beat: 0.46, type: 'sine', gain: 0.22, decay: 1.6 },
    party: { beat: 0.3, type: 'triangle', gain: 0.16, decay: 0.9 },
    waltz: { beat: 0.42, type: 'sine', gain: 0.2, decay: 1.8 },
    lullaby: { beat: 0.6, type: 'sine', gain: 0.17, decay: 2.4 },
    fanfare: { beat: 0.27, type: 'triangle', gain: 0.15, decay: 0.8 },
};

export function getTrackName(id) {
    return (
        TRACKS.find((t) => t.id === id) ||
        PREMIUM_TRACKS.find((t) => t.id === id) ||
        (SYNTH_NAMES[id] ? { name: SYNTH_NAMES[id] } : null) ||
        TRACKS[0]
    ).name;
}

/** Remote MP3 url for file-based tracks (classic + premium recordings). */
export function getTrackSrc(id) {
    if (id === 'classic') return '/happy-birthday.mp3';
    return PREMIUM_TRACKS.find((t) => t.id === id)?.src || null;
}

// Dispatched synchronously from the gift-open tap (a real user gesture),
// so the audio player can start sound while the browser still allows it.
export const BIRTHDAY_OPENED_EVENT = 'birthday:opened';
