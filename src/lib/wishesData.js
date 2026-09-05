/**
 * Comprehensive dataset of curated birthday wishes organized by category.
 * Used for Programmatic SEO hubs (/wishes/[slug]) and the in-app Wish Inspiration Picker.
 */

export const WISH_CATEGORIES = [
  {
    slug: 'best-friend',
    title: 'Heartfelt & Fun Birthday Wishes for Best Friend',
    navTitle: 'Best Friend',
    shortDescription: 'Meaningful, unforgettable, and cheerful birthday wishes designed to celebrate your closest friend.',
    metaTitle: '50+ Best Birthday Wishes for Best Friend (2026) | BirthdayGen',
    metaDescription: 'Find the perfect birthday wishes for your best friend. From deep heartfelt messages to fun and emotional quotes, customize and send with interactive candles!',
    intro: 'Best friends are the family we choose for ourselves. Whether you have shared years of unforgettable memories, late-night talks, or inside jokes, a best friend deserves a birthday greeting that truly reflects how much they mean to you. Explore our curated collection of birthday wishes for your best friend below—and turn any wish into a personalized interactive digital card in seconds.',
    tips: [
      'Mention a shared memory or milestone from the past year.',
      'Balance humor with genuine appreciation for their loyalty.',
      'Add personal photos in the card to make the memories come alive.',
      'Keep it authentic to your unique dynamic—whether you are banter buddies or soulmates.'
    ],
    faqs: [
      {
        question: 'What is a meaningful short birthday wish for a best friend?',
        answer: '"To my partner-in-crime and truest confidant: thank you for being the brightest light in my life. Wishing you a year full of love, laughter, and triumph. Happy Birthday!"'
      },
      {
        question: 'How can I send an interactive birthday card to my best friend?',
        answer: 'You can choose any wish from this list, click "Create Card With This Wish", and BirthdayGen will pre-fill your message into an interactive page with virtual candles and music you can share via WhatsApp or link.'
      }
    ],
    wishes: [
      {
        id: 'bf-1',
        text: "Happy Birthday to the one who knows all my secrets, shares all my laughs, and always stands by my side. May this year bring you as much happiness as you give to everyone around you!",
        tags: ['Heartfelt', 'Emotional']
      },
      {
        id: 'bf-2',
        text: "Cheers to another year of unstoppable laughter, unforgettable adventures, and surviving our own questionable decisions together. Happy Birthday, bestie!",
        tags: ['Fun', 'Energetic']
      },
      {
        id: 'bf-3',
        text: "True friendship is rare, and having you in my life is the greatest blessing. On your special day, I wish you endless joy, success, and love. You deserve the entire universe!",
        tags: ['Meaningful', 'Inspirational']
      },
      {
        id: 'bf-4',
        text: "Happy Birthday to my favorite human! Thank you for being the calm in my storm, the soundtrack to my joy, and my absolute ride-or-die. Let's make this year legendary!",
        tags: ['Warm', 'Heartfelt']
      },
      {
        id: 'bf-5',
        text: "No distance, no busy schedules, and no passing years can ever change how much you mean to me. Wishing the happiest of birthdays to my forever best friend!",
        tags: ['Long Distance', 'Sweet']
      },
      {
        id: 'bf-6',
        text: "Happy Birthday! May your day be as sparkling as your personality, as warm as your heart, and as fun as our wildest adventures together.",
        tags: ['Cheerful', 'Celebratory']
      }
    ]
  },
  {
    slug: 'funny',
    title: 'Hilarious & Funny Birthday Wishes That Will Make Them Laugh',
    navTitle: 'Funny & Humor',
    shortDescription: 'Witty, sarcastic, and lighthearted birthday messages guaranteed to bring a giant smile.',
    metaTitle: 'Funny Birthday Wishes & Hilarious Messages | BirthdayGen',
    metaDescription: 'Browse the funniest birthday wishes, witty jokes, and sarcastic greetings. Copy your favorite or generate a hilarious interactive candle-blowing card instantly!',
    intro: 'Why settle for a boring "Happy Birthday" when you can roast them with love? A good laugh is the best gift you can give. Whether they are dreading getting older or just appreciate clever humor, these funny birthday greetings strike the ideal balance between playful teasing and genuine celebration.',
    tips: [
      'Poke fun at aging gracefully (or not so gracefully).',
      'Keep it lighthearted and make sure the affection shines through.',
      'Follow up the joke with a warm wish for their health and happiness.',
      'Use interactive candles on BirthdayGen so they can test their lung capacity!'
    ],
    faqs: [
      {
        question: 'What is a witty birthday wish for someone turning older?',
        answer: '"Happy Birthday! Don\'t think of it as getting older—think of it as leveling up, with slightly slower reaction times and higher coffee consumption."'
      },
      {
        question: 'Is it okay to send funny birthday wishes to coworkers?',
        answer: 'Yes, as long as the humor is friendly and professional. Stick to universal topics like cake, caffeine, and surviving Mondays together!'
      }
    ],
    wishes: [
      {
        id: 'fn-1',
        text: "Happy Birthday! Don't worry about getting older—you're still way younger than you will be next year. Enjoy the cake while your metabolism still tolerates it!",
        tags: ['Humorous', 'Witty']
      },
      {
        id: 'fn-2',
        text: "I was going to get you something magnificent, expensive, and unforgettable for your birthday, but then I remembered you already have my friendship. You're welcome!",
        tags: ['Sarcastic', 'Playful']
      },
      {
        id: 'fn-3',
        text: "Scientists say that birthdays are good for your health: people who have the most birthdays live the longest! Here's to surviving another whole year.",
        tags: ['Clever', 'Cheeky']
      },
      {
        id: 'fn-4',
        text: "Happy Birthday! Please blow out the virtual candles gently so you don't trigger the smoke alarms. Sending you lots of love (and anti-aging vibes)!",
        tags: ['Interactive', 'Candles']
      },
      {
        id: 'fn-5',
        text: "Another year older, none the wiser! But at least you still look good enough to not need the high-contrast filter. Happy Birthday!",
        tags: ['Lighthearted', 'Banter']
      },
      {
        id: 'fn-6',
        text: "May your day be filled with lots of love, overflowing champagne, and friends who pretend not to notice your gray hairs. Happy Birthday!",
        tags: ['Funny', 'Charming']
      }
    ]
  },
  {
    slug: 'romantic',
    title: 'Romantic & Sweet Birthday Wishes for Your Partner',
    navTitle: 'Romantic & Partner',
    shortDescription: 'Deep, affectionate, and romantic birthday love letters for your boyfriend, girlfriend, or spouse.',
    metaTitle: 'Romantic Birthday Wishes for Boyfriend, Girlfriend & Spouse | BirthdayGen',
    metaDescription: 'Discover romantic birthday wishes that melt hearts. Craft an intimate digital birthday love card with romantic music, favorite couple photos, and candles.',
    intro: 'Your partner’s birthday is an opportunity to express the depth of your admiration, gratitude, and devotion. From gentle affirmations to passionate declarations, these romantic birthday wishes celebrate the love you share and the future you are building hand in hand.',
    tips: [
      'Remind them of the exact moment you fell in love.',
      'Express gratitude for how they make everyday life brighter.',
      'Add romantic background music to your BirthdayGen card for maximum ambiance.',
      'Include a couple photo slideshow capturing your favorite trips and dates.'
    ],
    faqs: [
      {
        question: 'What is the most romantic birthday wish for a soulmate?',
        answer: '"To the love of my life: every day with you feels like a dream come true, but today is the most special because it brought you into this world. Happy Birthday, my heart."'
      },
      {
        question: 'Can I add our personal photos and music to the card?',
        answer: 'Yes! BirthdayGen allows you to upload multiple romantic memories into an interactive photo carousel and plays ambient celebration music.'
      }
    ],
    wishes: [
      {
        id: 'ro-1',
        text: "Happy Birthday to my favorite person in the universe. Loving you is the easiest, most wonderful adventure of my life. May all your sweetest dreams come true today.",
        tags: ['Romantic', 'Tender']
      },
      {
        id: 'ro-2',
        text: "Every single day with you feels like a celebration, but today I get to celebrate the day your beautiful soul was born. Thank you for filling my life with endless warmth and joy.",
        tags: ['Soulful', 'Deep']
      },
      {
        id: 'ro-3',
        text: "To the one who holds my heart: your smile brightens my darkest days and your kindness inspires me endlessly. Wishing you the most magical birthday, my love.",
        tags: ['Affectionate', 'Sweet']
      },
      {
        id: 'ro-4',
        text: "Happy Birthday, gorgeous! Life with you is a continuous melody of laughter, adventures, and comfort. Here is to growing older, wiser, and even more in love with you every day.",
        tags: ['Passionate', 'Poetic']
      },
      {
        id: 'ro-5',
        text: "You are my home, my anchor, and my sweetest blessing. May your birthday be as breathtaking and lovely as you are to me every single second.",
        tags: ['Heartfelt', 'Devoted']
      }
    ]
  },
  {
    slug: 'family',
    title: 'Warm & Heartfelt Birthday Wishes for Family (Mom, Dad, Siblings)',
    navTitle: 'Family & Parents',
    shortDescription: 'Appreciative, loving birthday greetings for parents, brothers, sisters, and grandparents.',
    metaTitle: 'Birthday Wishes for Family: Mom, Dad, Sister & Brother | BirthdayGen',
    metaDescription: 'Express your gratitude with heartfelt birthday wishes for family members. Design a warm digital birthday greeting with family photos and memories.',
    intro: 'Family provides our earliest foundation and our most enduring memories. Whether thanking a parent for their sacrifices, cherishing a sister\'s wisdom, or celebrating a brother\'s accomplishments, these family birthday wishes help you convey authentic gratitude and timeless love.',
    tips: [
      'Acknowledge the quiet sacrifices and unconditional support your family gives.',
      'Share a childhood memory that still makes you smile.',
      'Emphasize how proud you are to be related to them.',
      'Upload throwback family photos into the BirthdayGen gallery for a nostalgic surprise.'
    ],
    faqs: [
      {
        question: 'How do you say Happy Birthday to a parent meaningfully?',
        answer: '"Mom/Dad, thank you for your unwavering guidance, love, and patience. Everything good in me started with you. Wishing you health, happiness, and peace on your birthday."'
      }
    ],
    wishes: [
      {
        id: 'fa-1',
        text: "Happy Birthday! Thank you for always being our family's pillar of strength, wisdom, and unconditional love. May this year shower you with abundant health, peace, and smiles.",
        tags: ['Parents', 'Respectful']
      },
      {
        id: 'fa-2',
        text: "To the best sibling anyone could ask for: from fighting over the TV remote to having each other's backs through thick and thin, I wouldn't trade you for the world. Happy Birthday!",
        tags: ['Siblings', 'Nostalgic']
      },
      {
        id: 'fa-3',
        text: "Happy Birthday, Mom! Your love is the gentle comfort that guides my life. I hope today brings you as much serenity, joy, and pampering as you deserve.",
        tags: ['Mom', 'Tender']
      },
      {
        id: 'fa-4',
        text: "Happy Birthday, Dad! Thank you for leading by example, teaching me resilience, and always believing in me even when I doubted myself. Have an extraordinary day!",
        tags: ['Dad', 'Inspiring']
      },
      {
        id: 'fa-5',
        text: "Growing up together has been the sweetest part of my life story. Wishing my incredible sibling a birthday overflowing with fun, success, and your favorite treats!",
        tags: ['Brother/Sister', 'Warm']
      }
    ]
  },
  {
    slug: 'milestones',
    title: 'Milestone Birthday Wishes (18th, 21st, 30th, 50th Celebrations)',
    navTitle: 'Milestones (18th, 21st, 50th)',
    shortDescription: 'Commemorate historic life chapters with inspiring milestone birthday messages.',
    metaTitle: 'Milestone Birthday Wishes (18th, 21st, 30th, 40th, 50th) | BirthdayGen',
    metaDescription: 'Celebrate monumental birthdays with inspiring milestone greetings. Perfect for turning 18, 21, 30, 40, or 50. Generate an interactive milestone card today!',
    intro: 'Milestone birthdays mark the transition into exciting new chapters of life. Whether stepping into adulthood at 18, reaching legal freedom at 21, embracing maturity at 30, or celebrating half a century of wisdom at 50, these milestone wishes capture the grandeur and significance of the occasion.',
    tips: [
      'Celebrate what makes this specific age or decade iconic.',
      'Reflect on their accomplishments so far and express excitement for their next era.',
      'Encourage bold dreams, confidence, and self-discovery.',
      'Use the Retro Neon or Elegant theme on BirthdayGen to match the celebration vibe.'
    ],
    faqs: [
      {
        question: 'What do you write for a 21st birthday card?',
        answer: '"Welcome to 21! May your twenties be filled with bold ambitions, thrilling adventures, genuine friendships, and memories you will cherish forever."'
      },
      {
        question: 'What is a respectful wish for a 50th golden jubilee birthday?',
        answer: '"Cheers to 50 years of brilliance, resilience, and grace. Your life has enriched so many around you. May your next chapter be the most joyful yet!"'
      }
    ],
    wishes: [
      {
        id: 'ms-1',
        text: "Welcome to adulthood! Happy 18th Birthday! May the journey ahead be illuminated with courage, freedom, and endless opportunities to make your mark on the world.",
        tags: ['18th Birthday', 'Inspirational']
      },
      {
        id: 'ms-2',
        text: "Happy 21st Birthday! Raise a glass to freedom, adventures, lifelong memories, and conquering every dream you have ever held. Have the time of your life!",
        tags: ['21st Birthday', 'Celebratory']
      },
      {
        id: 'ms-3',
        text: "Welcome to the roaring thirties! Goodbye to uncertainty, hello to confidence, prosperity, and living life entirely on your own terms. Happy 30th Birthday!",
        tags: ['30th Birthday', 'Empowering']
      },
      {
        id: 'ms-4',
        text: "Happy 50th Birthday! Half a century of wisdom, generosity, laughter, and distinction. You wear your years with unmatched elegance. Here's to your golden chapter!",
        tags: ['50th Birthday', 'Golden Milestone']
      },
      {
        id: 'ms-5',
        text: "Age is merely the number of years the world has been lucky enough to enjoy your presence. Wishing you an unforgettable milestone celebration!",
        tags: ['Universal Milestone', 'Timeless']
      }
    ]
  },
  {
    slug: 'short-sweet',
    title: 'Short, Sweet & Aesthetic Birthday Wishes for Cards & WhatsApp',
    navTitle: 'Short & Sweet',
    shortDescription: 'Crisp, modern, and aesthetic one-line greetings perfect for cards, SMS, and captions.',
    metaTitle: 'Short & Sweet Birthday Wishes | One-Liner Birthday Greetings | BirthdayGen',
    metaDescription: 'Looking for aesthetic and short birthday greetings? Browse crisp one-liners, Instagram caption wishes, and instant cards ready to share on WhatsApp.',
    intro: 'Sometimes simplicity speaks louder than paragraphs. When you need a quick, meaningful, or aesthetic message for an Instagram caption, WhatsApp status, or greeting card tag, these short and sweet birthday wishes deliver maximum punch in just a few words.',
    tips: [
      'Keep it punchy, heartfelt, and memorable.',
      'Add uplifting emojis to infuse energy and warmth.',
      'Ideal for mobile greeting cards and quick text messages.'
    ],
    faqs: [
      {
        question: 'What is a good short birthday wish for a friend?',
        answer: '"Wishing you another year of big smiles, good vibes, and dream chasing. Happy Birthday!"'
      }
    ],
    wishes: [
      {
        id: 'ss-1',
        text: "Wishing you a year filled with sunshine, gentle blessings, and boundless laughter. Happy Birthday!",
        tags: ['Aesthetic', 'Short']
      },
      {
        id: 'ss-2',
        text: "Happy Birthday! Keep shining, keep dreaming, and never stop being your authentic wonderful self.",
        tags: ['Inspirational', 'Modern']
      },
      {
        id: 'ss-3',
        text: "Cheers to another chapter of health, happiness, and unforgettable moments. Have a fabulous birthday!",
        tags: ['Crisp', 'Cheerful']
      },
      {
        id: 'ss-4',
        text: "May your day be as special, lovely, and radiant as you are to everyone around you. Happy Birthday!",
        tags: ['Sweet', 'Warm']
      },
      {
        id: 'ss-5',
        text: "Sending you huge birthday love and the warmest hugs across the miles. Enjoy your day to the fullest!",
        tags: ['Friendly', 'Short']
      }
    ]
  }
];

export function getCategoryBySlug(slug) {
  return WISH_CATEGORIES.find((category) => category.slug === slug);
}

export function getAllCategories() {
  return WISH_CATEGORIES;
}
