/**
 * Occasion decks: every word the premium universe speaks lives here, so one
 * `?occasion=` param reskins the whole journey.
 *
 * Placeholders {to} / {from} are filled at render time through JSX (never
 * raw HTML), so names from the URL stay XSS-safe. Titles are { main, accent }
 * pairs, accent renders in gold. House rule: no em dashes, no en dashes.
 * Short sentences. Concrete details. Words a real person would actually say.
 */

export const OCCASION_IDS = ['birthday', 'anniversary', 'valentine', 'friendship'];

export function fill(template, { to = '', from = '' } = {}) {
    return String(template || '')
        .replaceAll('{to}', to)
        .replaceAll('{from}', from);
}

const birthday = {
    id: 'birthday',
    label: 'Birthday',
    heroKicker: 'Happy Birthday',
    heroSub:
        'Another year around the sun, and the world is so much better with you in it. Today is all about celebrating you.',
    letterIntro:
        'Some people make life feel lighter, warmer, and so much more meaningful just by being around. That is what you have always done for me.',
    letterMid:
        'I do not say this nearly often enough, but having you in my life is something I never take for granted. Through busy weeks, quiet evenings, and everything life throws our way, your warmth and kindness make all the difference.',
    letterCloseMain: 'So today is about pausing to celebrate you and everything you are',
    letterCloseAge: ', all {age} wonderful years of who you have become. May this year bring you all the peace, laughter, and happiness you deserve',
    reasonsTitleMain: 'A few of the things',
    reasonsTitleAccent: 'I love about you',
    reasonsSub: 'Just six of the countless reasons you mean so much.',
    reasons: [
        { e: '✨', t: 'The way you listen', d: 'You do not just hear what people say; you truly pay attention. Talking with {to} always feels safe and comforting.' },
        { e: '☀️', t: 'Quiet kindness', d: 'The thoughtful little things you do when no one is watching. You make the people around you feel seen and valued.' },
        { e: '🌿', t: 'Calm in the storm', d: 'When everything feels rushed or messy, your presence has this quiet way of making everything feel manageable.' },
        { e: '😂', t: 'Real laughter', d: 'Those sudden moments where we start laughing until our eyes tear up. Those are some of my favorite memories.' },
        { e: '💛', t: 'Your steady heart', d: 'You show up for the people you care about with so much loyalty and sincerity. That is so rare.' },
        { e: '💫', t: 'Being genuinely you', d: 'Never pretending to be anyone else. Staying true, kind, and authentic every single day.' },
    ],
    vowsTitleMain: 'Three promises,',
    vowsTitleAccent: 'from my heart',
    vows: [
        'I promise to always celebrate your wins, big and small, just as loudly as you deserve.',
        'I promise to stand by you on the heavy days, and remind you of your strength when you forget it.',
        'I promise to always make time for what matters, keep listening, and be in your corner no matter what.',
    ],
    marquee1: ['Happy Birthday', '{to}', 'Celebrating you', 'Always in your corner'],
    marquee2: ['Another year', 'A beautiful journey', 'Happy Birthday {to}'],
    finaleTitleMain: 'Make a wish, {to}.',
    finaleTitleAccent: 'You deserve every bit of it.',
};

const anniversary = {
    id: 'anniversary',
    label: 'Anniversary',
    heroKicker: 'Happy Anniversary',
    heroSub:
        'Through every season, every quiet evening, and every step along the way. Here is to us, and the life we are building together.',
    letterIntro:
        'Looking back at our journey, my favorite part of every single day is still just coming home to you.',
    letterMid:
        'We have shared quiet mornings, big dreams, and all the messy, beautiful moments in between. You are my anchor, my best friend, and the person I want by my side through everything life brings.',
    letterCloseMain: 'Choosing you was the easiest and best decision I ever made',
    letterCloseAge: ', and {age} years later, I would still choose you in a heartbeat, in every lifetime',
    reasonsTitleMain: 'Why my heart',
    reasonsTitleAccent: 'still chooses you',
    reasonsSub: 'Through every chapter, you are still my favorite person.',
    reasons: [
        { e: '🏡', t: 'Home is a person', d: 'Places and routines change, but coming back to {to} always feels like home.' },
        { e: '🤝', t: 'True partnership', d: 'Big dreams, daily chores, and quiet worries. There is nobody else I would rather walk through life with.' },
        { e: '🌧️', t: 'Weathering the storms', d: 'We have faced hard days and come out holding hands tighter. That quiet resilience means everything to me.' },
        { e: '☕', t: 'The quiet mornings', d: 'Shared glances over morning tea, comfortable silences, and knowing we do not need words to understand each other.' },
        { e: '✨', t: 'Growing together', d: 'Learning, stumbling, and figuring life out side by side. I love who we are becoming together.' },
        { e: '❤️', t: 'That familiar spark', d: 'Years in, you can still catch my eye across a crowded room and make my whole world slow down.' },
    ],
    vowsTitleMain: 'Three promises,',
    vowsTitleAccent: 'renewed today',
    vows: [
        'I promise to keep choosing you every morning, in the quiet moments and the busy ones alike.',
        'I promise to listen with patience, hold your hand when things get heavy, and always be your biggest supporter.',
        'I promise that as the years go by, I will still look at you with the exact same gratitude and love I feel today.',
    ],
    marquee1: ['Happy Anniversary', '{to}', 'Still you and me', 'Side by side'],
    marquee2: ['Every single day', 'Our story', 'Always {to}'],
    finaleTitleMain: 'Close your eyes, {to}.',
    finaleTitleAccent: 'Here is to a lifetime more.',
};

const valentine = {
    id: 'valentine',
    label: 'Valentine’s Day',
    heroKicker: 'Happy Valentine’s Day',
    heroSub:
        'In a busy world that moves too fast, you are my favorite place to pause. Thank you for being my person.',
    letterIntro:
        'I wanted to give you something genuine, straight from my heart.',
    letterMid:
        'Real love is not about grand speeches. It is the comfort of your voice at the end of a long day, the way you make me smile without trying, and the quiet certainty that I want to share every tomorrow with you.',
    letterCloseMain: 'Of all the people in the world, my heart found its home in you',
    letterCloseAge: ', celebrating {age} years of loving you, and falling in love with you all over again every single day',
    reasonsTitleMain: 'What you mean',
    reasonsTitleAccent: 'to my heart',
    reasonsSub: 'The quiet, genuine reasons you are so deeply loved.',
    reasons: [
        { e: '💌', t: 'The way you look at me', d: 'With so much warmth and patience that all my worries immediately soften.' },
        { e: '💬', t: 'My favorite message', d: 'No matter how hectic the day gets, seeing {to} on my screen still instantly brings a smile to my face.' },
        { e: '🛡️', t: 'Feeling safe with you', d: 'I never have to put on a mask or pretend. You accept me exactly as I am, flaws and all.' },
        { e: '🫂', t: 'Your comforting warmth', d: 'A simple hug from you at the end of an exhausting day can reset my entire world.' },
        { e: '🌷', t: 'Your gentle heart', d: 'The way you care about the little details and show up with quiet, unconditional tenderness.' },
        { e: '💖', t: 'My favorite person', d: 'The first person I want to tell good news to, and the only person I want to hold when times get tough.' },
    ],
    vowsTitleMain: 'Three promises,',
    vowsTitleAccent: 'sealed with love',
    vows: [
        'I promise to love you gently on the quiet days, and fiercely when life gets hard.',
        'I promise to always make you feel heard, cherished, and deeply appreciated for everything you are.',
        'I promise to keep learning you, holding you close, and building a love that only grows deeper with time.',
    ],
    marquee1: ['Happy Valentine’s', '{to}', 'My whole heart', 'Always with you'],
    marquee2: ['You and me', 'Safe with you', 'Forever {to}'],
    finaleTitleMain: 'Close your eyes, {to}.',
    finaleTitleAccent: 'My heart is yours.',
};

const friendship = {
    id: 'friendship',
    label: 'Friendship',
    heroKicker: 'To My Favourite Person',
    heroSub:
        'To the one who knows me best and has always had my back. Having you in my life is one of my greatest blessings.',
    letterIntro:
        'We do not say the serious stuff out loud very often, but today I want you to know how much you mean to me.',
    letterMid:
        'Through the chaotic days, late-night talks, spontaneous plans, and all the times life was overwhelming, you have always shown up. A loyal friend is rare, and I truly hit the jackpot having you in my corner.',
    letterCloseMain: 'Thank you for being my rock, my sounding board, and my favorite human',
    letterCloseAge: ', today and through all {age} years of memories we have shared together',
    reasonsTitleMain: 'Why you are',
    reasonsTitleAccent: 'one of a kind',
    reasonsSub: 'Six reminders of why our bond means so much to me.',
    reasons: [
        { e: '📞', t: 'Always one call away', d: 'No matter what time it is or how busy life gets, I know {to} will pick up and have my back.' },
        { e: '🤝', t: 'Zero judgment zone', d: 'I can speak my mind, share my wildest thoughts, or admit my worst mistakes without ever being judged.' },
        { e: '😂', t: 'Uncontrollable laughter', d: 'Those moments where one look sets us off and we literally cannot breathe from laughing so hard.' },
        { e: '🧭', t: 'Honest reality check', d: 'You cheer me on when I need courage, and tell me the honest truth when I need to hear it.' },
        { e: '🌟', t: 'Memories in every corner', d: 'From random conversations to road trips and misadventures, all my favorite stories have you in them.' },
        { e: '🛡️', t: 'Loyalty through it all', d: 'People come and go, but with you, it always feels like our bond never wavers.' },
    ],
    vowsTitleMain: 'Three promises,',
    vowsTitleAccent: 'between friends',
    vows: [
        'I promise to always answer when you need to talk, vent, or just sit in comfortable silence.',
        'I promise to cheer the loudest for your dreams, and remind you of your worth whenever you doubt it.',
        'I promise that no matter how busy adult life gets, our friendship will always remain a priority.',
    ],
    marquee1: ['Real ones forever', '{to}', 'Through everything', 'Got your back'],
    marquee2: ['True friendship', 'Loyalty and laughter', 'Cheers to {to}'],
    finaleTitleMain: 'Make a wish, {to}.',
    finaleTitleAccent: 'Here is to many more chapters.',
};

export const OCCASIONS = { birthday, anniversary, valentine, friendship };

export function getOccasion(id) {
    return OCCASIONS[OCCASION_IDS.includes(id) ? id : 'birthday'];
}
