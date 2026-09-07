/**
 * "Who is it for" — the plug-and-play layer. The giver picks a relationship,
 * the universe shifts its tone: romantic stays as written, family turns warm
 * and respectful, friend turns playful. Occasion decks supply the stories;
 * tones supply the manners. Travels in the magic link as ?for=<id>.
 */

export const TONES = {
    romantic: {
        id: 'romantic',
        signOff: 'Forever yours',
        vowsTitleMain: null, // null = keep the occasion deck's titles
        vowsTitleAccent: null,
        letterMid: null, // null = keep the occasion deck's words
        vows: null,
    },
    family: {
        id: 'family',
        signOff: 'With all my love',
        vowsTitleMain: 'Three promises,',
        vowsTitleAccent: 'kept always',
        letterMid:
            'You have given me everything and asked for nothing. Not once. I stopped counting the sacrifices a long time ago, because I ran out of numbers before I ran out of love.',
        vows: [
            'I vow to call more, visit more, and never make you ask twice.',
            'I vow to eat on time, drive safe, and take care of myself. Your usual worries, handled.',
            'I vow to make you proud in small ways, every single day. Starting with this.',
        ],
    },
    friend: {
        id: 'friend',
        signOff: 'Your partner in crime',
        vowsTitleMain: 'Three promises,',
        vowsTitleAccent: 'pinky swear',
        letterMid:
            'You have seen me at my worst. Tired, broke, mid haircut disaster. And you stayed. Mostly for the snacks, but still. That is the whole review. Five stars.',
        vows: [
            'I vow to always reply “on my way” even when I have not left yet. Some traditions are sacred.',
            'I vow to hype up your worst ideas just enough that you actually do them.',
            'I vow that distance, jobs, and adulting will never downgrade us. Best friends load forever.',
        ],
    },
};

export const RELATIONSHIPS = [
    { id: 'partner', label: 'Partner', tone: 'romantic' },
    { id: 'husband', label: 'Husband', tone: 'romantic' },
    { id: 'wife', label: 'Wife', tone: 'romantic' },
    { id: 'boyfriend', label: 'Boyfriend', tone: 'romantic' },
    { id: 'girlfriend', label: 'Girlfriend', tone: 'romantic' },
    { id: 'mom', label: 'Mom', tone: 'family' },
    { id: 'dad', label: 'Dad', tone: 'family' },
    { id: 'sister', label: 'Sister', tone: 'family' },
    { id: 'brother', label: 'Brother', tone: 'family' },
    { id: 'son', label: 'Son', tone: 'family' },
    { id: 'daughter', label: 'Daughter', tone: 'family' },
    { id: 'bestfriend', label: 'Best Friend', tone: 'friend' },
    { id: 'friend', label: 'Friend', tone: 'friend' },
];

export const REL_IDS = RELATIONSHIPS.map((r) => r.id);

export function getRelationship(id) {
    return RELATIONSHIPS.find((r) => r.id === id) || null;
}

/** Unset/unknown relationships keep the classic romantic voice (back-compat). */
export function getTone(relId) {
    const rel = getRelationship(relId);
    return TONES[rel?.tone || 'romantic'];
}
