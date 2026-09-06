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

export const NOTE_FREQS = {
    G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

// [note, beats] — Happy Birthday melody
export const MELODY = [
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 1.75],
    ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 1.75],
    ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1.75],
    ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
];

export const SYNTH_CONFIG = {
    musicbox: { beat: 0.46, type: 'sine', gain: 0.22, decay: 1.6 },
    party: { beat: 0.3, type: 'triangle', gain: 0.16, decay: 0.9 },
};

export function getTrackName(id) {
    return (TRACKS.find((t) => t.id === id) || TRACKS[0]).name;
}

// Dispatched synchronously from the gift-open tap (a real user gesture),
// so the audio player can start sound while the browser still allows it.
export const BIRTHDAY_OPENED_EVENT = 'birthday:opened';
