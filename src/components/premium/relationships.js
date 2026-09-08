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

/**
 * Curated plug-and-play human dedications for Instant Cinema.
 * Tender, emotionally resonant, zero robotic clichés.
 */
export const RELATIONSHIP_QUOTES = {
    partner: [
        'To the person who makes ordinary days feel like poetry.',
        'Every year with you is my favorite year yet. Thank you for doing life by my side.',
        'You are my quiet harbor and my greatest adventure, all in one.',
    ],
    husband: [
        'To my favorite teammate, my best friend, and the love of my life.',
        'Thank you for the steady hands, the warm laughter, and a love that never wavers.',
        'Doing life with you is the easiest, sweetest decision I have ever made.',
    ],
    wife: [
        'To the woman who holds my whole world together with grace and love.',
        'You make everywhere feel like home and every day feel worth celebrating.',
        'Thank you for your endless grace, your radiant smile, and your beautiful heart.',
    ],
    boyfriend: [
        'To the one who still gives me butterflies and makes me laugh till my stomach hurts.',
        'Thank you for always showing up, holding my hand, and making life so much brighter.',
        'My favorite place in the world is right wherever you are.',
    ],
    girlfriend: [
        'To the one who brings sunshine, laughter, and so much sweetness to my days.',
        'You have this gentle way of making everything around you bloom with joy.',
        'Celebrating you today and loving you every single day of the year.',
    ],
    mom: [
        'To the woman whose love gave me roots and whose courage gave me wings.',
        'Thank you for the quiet sacrifices and the hugs that always make everything okay.',
        'Everything good and kind in me learned it from watching you.',
    ],
    dad: [
        'For the quiet sacrifices, the steady hands, and the warmth that made home feel safe.',
        'Thank you for teaching me how to stand tall, work hard, and love deeply.',
        'You have always been my hero in the quietest, truest way.',
    ],
    sister: [
        'My first best friend, forever confidante, and keeper of all childhood secrets.',
        'No matter how far life takes us, you will always be home to me.',
        'Thank you for understanding my silence, my chaos, and everything in between.',
    ],
    brother: [
        'From fighting over the TV remote to having each other’s backs for life.',
        'You are the brother everyone wishes they had. Proud of the man you are.',
        'Always in your corner, through every triumph and every stumble.',
    ],
    bestfriend: [
        'For the one who knows all my messy stories and still answers on the first ring.',
        'Thank you for being the person I never have to pretend with.',
        'True friends are rare stars; I’m so lucky to have you in my sky.',
    ],
    friend: [
        'For someone whose loyalty, humor, and genuine presence make life so much better.',
        'Thank you for being the kind of friend who makes tough days easy and good days unforgettable.',
        'So grateful for our shared laughs, wild memories, and genuine bond.',
    ],
    son: [
        'Watching you grow into the person you are today is the greatest pride of my life.',
        'May this year bring you all the courage, adventure, and joy your heart can hold.',
        'Always remember: you are braver than you believe and loved more than you know.',
    ],
    daughter: [
        'To my brightest star who brings more light into this world than words could ever say.',
        'Keep shining with that brilliant heart and fearless spirit of yours.',
        'Watching you conquer life is my favorite thing in the universe.',
    ],
};

export function getRelationshipQuotes(relId) {
    if (!relId) return RELATIONSHIP_QUOTES.partner;
    const key = relId.toLowerCase().replace(/[\s_-]+/g, '');
    return (
        RELATIONSHIP_QUOTES[key] || [
            'For someone whose kindness makes the whole world a little softer.',
            'Some people make the world brighter just by walking into the room. You’re that person for me.',
            'Thank you for being a rare spark of warmth and joy in my life.',
        ]
    );
}

