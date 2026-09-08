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
        letterIntro: null,
        letterMid: null, // null = keep the occasion deck's words
        vows: null,
    },
    family: {
        id: 'family',
        signOff: 'With all my love',
        vowsTitleMain: 'Three promises,',
        vowsTitleAccent: 'from the heart',
        letterIntro:
            'Everything good in my life has been shaped by your love, patience, and guidance.',
        letterMid:
            'You have given me so much over the years, often in quiet ways that asked for nothing in return. Through every high and low, your support has been my steady ground. Words will never be enough to thank you, but I want you to feel just how deeply you are loved and appreciated today.',
        vows: [
            'I promise to call more, stay close, and never let the busyness of life get in the way of family.',
            'I promise to take care of myself, live by the values you taught me, and make you proud.',
            'I promise to always be there for you with open arms, just like you have always been there for me.',
        ],
    },
    friend: {
        id: 'friend',
        signOff: 'Always in your corner',
        vowsTitleMain: 'Three promises,',
        vowsTitleAccent: 'between friends',
        letterIntro:
            'We may not always say the sentimental things out loud, but I hope you know how much our friendship means to me.',
        letterMid:
            'Through the chaotic days, late-night talks, spontaneous plans, and all the times life was overwhelming, you have always shown up. A loyal friend is rare, and I truly hit the jackpot having you in my corner.',
        vows: [
            'I promise to always answer when you need to talk, vent, or just sit in comfortable silence.',
            'I promise to cheer the loudest for your dreams, and remind you of your strength whenever you doubt it.',
            'I promise that no matter how busy adult life gets, our bond will always remain a priority.',
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
