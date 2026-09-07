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
        'On your day, the stars filed a complaint. You were outshining them. So tonight they cleared the whole sky, just for you.',
    letterMid:
        'I have rehearsed this a hundred times. In the shower, in traffic, at 2am. Every version ends the same way. I got absurdly lucky the day our paths crossed.',
    letterCloseMain: 'So today is not just your birthday. It is the day the world quietly became a better place',
    letterCloseAge: ', all {age} glorious years of you',
    reasonsTitleMain: 'A few of the',
    reasonsTitleAccent: 'million reasons',
    reasonsSub: 'Scientists gave up counting. We stopped at six.',
    reasons: [
        { e: '🌙', t: 'The 2am light', d: 'The world sleeps, but {to} dreams out loud. Somehow 2am feels like magic hour around you.' },
        { e: '☀️', t: 'Human sunrise', d: 'Rooms get warmer when you walk in. Strangers smile more. Grumpy mornings give up within minutes.' },
        { e: '🛟', t: 'The calm in chaos', d: 'Storms arrive and deadlines scream, and one look from you says we have got this.' },
        { e: '🎭', t: 'Laugh warranty', d: 'A lifetime supply of terrible jokes, delivered with total confidence. Warranty never expires.' },
        { e: '🌱', t: 'Growth dealer', d: 'Everyone around you turns into a slightly braver, slightly kinder version of themselves.' },
        { e: '💫', t: 'Plot twist', d: 'Just when life gets predictable, you go and do something wonderfully, impossibly you.' },
    ],
    vowsTitleMain: 'Three vows,',
    vowsTitleAccent: 'valid forever',
    vows: [
        'I vow to always save you the last bite. Unless it is really, really good. Then we split it.',
        'I vow to be your emergency contact, your hype squad, and the person who picks up at 3am.',
        'I vow to celebrate you this loudly every single year, starting right now.',
    ],
    marquee1: ['Happy Birthday', '{to}', 'Make a wish', 'Sealed with love'],
    marquee2: ['Three vows', 'One sky', 'Infinite {to}'],
    finaleTitleMain: 'Close your eyes, {to}.',
    finaleTitleAccent: 'Make it a big one.',
};

const anniversary = {
    id: 'anniversary',
    label: 'Anniversary',
    heroKicker: 'Happy Anniversary',
    heroSub:
        'Years ago the universe made its best decision. It introduced us. Tonight every star showed up to celebrate the day it all began.',
    letterMid:
        'They say the best love stories never end. Ours just keeps adding plot twists. Every laugh, every late night talk, every ordinary Tuesday you turned into a memory I replay.',
    letterCloseMain: 'So today is not just our anniversary. It is proof that the best decision I ever made',
    letterCloseAge: ', {age} years ago, was choosing you. And I would choose you again in every lifetime',
    reasonsTitleMain: 'Why I would',
    reasonsTitleAccent: 'choose you again',
    reasonsSub: 'Every lifetime. Every universe. No notes.',
    reasons: [
        { e: '💍', t: 'The day everything changed', d: 'One yes rewrote my whole future. Still my favourite story to tell.' },
        { e: '🏡', t: 'Home is a person', d: 'Addresses changed and cities changed. Coming back to {to} never did. That has always been home.' },
        { e: '🌧️', t: 'Storm tested', d: 'We have weathered the hard years and come out holding hands tighter. That says everything.' },
        { e: '😂', t: 'Still my favourite laugh', d: 'Years in, one look from you across a crowded room can still undo me completely.' },
        { e: '🤝', t: 'Teammate for life', d: 'Big dreams, small chores, 2am worries. There is nobody else I would rather do all of it with.' },
        { e: '🔥', t: 'The spark kept', d: 'The butterflies were supposed to fade. Nobody told us. We just got better at flying.' },
    ],
    vowsTitleMain: 'Three vows,',
    vowsTitleAccent: 'renewed today',
    vows: [
        'I vow to keep dating you. Fancy dinners, cheap chai, and everything gloriously in between.',
        'I vow to fight fair, forgive fast, and always take your side in public. We can argue about it later.',
        'I vow that ten anniversaries from now, I will still be trying to outdo this one.',
    ],
    marquee1: ['Happy Anniversary', '{to}', 'Still us', 'Sealed with love'],
    marquee2: ['Every lifetime', 'One choice', 'Always {to}'],
    finaleTitleMain: 'Close your eyes, {to}.',
    finaleTitleAccent: 'Wish for us.',
};

const valentine = {
    id: 'valentine',
    label: 'Valentine’s Day',
    heroKicker: 'Happy Valentine’s Day',
    heroSub:
        'Roses die in a week and chocolates by Friday. So {from} built you a universe instead. One that never wilts, never melts, and never stops saying it.',
    letterMid:
        'I could have bought the standard teddy bear. Instead I stayed up building you this. “You are cute” fits on a card. What I feel for you needed stars, vows, and a whole sky.',
    letterCloseMain: 'So this Valentine’s is not about grand gestures. It is a quiet, certain truth',
    letterCloseAge: ', {age} Valentines and counting. Of all the hearts in the world, mine keeps walking back to yours',
    reasonsTitleMain: 'Why my heart',
    reasonsTitleAccent: 'picked you',
    reasonsSub: 'It had billions of options. Excellent taste, honestly.',
    reasons: [
        { e: '💘', t: 'The first glance', d: 'Somewhere between hi and that first real laugh, my heart quietly resigned from single life.' },
        { e: '📱', t: 'The good morning effect', d: 'One text from {to} beats coffee, sunshine, and good news combined. Tested daily.' },
        { e: '🎶', t: 'My favourite song', d: 'Every playlist has that one track that sounds exactly like being held by you.' },
        { e: '🧲', t: 'Impossible gravity', d: 'Crowded room, busy street, bad day. I still orbit straight back to you.' },
        { e: '💌', t: 'Old school romance', d: 'In a world of situationships and midnight blue ticks, you are handwritten letters and forehead kisses.' },
        { e: '♾️', t: 'The long game', d: 'Crushes expire and butterflies migrate. What I feel for you just keeps signing extensions.' },
    ],
    vowsTitleMain: 'Three vows,',
    vowsTitleAccent: 'sealed today',
    vows: [
        'I vow to be the reason you check your phone smiling. Today, and on random Tuesdays forever.',
        'I vow to learn your coffee order, your bad day playlist, and exactly how you like to be held.',
        'I vow that next Valentine’s, I will have to top a whole universe. Challenge accepted.',
    ],
    marquee1: ['Be mine', '{to}', 'Happy Valentine’s', 'Sealed with a kiss'],
    marquee2: ['One heart', 'Two idiots', 'Infinite {to}'],
    finaleTitleMain: 'Close your eyes, {to}.',
    finaleTitleAccent: 'Wish for love.',
};

const friendship = {
    id: 'friendship',
    label: 'Friendship',
    heroKicker: 'For My Favourite Human',
    heroSub:
        'No occasion. No reason. {from} just decided the world should know that having you in it is ridiculously good luck.',
    letterMid:
        'You have seen me at my worst. Tired, broke, mid haircut disaster. And you stayed. Mostly for the snacks, but still. That is the whole review. Five stars.',
    letterCloseMain: 'So this is not a gift. It is a receipt. Proof that somewhere out there, someone is really glad you exist',
    letterCloseAge: ', today and through all {age} years we have survived together',
    reasonsTitleMain: 'Proof you are',
    reasonsTitleAccent: 'my favourite human',
    reasonsSub: 'Exhibit A through F. Case closed.',
    reasons: [
        { e: '🍟', t: 'Fries thief', d: 'You steal my fries and I let you. Scientists confirm this is the highest form of trust.' },
        { e: '📞', t: 'The 2am hotline', d: 'Bad day? One call and {to} arrives with snacks, sarcasm, and a plan. Usually in that order.' },
        { e: '🤪', t: 'Partner in nonsense', d: 'Every stupid idea I have ever had was improved by you saying wait, I have a better stupid idea.' },
        { e: '🛡️', t: 'Secret keeper', d: 'You know things about me that would end me. My secrets have never been safer.' },
        { e: '😭', t: 'Laugh till it hurts', d: 'That wheezing, crying, cannot breathe laugh. My abs have never seen a gym, only you.' },
        { e: '🧭', t: 'Human GPS', d: 'Lost in life, lost in the city, lost mid sentence. You always know the way back.' },
    ],
    vowsTitleMain: 'Three promises,',
    vowsTitleAccent: 'pinky swear',
    vows: [
        'I vow to always reply “on my way” even when I have not left yet. Some traditions are sacred.',
        'I vow to hype up your worst ideas just enough that you actually do them.',
        'I vow that distance, jobs, and adulting will never downgrade us. Best friends load forever.',
    ],
    marquee1: ['Partners in crime', '{to}', 'No occasion needed', 'Sealed with snacks'],
    marquee2: ['Three promises', 'Zero romance', 'Infinite {to}'],
    finaleTitleMain: 'Close your eyes, {to}.',
    finaleTitleAccent: 'Wish big, legend.',
};

export const OCCASIONS = { birthday, anniversary, valentine, friendship };

export function getOccasion(id) {
    return OCCASIONS[OCCASION_IDS.includes(id) ? id : 'birthday'];
}
