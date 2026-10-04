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
    metaTitle: 'Best Birthday Wishes for Best Friend (2026) | BirthdayGen',
    metaDescription: 'Find the perfect birthday wishes for your best friend. From deep heartfelt messages to fun and emotional quotes, customize and send with interactive candles!',
    intro: 'Best friends are the family we choose for ourselves. Whether you have shared years of unforgettable memories, late-night talks, or inside jokes, a best friend deserves a birthday greeting that truly reflects how much they mean to you. Explore our curated collection of birthday wishes for your best friend below, and turn any wish into a personalized interactive digital card in seconds.',
    tips: [
      'Mention a shared memory or milestone from the past year.',
      'Balance humor with genuine appreciation for their loyalty.',
      'Add personal photos in the card to make the memories come alive.',
      'Keep it authentic to your unique dynamic, whether you are banter buddies or soulmates.'
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
        answer: '"Happy Birthday! Don\'t think of it as getting older, think of it as leveling up, with slightly slower reaction times and higher coffee consumption."'
      },
      {
        question: 'Is it okay to send funny birthday wishes to coworkers?',
        answer: 'Yes, as long as the humor is friendly and professional. Stick to universal topics like cake, caffeine, and surviving Mondays together!'
      }
    ],
    wishes: [
      {
        id: 'fn-1',
        text: "Happy Birthday! Don't worry about getting older, you're still way younger than you will be next year. Enjoy the cake while your metabolism still tolerates it!",
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
  },
  {
    slug: 'mom',
    title: 'Touching Birthday Wishes for Mom From Daughter & Son',
    navTitle: 'Mom',
    shortDescription: 'Tender, grateful birthday messages that tell your mother how much her love means to you.',
    metaTitle: 'Heartfelt Birthday Wishes for Mom (2026) | BirthdayGen',
    metaDescription: 'Find touching birthday wishes for your mom from daughter or son. Turn any message into an interactive card with photos, music and blowable candles!',
    intro: 'Nobody deserves a beautiful birthday surprise more than Mom. Whether you live next door or across the world, these heartfelt birthday wishes for mothers help you say the thank-you that everyday life rarely makes room for, and with BirthdayGen you can deliver it as an interactive page with her favourite photos.',
    tips: [
      'Name something specific she did for you, the 5am lunches, the exam-night courage, the quiet sacrifices.',
      'Tell her what of hers you see in yourself; mothers treasure that above all.',
      'If words feel small, let family photos in a BirthdayGen gallery do the talking.',
      'End with a wish for HER, health, rest, joy, not just gratitude for what she gives.'
    ],
    faqs: [
      {
        question: 'What is the most touching birthday wish for a mom?',
        answer: '"Mom, everything I am started with your love. Thank you for the thousand invisible things you do every day. I wish you health, peace, and a year as beautiful as your heart. Happy Birthday!"'
      },
      {
        question: 'How can I surprise my mom on her birthday from far away?',
        answer: 'Create a BirthdayGen page with childhood photos, a voice-like personal message, and virtual candles she can blow out on her phone, then send the link on WhatsApp right at midnight.'
      }
    ],
    wishes: [
      {
        id: 'mo-1',
        text: "Happy Birthday, Mom! You are the warmth in every memory I own. May this year give back to you even a fraction of the love you pour into everyone around you.",
        tags: ['Heartfelt', 'Grateful']
      },
      {
        id: 'mo-2',
        text: "To the woman who taught me kindness by living it, thank you for every packed lunch, every late-night talk, every time you believed in me first. Have the happiest birthday, Mom!",
        tags: ['Thankful', 'Nostalgic']
      },
      {
        id: 'mo-3',
        text: "Mom, I catch myself saying your phrases, cooking your recipes, and loving the way you love, and I have never been prouder. Wishing you a birthday as wonderful as you are.",
        tags: ['Emotional', 'Daughter']
      },
      {
        id: 'mo-4',
        text: "Happy Birthday to my first home and forever safe place! Today we celebrate YOU, no chores, no worries, only cake, rest, and being spoiled the way you spoil us.",
        tags: ['Warm', 'Celebratory']
      },
      {
        id: 'mo-5',
        text: "They say superheroes wear capes; mine wears an apron and knows exactly when I need a hug over the phone. Happy Birthday, supermom!",
        tags: ['Sweet', 'Playful']
      },
      {
        id: 'mo-6',
        text: "Mom, may your year be gentle with you, good health, slow mornings, and dreams that are finally about YOU. You deserve every bit of happiness coming your way.",
        tags: ['Blessing', 'Tender']
      }
    ]
  },
  {
    slug: 'dad',
    title: 'Respectful & Warm Birthday Wishes for Dad',
    navTitle: 'Dad',
    shortDescription: 'Strong, sincere birthday greetings honouring your father\'s guidance, humour, and quiet love.',
    metaTitle: 'Best Birthday Wishes for Dad (2026) | BirthdayGen',
    metaDescription: 'Honour your father with warm birthday wishes for dad, from respectful to funny. Pair any wish with photos and make him an interactive birthday card!',
    intro: 'Dads often love quietly, through fixed things, funded dreams, and bad jokes told with total confidence. These birthday wishes for fathers put words to that steady love, whether your dad is sentimental, stoic, or the family comedian.',
    tips: [
      'Thank him for something concrete: the driving lessons, the career advice, the safety net.',
      'Match his style, short and strong for stoic dads, warm and funny for softies.',
      'Old photos of you two together will undo even the toughest dad. Add them to the card.',
      'A little humour about his jokes or his naps always lands, keep it affectionate.'
    ],
    faqs: [
      {
        question: 'What is a good short birthday message for dad?',
        answer: '"Happy Birthday, Dad! Strong, kind, and always there, thank you for being my lifelong hero. Wishing you health and happiness today and always."'
      },
      {
        question: 'How do I make my dad emotional on his birthday?',
        answer: 'Tell him how his example shaped a specific choice in your life, then show it: a photo gallery of milestones he made possible hits harder than any gift.'
      }
    ],
    wishes: [
      {
        id: 'da-1',
        text: "Happy Birthday, Dad! You taught me how to work hard, stand tall, and laugh anyway. I hope today treats you like the legend you are.",
        tags: ['Respectful', 'Warm']
      },
      {
        id: 'da-2',
        text: "To my first hero and permanent advisor, thank you for every sacrifice you never mentioned and every lesson you never charged for. Have a fantastic birthday, Papa!",
        tags: ['Grateful', 'Hero']
      },
      {
        id: 'da-3',
        text: "Dad, your jokes got worse and your wisdom got better, what a trade! Wishing you a birthday full of cake, naps, and zero remote-control fights.",
        tags: ['Funny', 'Playful']
      },
      {
        id: 'da-4',
        text: "Happy Birthday to the man whose shoulders I stood on, literally and in life. May this year bring you health, pride, and everything you quietly wished for us.",
        tags: ['Emotional', 'Proud']
      },
      {
        id: 'da-5',
        text: "Papa, distance means nothing: your voice still guides every big decision I make. Celebrating you today with all my heart. Happy Birthday!",
        tags: ['Long Distance', 'Tender']
      },
      {
        id: 'da-6',
        text: "Wishing the coolest dad a birthday as solid and golden as he is. Save me a slice of cake, you owe me for all those dad jokes!",
        tags: ['Cheerful', 'Banter']
      }
    ]
  },
  {
    slug: 'sister',
    title: 'Sweet & Sassy Birthday Wishes for Sister',
    navTitle: 'Sister',
    shortDescription: 'Loving, funny, and nostalgic birthday messages for your sister, kid sister or elder.',
    metaTitle: 'Birthday Wishes for Sister: Sweet, Funny & Emotional (2026)',
    metaDescription: 'The best birthday wishes for your sister, from childhood nostalgia to sassy one-liners. Add photos and send her an interactive surprise card!',
    intro: 'She stole your clothes, kept your secrets, and fought beside you like family and like a friend. These birthday wishes for sisters cover every dynamic, adoring younger siblings, grateful kid sisters, and partners-in-crime.',
    tips: [
      'Pick one shared childhood memory, the sillier, the more she will laugh-cry.',
      'Elder sisters love being thanked; younger sisters love being hyped up.',
      'Throwback photos of matching outfits or festival chaos are pure gold in the gallery.',
      'Mix one genuine line into the teasing, that is the message she screenshots.'
    ],
    faqs: [
      {
        question: 'What is a sweet birthday wish for a sister?',
        answer: '"Happy Birthday to my built-in best friend! Through every fight and every laugh, you have been my favourite constant. May your year be as lovely as your heart."'
      }
    ],
    wishes: [
      {
        id: 'si-1',
        text: "Happy Birthday, sis! Same parents, same drama, same unstoppable team. Thank you for being my childhood co-star and my adult emergency contact!",
        tags: ['Fun', 'Nostalgic']
      },
      {
        id: 'si-2',
        text: "To my gorgeous, brilliant sister, may your birthday be filled with everything you pretend you don't want but absolutely deserve. Love you endlessly!",
        tags: ['Sweet', 'Loving']
      },
      {
        id: 'si-3',
        text: "Happy Birthday to the only person who knows exactly how annoying I was as a kid and loves me anyway. Your patience deserves its own award, and cake!",
        tags: ['Funny', 'Sibling Banter']
      },
      {
        id: 'si-4',
        text: "Didi, you paved the way, lent the clothes, and took the blame more times than I can count. Today the spotlight is all yours. Happiest of birthdays!",
        tags: ['Elder Sister', 'Grateful']
      },
      {
        id: 'si-5',
        text: "Watching my little sister grow into this incredible woman is my favourite plot twist. Keep shining, keep dreaming, and keep stealing my hoodies. Happy Birthday!",
        tags: ['Younger Sister', 'Proud']
      },
      {
        id: 'si-6',
        text: "Sisters by birth, best friends by choice, partners in every crime worth committing. Here's to another year of us against the world. Happy Birthday!",
        tags: ['Best Friends', 'Bold']
      }
    ]
  },
  {
    slug: 'brother',
    title: 'Cool & Funny Birthday Wishes for Brother',
    navTitle: 'Brother',
    shortDescription: 'Brotherly birthday wishes, from heartfelt respect to legendary sibling roasts.',
    metaTitle: 'Birthday Wishes for Brother: Funny, Cool & Heartfelt (2026)',
    metaDescription: 'Epic birthday wishes for your brother, roasts, respect, and nostalgia. Turn one into an interactive card with photos and candles!',
    intro: 'He annoyed you, defended you, and taught you everything from cricket to comebacks. These birthday wishes for brothers range from brotherly pride to gloriously unfiltered roasts, pick your fighter.',
    tips: [
      'A good roast followed by one sincere line is the brother-message formula.',
      'Reference his obsessions, gaming, bikes, gym, films, for instant personal points.',
      'Childhood mischief photos in the card gallery guarantee a laugh.',
      'Elder brothers melt at respect; younger brothers melt at being called a legend.'
    ],
    faqs: [
      {
        question: 'What is a funny birthday wish for a brother?',
        answer: '"Happy Birthday, bro! Thanks for taking the blame all those years, consider this message my repayment, with interest paid entirely in cake."'
      }
    ],
    wishes: [
      {
        id: 'br-1',
        text: "Happy Birthday, bro! Partner in mischief, co-founder of chaos, and the only human I can fight and forgive within five minutes. Stay legendary!",
        tags: ['Fun', 'Brotherhood']
      },
      {
        id: 'br-2',
        text: "To my elder brother, my first rival and my forever role model. Everything cool I know, I learned trying to keep up with you. Have a massive birthday, bhai!",
        tags: ['Elder Brother', 'Respect']
      },
      {
        id: 'br-3',
        text: "Happy Birthday to my little brother, who finally grew taller but not wiser! Proud of the man you're becoming, now act your shoe size, not your age.",
        tags: ['Younger Brother', 'Roast']
      },
      {
        id: 'br-4',
        text: "Bro, thanks for the life lessons: how to negotiate with parents, how to finish the last slice first, and how to always have my back. Best birthday ever to you!",
        tags: ['Nostalgic', 'Grateful']
      },
      {
        id: 'br-5',
        text: "Wishing my brother a year with full battery, zero lag, maximum goals, on the field and off it. Game on, birthday boy! 🎮",
        tags: ['Cool', 'Modern']
      },
      {
        id: 'br-6',
        text: "Blood made us brothers, but surviving childhood together made us friends. Grateful for you today and every day. Happy Birthday, champ!",
        tags: ['Heartfelt', 'Loyal']
      }
    ]
  },
  {
    slug: 'husband',
    title: 'Loving Birthday Wishes for Husband',
    navTitle: 'Husband',
    shortDescription: 'Romantic and appreciative birthday messages celebrating the man you chose, every day.',
    metaTitle: 'Romantic Birthday Wishes for Husband (2026) | BirthdayGen',
    metaDescription: 'Melt his heart with loving birthday wishes for your husband. Add couple photos and send a romantic interactive card with candles!',
    intro: 'He is your teammate in bills and dreams alike. These birthday wishes for husbands blend romance with real-life appreciation, for the husband who fixes things, forgets dates, but never forgets you.',
    tips: [
      'Thank him for an unglamorous everyday thing, that lands deeper than grand poetry.',
      'Recall your wedding day or the day you knew, nostalgia is romance fuel.',
      'Couple photos from trips and tiny moments make the card unforgettable.',
      'A playful line about his habits keeps it real and makes him grin.'
    ],
    faqs: [
      {
        question: 'What is a romantic birthday message for my husband?',
        answer: '"Happy Birthday to the man I still choose every single day. Home was never a place, it was always you. Here is to growing old and still laughing together."'
      }
    ],
    wishes: [
      {
        id: 'hu-1',
        text: "Happy Birthday, my love! Years together and you still make ordinary Tuesdays feel like occasions. Thank you for being my calm, my chaos, and my home.",
        tags: ['Romantic', 'Deep']
      },
      {
        id: 'hu-2',
        text: "To my husband, the man who kills spiders, carries the heavy bags, and holds my hand through every storm. Today we celebrate YOU, hero!",
        tags: ['Appreciative', 'Sweet']
      },
      {
        id: 'hu-3',
        text: "Happy Birthday, handsome! You snore, you steal blankets, and you are still the best decision I ever made. Here's to many more adventures side by side.",
        tags: ['Playful', 'Loving']
      },
      {
        id: 'hu-4',
        text: "Every year with you writes my favourite chapter. May this birthday begin your happiest one yet. I will be right beside you, as always.",
        tags: ['Poetic', 'Devoted']
      },
      {
        id: 'hu-5',
        text: "Cheers to the man who works so hard for our dreams and still shows up for movie night. Rest today, my love, the crown is yours. Happy Birthday!",
        tags: ['Supportive', 'Warm']
      },
      {
        id: 'hu-6',
        text: "Growing older with you is my favourite plan. Happy Birthday to my partner, my best friend, and my forever Valentine!",
        tags: ['Timeless', 'Romantic']
      }
    ]
  },
  {
    slug: 'wife',
    title: 'Beautiful Birthday Wishes for Wife',
    navTitle: 'Wife',
    shortDescription: 'Tender birthday love notes that remind her she is cherished, admired, and adored.',
    metaTitle: 'Beautiful Birthday Wishes for Wife (2026) | BirthdayGen',
    metaDescription: 'Sweep her off her feet with birthday wishes for your wife. Add wedding photos and send a romantic interactive surprise card!',
    intro: 'She runs the house, the calendar, and your heart. These birthday wishes for wives say what busy days leave unsaid, admiration, desire, gratitude, and a promise to celebrate her like day one.',
    tips: [
      'Compliment who she IS, not just what she does, her laugh, her courage, her mind.',
      'Mention a moment you fell for her again recently, wives notice everything except being noticed.',
      'Wedding and honeymoon photos in the gallery = instant tears (good ones).',
      'Promise one concrete thing: a date, a break, a chore off her plate forever.'
    ],
    faqs: [
      {
        question: 'How do I wish my wife a happy birthday romantically?',
        answer: '"Happy Birthday, my beautiful wife. Loving you is the easiest thing I have ever done. Today the world celebrates the day my favourite person arrived, and so do I, with all my heart."'
      }
    ],
    wishes: [
      {
        id: 'wi-1',
        text: "Happy Birthday, my gorgeous wife! You turn our house into a home and my life into an adventure. Today, the queen gets whatever she wants, starting with breakfast in bed.",
        tags: ['Romantic', 'Adoring']
      },
      {
        id: 'wi-2',
        text: "To the strongest, kindest woman I know, thank you for loving me at my worst and cheering loudest at my best. Wishing you a birthday as extraordinary as you are!",
        tags: ['Admiring', 'Deep']
      },
      {
        id: 'wi-3',
        text: "Happy Birthday, beautiful! You still give me butterflies, along with reminders, lists, and the occasional well-deserved scolding. Wouldn't trade a single day.",
        tags: ['Playful', 'Sweet']
      },
      {
        id: 'wi-4',
        text: "Every wrinkle we earn together is my favourite souvenir. Here's to growing old, laughing hard, and loving harder. Happy Birthday, my forever girl!",
        tags: ['Poetic', 'Timeless']
      },
      {
        id: 'wi-5',
        text: "Wishing my wife a day with zero chores, full pampering, and cake for every meal. You spend all year caring for us, today we care for you!",
        tags: ['Pampering', 'Caring']
      },
      {
        id: 'wi-6',
        text: "I asked for happiness and got you. Happy Birthday to my dream come true, may this year love you the way you love everyone else.",
        tags: ['Devoted', 'Tender']
      }
    ]
  },
  {
    slug: 'boyfriend',
    title: 'Cute & Romantic Birthday Wishes for Boyfriend',
    navTitle: 'Boyfriend',
    shortDescription: 'Adorable birthday texts and love notes to make your boyfriend grin at his phone.',
    metaTitle: 'Cute Birthday Wishes for Boyfriend (2026) | BirthdayGen',
    metaDescription: 'The cutest birthday wishes for your boyfriend, sweet, flirty, and fun. Send one as an interactive card with photos and candles!',
    intro: 'Whether it is your first birthday together or your fifth, these birthday wishes for boyfriends hit the sweet spot between cute and meaningful, flirty enough to make him blush, real enough to keep.',
    tips: [
      'Reference YOUR thing, the late-night calls, the food orders, the inside jokes.',
      'Compliment him in a way his friends never do, sweetly specific.',
      'Screenshots of cute chats plus couple selfies make a killer gallery.',
      'End with excitement for the future, not just the day.'
    ],
    faqs: [
      {
        question: 'What is a cute birthday text for my boyfriend?',
        answer: '"Happy Birthday to my favourite notification! You make ordinary days feel like festivals. Can\'t wait to celebrate you, cake first, cuddles after."'
      }
    ],
    wishes: [
      {
        id: 'bo-1',
        text: "Happy Birthday, cutie! You are my favourite hello, my hardest goodbye, and every happy thought in between. Today is all about YOU!",
        tags: ['Cute', 'Sweet']
      },
      {
        id: 'bo-2',
        text: "To the boy with the best smile and the biggest heart, may your birthday be as amazing as the day you walked into my life. So glad you were born!",
        tags: ['Romantic', 'Flirty']
      },
      {
        id: 'bo-3',
        text: "Happy Birthday, jaan! Warning: today includes excessive pampering, terrible singing, and cake fights. No refunds. Love you!",
        tags: ['Playful', 'Fun']
      },
      {
        id: 'bo-4',
        text: "You make me laugh on my worst days and believe on my doubtful ones. Wishing the most wonderful birthday to the most wonderful boy!",
        tags: ['Meaningful', 'Supportive']
      },
      {
        id: 'bo-5',
        text: "Cheers to you, my gamer, my chef, my 2am philosopher! May this year unlock all your dream levels. Happy Birthday, hero!",
        tags: ['Modern', 'Cheerful']
      },
      {
        id: 'bo-6',
        text: "Every love story is beautiful, but ours is my favourite page-turner. Happy Birthday to my co-author, many more chapters to go!",
        tags: ['Poetic', 'Devoted']
      }
    ]
  },
  {
    slug: 'girlfriend',
    title: 'Sweet Birthday Wishes for Girlfriend That Melt Hearts',
    navTitle: 'Girlfriend',
    shortDescription: 'Charming birthday messages to show your girlfriend how special she truly is.',
    metaTitle: 'Sweet Birthday Wishes for Girlfriend (2026) | BirthdayGen',
    metaDescription: 'Win her heart again with sweet birthday wishes for your girlfriend. Pair with photos in an interactive card she will replay all year!',
    intro: 'Her birthday is your annual championship match, and these birthday wishes for girlfriends are your winning playbook. Sweet, a little flirty, genuinely observant: the combination that actually melts hearts.',
    tips: [
      'Notice details: her laugh, her ambition, the way she cares, generic compliments lose.',
      'A tiny apology for your one annoying habit + promise = charm overload.',
      'Her favourite photos of YOU TWO (not just her) show partnership.',
      'Handwritten-style sincerity beats copied poetry every time.'
    ],
    faqs: [
      {
        question: 'How do I make my girlfriend feel special on her birthday?',
        answer: 'Combine words with effort: a personal message naming what you adore about her, her favourite photos in a surprise page, and one planned moment, even a video call with candles counts.'
      }
    ],
    wishes: [
      {
        id: 'gi-1',
        text: "Happy Birthday, gorgeous! You walked into my life and redecorated everything, brighter, warmer, better. Best renovation ever. Love you!",
        tags: ['Charming', 'Sweet']
      },
      {
        id: 'gi-2',
        text: "To my princess, may your day overflow with flowers, surprises, and a boyfriend who finally remembers everything. (Starting today. Promise.)",
        tags: ['Playful', 'Adoring']
      },
      {
        id: 'gi-3',
        text: "Happy Birthday, jaan! Your smile is my favourite view, your laugh my favourite sound. Celebrating the day the world got its best upgrade!",
        tags: ['Romantic', 'Flirty']
      },
      {
        id: 'gi-4',
        text: "You believe in me more than I believe in myself, and that is my superpower. Wishing a magical birthday to my magician!",
        tags: ['Meaningful', 'Grateful']
      },
      {
        id: 'gi-5',
        text: "Cake? Check. Candles? Check. The most beautiful birthday girl in the world? Double check. Have the happiest birthday, sweetheart!",
        tags: ['Cute', 'Cheerful']
      },
      {
        id: 'gi-6',
        text: "If kisses were letters, I'd send you a novel today. Happy Birthday to my favourite chapter, my beautiful girlfriend!",
        tags: ['Poetic', 'Loving']
      }
    ]
  },
  {
    slug: 'son',
    title: 'Proud Birthday Wishes for Son',
    navTitle: 'Son',
    shortDescription: 'Proud, encouraging birthday messages celebrating your son at every age.',
    metaTitle: 'Proud Birthday Wishes for Son From Mom & Dad (2026)',
    metaDescription: 'Celebrate your boy with proud birthday wishes for sons, from little champs to grown men. Build him a photo-filled interactive card!',
    intro: 'From first steps to big moves, watching your son grow is life\'s greatest privilege. These birthday wishes for sons speak parent-to-heart at every stage, little explorer, moody teen, or grown man still calling for recipes.',
    tips: [
      'Tell him what you are proud of RIGHT NOW, specific praise sticks for years.',
      'Share belief in his future; sons carry parental confidence like armour.',
      'Baby photos + recent photos side by side = instant emotional knockout.',
      'Keep the door open: end with "we are always here" (he hears it even when he eye)-rolls.'
    ],
    faqs: [
      {
        question: 'What do parents write in a son\'s birthday card?',
        answer: '"Happy Birthday, beta! Watching you grow into a kind, brave young man is our greatest joy. Chase your dreams fearlessly, we will always be your loudest cheerleaders."'
      }
    ],
    wishes: [
      {
        id: 'so-1',
        text: "Happy Birthday, champ! From toy cars to big dreams, you have always raced ahead. Keep that spark, the world needs your kind of brave!",
        tags: ['Proud', 'Encouraging']
      },
      {
        id: 'so-2',
        text: "To our son, you make parenting look easy and pride feel endless. May this year bring you adventures worthy of your courage. We love you!",
        tags: ['Loving', 'Parental']
      },
      {
        id: 'so-3',
        text: "Happy Birthday, beta! Remember: grades fade, character stays. You already have the important part, a good heart. Now go eat cake!",
        tags: ['Wise', 'Warm']
      },
      {
        id: 'so-4',
        text: "Our little boy who became a fine young man, time flew, but our love only grew. Wishing you a birthday as awesome as your gaming skills!",
        tags: ['Nostalgic', 'Modern']
      },
      {
        id: 'so-5',
        text: "Son, may you always be brave enough to dream big and kind enough to lift others. Happy Birthday, mom and dad are your forever team!",
        tags: ['Inspirational', 'Blessing']
      },
      {
        id: 'so-6',
        text: "Another year taller, smarter, and (slightly) wiser! Happy Birthday to our superstar, the WiFi password is your birthday gift. Use it well!",
        tags: ['Funny', 'Playful']
      }
    ]
  },
  {
    slug: 'daughter',
    title: 'Adorable Birthday Wishes for Daughter',
    navTitle: 'Daughter',
    shortDescription: 'Loving birthday wishes for your little princess or grown-up girl, straight from proud parents.',
    metaTitle: 'Adorable Birthday Wishes for Daughter (2026) | BirthdayGen',
    metaDescription: 'Shower her with love: birthday wishes for daughters from mom and dad. Add her photos and send a magical interactive card!',
    intro: 'She wrapped you around her finger on day one and never let go. These birthday wishes for daughters capture that fierce parental love, for pigtails today, graduation caps tomorrow, and the incredible woman always.',
    tips: [
      'Tell her she is capable, not just pretty, that sentence shapes futures.',
      'Recall a moment she made YOU proud; daughters keep those forever.',
      'First-day-of-school vs today photo pairs never miss in the gallery.',
      'Promise your unwavering backup, the safest gift a parent gives.'
    ],
    faqs: [
      {
        question: 'What is a beautiful birthday wish for a daughter?',
        answer: '"Happy Birthday, princess! You are braver than you believe and more loved than you know. Dream without limits, shine without permission, we will always be behind you."'
      }
    ],
    wishes: [
      {
        id: 'dg-1',
        text: "Happy Birthday, princess! You sprinkled fairy dust on our ordinary lives. May your year be as magical, sparkly, and wonderful as you are!",
        tags: ['Adorable', 'Magical']
      },
      {
        id: 'dg-2',
        text: "To our daughter, smart, strong, and stunning inside-out. The world is better with you in it. Keep conquering, birthday girl!",
        tags: ['Empowering', 'Proud']
      },
      {
        id: 'dg-3',
        text: "Happy Birthday, gudiya! From pigtails to power moves, watching you grow is our life's highlight reel. Cake today, world domination tomorrow!",
        tags: ['Nostalgic', 'Fun']
      },
      {
        id: 'dg-4',
        text: "Beta, never shrink yourself to fit small rooms, you were born for big stages. Wishing you a fearless, fabulous birthday!",
        tags: ['Inspirational', 'Bold']
      },
      {
        id: 'dg-5',
        text: "You are our sunshine on cloudy days and our pride every day. Happy Birthday, sweetheart, mom and dad love you to the moon and back!",
        tags: ['Tender', 'Parental']
      },
      {
        id: 'dg-6',
        text: "Growing up so fast yet forever our baby girl! May your birthday be filled with giggles, glitter, and everything pink and perfect!",
        tags: ['Sweet', 'Playful']
      }
    ]
  },
  {
    slug: 'grandma',
    title: 'Warm Birthday Wishes for Grandma',
    navTitle: 'Grandma',
    shortDescription: 'Tender birthday greetings honouring grandma\'s love, stories, and legendary cooking.',
    metaTitle: 'Warm Birthday Wishes for Grandma (2026) | BirthdayGen',
    metaDescription: 'Honour dadi/nani with warm birthday wishes for grandma. Add family photos and send her a surprise card the whole family signs!',
    intro: 'Her hands tell stories, her kitchen heals everything, and her blessings power the whole family. These birthday wishes for grandmothers honour the matriarch, best read aloud on a video call with the whole parivaar.',
    tips: [
      'Mention her food, her stories, or her blessings, the holy trinity of grandma love.',
      'Get every grandchild to add one line; a group-signed card overwhelms her happily.',
      'Old black-and-white family photos in the gallery are pure treasure.',
      'Wish her health and comfort specifically, at her age, that is love language.'
    ],
    faqs: [
      {
        question: 'What is a touching birthday message for grandmother?',
        answer: '"Happy Birthday, Dadi! Your stories raised us, your food spoiled us, and your blessings protect us still. May you be blessed with health and a hundred more birthdays with us."'
      }
    ],
    wishes: [
      {
        id: 'gm-1',
        text: "Happy Birthday, Dadi! Your love is the family recipe nothing can replace. Wishing you health, comfort, and many more years of spoiling us rotten!",
        tags: ['Traditional', 'Blessing']
      },
      {
        id: 'gm-2',
        text: "To our dearest Nani, storyteller, chef, blessing-machine! May your birthday be as sweet as your kheer and as warm as your hugs.",
        tags: ['Sweet', 'Cultural']
      },
      {
        id: 'gm-3',
        text: "Grandma, your wrinkles are chapters of wisdom and your smile is our safest place. Happy Birthday to the queen of our family!",
        tags: ['Respectful', 'Loving']
      },
      {
        id: 'gm-4',
        text: "Wishing my wonderful grandma a birthday wrapped in love, prayers, and extra ghee on everything! You deserve the world, today and always.",
        tags: ['Playful', 'Warm']
      },
      {
        id: 'gm-5',
        text: "Four generations blessed because of you, what a legacy! Happy Birthday, Grandma. Thank you for being our roots and our wings.",
        tags: ['Legacy', 'Grateful']
      },
      {
        id: 'gm-6',
        text: "May God grant you a long, healthy, joyful life, Dadi. Your blessings are our biggest wealth. Happiest birthday with folded hands and full heart!",
        tags: ['Prayerful', 'Tender']
      }
    ]
  },
  {
    slug: 'grandpa',
    title: 'Respectful Birthday Wishes for Grandpa',
    navTitle: 'Grandpa',
    shortDescription: 'Honouring birthday messages for grandpa, his wisdom, wit, and wonderful stories.',
    metaTitle: 'Respectful Birthday Wishes for Grandpa (2026) | BirthdayGen',
    metaDescription: 'Salute him with birthday wishes for grandpa, wise, warm, and witty. Add throwback photos in a family-signed interactive card!',
    intro: 'He has seen eras change and still beats everyone at cards. These birthday wishes for grandfathers salute the patriarch, his discipline that built the family and his mischief that keeps it laughing.',
    tips: [
      'Ask him for one story and quote it back, being heard is his favourite gift.',
      'Honour his struggles and achievements; grandpas light up at earned respect.',
      'Vintage photos of young grandpa stun the whole family in the gallery.',
      'Wish him strength and health, and mean it with a call, not just a card.'
    ],
    faqs: [
      {
        question: 'What do you write in a grandpa\'s birthday card?',
        answer: '"Happy Birthday, Dadaji! Your hard work built this family and your stories built our childhood. Wishing you robust health and endless happy years among us."'
      }
    ],
    wishes: [
      {
        id: 'gp-1',
        text: "Happy Birthday, Dadaji! Strong as a banyan, cool as ever, thank you for roots to ground us and stories to grow on. Stay healthy and legendary!",
        tags: ['Respectful', 'Strong']
      },
      {
        id: 'gp-2',
        text: "To our Nanaji, scholar, storyteller, champion of evening walks! May this year gift you morning sunshine, good health, and obedient grandchildren (we'll try).",
        tags: ['Warm', 'Witty']
      },
      {
        id: 'gp-3',
        text: "Grandpa, your life is our family's greatest novel. Wishing you a birthday chapter full of love, laughter, and your favourite sweets, doctor permitting!",
        tags: ['Playful', 'Honouring']
      },
      {
        id: 'gp-4',
        text: "Happy Birthday to the man who taught us honesty, hard work, and the perfect chai ratio. Your values are your true inheritance to us.",
        tags: ['Values', 'Grateful']
      },
      {
        id: 'gp-5',
        text: "Decades of wisdom, zero dull moments! Happy Birthday, Grandpa, may your health match your spirit, which is 25 forever.",
        tags: ['Cheerful', 'Timeless']
      },
      {
        id: 'gp-6',
        text: "Folded hands and full hearts: thank you for every blessing, every lesson, every laugh. Happy Birthday, beloved Grandpa!",
        tags: ['Prayerful', 'Tender']
      }
    ]
  },
  {
    slug: 'coworker',
    title: 'Professional Birthday Wishes for Colleagues & Coworkers',
    navTitle: 'Coworker',
    shortDescription: 'Polished, friendly birthday messages for colleagues, warm without crossing lines.',
    metaTitle: 'Birthday Wishes for Colleague & Coworker (2026) | BirthdayGen',
    metaDescription: 'Perfect birthday wishes for colleagues, professional yet warm. Surprise your coworker with a fun team-signed interactive card!',
    intro: 'You spend more waking hours with colleagues than family, their birthday deserves better than a break-room mumur. These coworker birthday wishes are perfectly calibrated: friendly, inclusive, promotion-safe.',
    tips: [
      'Keep it team-flavoured: mention their help, humour, or coffee runs.',
      'Avoid age jokes upward and romance jokes entirely, safe laughs only.',
      'A team-signed BirthdayGen card with office party photos beats any group e-card.',
      'For bosses, stay respectful; for peers, feel free to be funnier.'
    ],
    faqs: [
      {
        question: 'What is a good birthday wish for a colleague?',
        answer: '"Happy Birthday! The office runs smoother and laughs louder because of you. Wishing you success, good health, and a year as great as your spreadsheet skills."'
      }
    ],
    wishes: [
      {
        id: 'co-1',
        text: "Happy Birthday! Thanks for making deadlines bearable and Mondays survivable. Hope your day has zero meetings and maximum cake!",
        tags: ['Office Humour', 'Friendly']
      },
      {
        id: 'co-2',
        text: "Wishing a fantastic birthday to the colleague everyone actually likes! May your inbox be light and your celebrations heavy today.",
        tags: ['Warm', 'Popular']
      },
      {
        id: 'co-3',
        text: "Happy Birthday to our team's secret weapon! Your hard work inspires us all, today, let the team spoil YOU for a change.",
        tags: ['Appreciative', 'Team']
      },
      {
        id: 'co-4',
        text: "Another year of crushing targets and stealing snacks from the pantry! Happy Birthday, the promotion conversation can wait till tomorrow.",
        tags: ['Playful', 'Peer']
      },
      {
        id: 'co-5',
        text: "To a wonderful coworker and an even better human, wishing you health, happiness, and a well-deserved break. Enjoy your special day!",
        tags: ['Respectful', 'Sincere']
      },
      {
        id: 'co-6',
        text: "Happy Birthday! May your coffee be strong, your WiFi fast, and your birthday week gloriously meeting-free!",
        tags: ['Funny', 'Relatable']
      }
    ]
  },
  {
    slug: 'teacher',
    title: 'Grateful Birthday Wishes for Teachers & Mentors',
    navTitle: 'Teacher',
    shortDescription: 'Respectful birthday messages thanking the teachers and mentors who shaped you.',
    metaTitle: 'Birthday Wishes for Teacher & Mentor (2026) | BirthdayGen',
    metaDescription: 'Thank them beautifully: birthday wishes for teachers and mentors. Get the whole class to sign an interactive surprise card!',
    intro: 'Great teachers echo through entire lives. These birthday wishes for teachers and mentors express the gratitude students feel but rarely send, perfect for a class-signed surprise that will genuinely move them.',
    tips: [
      'Name the specific lesson or belief they gave you, teachers live for that.',
      'Keep the tone respectful; save the memes for friends.',
      'Class photos and reunion pictures make the gallery deeply meaningful.',
      'A group-signed card from the whole batch multiplies the emotion.'
    ],
    faqs: [
      {
        question: 'How do you wish a teacher happy birthday respectfully?',
        answer: '"Happy Birthday, Sir/Ma\'am! Your guidance shaped not just my grades but my character. Thank you for believing in me, wishing you health and happiness always."'
      }
    ],
    wishes: [
      {
        id: 'te-1',
        text: "Happy Birthday, Sir/Ma'am! You didn't just teach subjects, you taught us how to think and dream. Forever grateful to be your student!",
        tags: ['Respectful', 'Grateful']
      },
      {
        id: 'te-2',
        text: "To the mentor who saw potential in me before I did, thank you for every push, every patience, every second chance. Have a wonderful birthday!",
        tags: ['Mentor', 'Thankful']
      },
      {
        id: 'te-3',
        text: "Happy Birthday to my favourite teacher! Your classes were the reason school felt like an adventure. Wishing you joy as lasting as your lessons!",
        tags: ['Warm', 'Nostalgic']
      },
      {
        id: 'te-4',
        text: "Great teachers plant trees they'll never sit under, yet here we are, shading you with love on your birthday! Enjoy your special day, Guru ji!",
        tags: ['Poetic', 'Cultural']
      },
      {
        id: 'te-5',
        text: "Wishing a very happy birthday to the strictest-checker, kindest-heart combo in education! Your students are your legacy, and it's a brilliant one.",
        tags: ['Playful', 'Admiring']
      },
      {
        id: 'te-6',
        text: "Thank you for turning 'I can't' into 'I can' for so many of us. Happy Birthday to an extraordinary teacher and an even more extraordinary human!",
        tags: ['Inspirational', 'Sincere']
      }
    ]
  },
  {
    slug: 'belated',
    title: 'Belated Birthday Wishes That Actually Apologise Well',
    navTitle: 'Belated',
    shortDescription: 'Charming late birthday messages that turn your oops into an even bigger surprise.',
    metaTitle: 'Belated Happy Birthday Wishes & Messages (2026) | BirthdayGen',
    metaDescription: 'Missed the day? These belated birthday wishes save the day with humour and heart. Send a surprise interactive card, fashionably late!',
    intro: 'Missed the birthday? Relax, a late wish with extra effort beats an on-time "HBD" text every time. These belated birthday messages blend honest apology with humour, and a surprise BirthdayGen card proves you cared enough to overcompensate.',
    tips: [
      'Own it briefly, then pivot to celebration, grovelling paragraphs help nobody.',
      'Humour is your rescue rope: blame the calendar, the traffic, the naps.',
      'Make the surprise BIGGER than usual, photos, candles, the works.',
      'Send it now, not "soon". Late + prompt beats late + later.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday late without sounding careless?',
        answer: '"Belated Happy Birthday! Good things come to those who wait, and great friends deserve extended celebrations. Consider this the deluxe edition of your birthday wish!"'
      },
      {
        question: 'Is it okay to send a birthday wish a week late?',
        answer: 'Absolutely, especially with effort attached. A personalised interactive card a week late delights far more than a timely one-word text.'
      }
    ],
    wishes: [
      {
        id: 'be-1',
        text: "Belated Happy Birthday! I missed the date but never the feeling, you deserve celebrating all week anyway. Consider this the grand finale!",
        tags: ['Apologetic', 'Sweet']
      },
      {
        id: 'be-2',
        text: "Happy Belated Birthday! My calendar betrayed me, but my love for you is right on schedule. Hope your day was as amazing as you are!",
        tags: ['Funny', 'Excuse']
      },
      {
        id: 'be-3',
        text: "They say the best gifts arrive late, exhibiting patience AND fashion. Belated birthday cheers to my favourite procrastination-compatible friend!",
        tags: ['Witty', 'Playful']
      },
      {
        id: 'be-4',
        text: "A little late, a lot sincere: wishing you a year of health, laughter, and dreams coming true. Sorry I missed the candles. I brought extra cake (virtually)!",
        tags: ['Sincere', 'Warm']
      },
      {
        id: 'be-5',
        text: "Breaking news: birthday extended due to popular demand (mine). Happy Belated Birthday, the celebration continues with this surprise!",
        tags: ['Creative', 'Dramatic']
      },
      {
        id: 'be-6',
        text: "Forgive the delay, great wishes take time to age, like fine wine and like you! Happiest belated birthday, superstar!",
        tags: ['Charming', 'Roast-lite']
      }
    ]
  },

  // ─── Regional Language Wish Pages (Programmatic SEO) ───────────────────

  {
    slug: 'hindi',
    title: 'Birthday Wishes in Hindi: जन्मदिन की शुभकामनाएं',
    navTitle: 'Hindi',
    shortDescription: 'Beautiful birthday wishes in Hindi with English transliteration, copy, share, or turn into an interactive card.',
    metaTitle: 'Birthday Wishes in Hindi (2026). जन्मदिन की शुभकामनाएं | BirthdayGen',
    metaDescription: 'Find heartfelt birthday wishes in Hindi. Copy the perfect janamdin ki shubhkamnaye message or create an interactive card with candles and music, free!',
    intro: 'Hindi birthday wishes carry warmth that English often cannot match. Whether you are wishing your mummy, papa, best friend, bhai or bhabhi, these birthday wishes in Hindi strike the perfect balance between tradition and emotion. Each wish comes with English transliteration so you can read, copy, and share with ease.',
    tips: [
      'Use Devanagari script for formal wishes and romanized Hindi for casual WhatsApp messages.',
      'Add a personal touch by mentioning their name in the wish.',
      'Pair the wish with a BirthdayGen card. Hindi text looks beautiful on the Royal Gold and Elegant themes.',
      'For elders, keep the tone respectful. For friends, mix in some Hinglish fun.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday in Hindi?',
        answer: '"जन्मदिन मुबारक हो!" (Janamdin Mubarak Ho!) or "जन्मदिन की बहुत बहुत शुभकामनाएं!" (Janamdin ki bahut bahut shubhkamnaye!), both are warm, widely used ways to wish someone happy birthday in Hindi.'
      },
      {
        question: 'Can I create a birthday card with Hindi text?',
        answer: 'Yes! BirthdayGen supports Hindi text in your message. Simply paste your Hindi wish into the message field when creating a card and share the interactive link via WhatsApp.'
      }
    ],
    wishes: [
      {
        id: 'hi-1',
        text: "जन्मदिन की बहुत बहुत शुभकामनाएं! भगवान आपको लंबी उम्र, अच्छी सेहत और ढेर सारी खुशियां दें। आप हमेशा मुस्कुराते रहें!\n(Janamdin ki bahut bahut shubhkamnaye! Bhagwan aapko lambi umr, achhi sehat aur dher saari khushiyan dein. Aap hamesha muskurate rahein!)",
        tags: ['Heartfelt', 'Hindi']
      },
      {
        id: 'hi-2',
        text: "आपके जन्मदिन पर ढेर सारी बधाई! ज़िंदगी में हर वो खुशी मिले जो आप चाहते हैं। Happy Birthday!\n(Aapke janamdin par dher saari badhai! Zindagi mein har wo khushi mile jo aap chahte hain.)",
        tags: ['Warm', 'Classic']
      },
      {
        id: 'hi-3',
        text: "जन्मदिन मुबारक हो! तुम्हारे बिना ज़िंदगी अधूरी है। आज का दिन खास है क्योंकि तुम खास हो। खूब मज़े करो!\n(Janamdin mubarak ho! Tumhare bina zindagi adhoori hai. Aaj ka din khaas hai kyunki tum khaas ho. Khoob maze karo!)",
        tags: ['Emotional', 'Friend']
      },
      {
        id: 'hi-4',
        text: "हैप्पी बर्थडे यार! उम्र तो बस एक नंबर है, असली बात तो ये है कि तू कितना मस्त इंसान है। Party hard!\n(Happy Birthday yaar! Umr toh bas ek number hai, asli baat toh ye hai ki tu kitna mast insaan hai. Party hard!)",
        tags: ['Fun', 'Hinglish']
      },
      {
        id: 'hi-5',
        text: "मम्मी/पापा, आपके जन्मदिन पर आपके चरणों में प्रणाम। आप जो प्यार और बलिदान हमें देते हैं, वो अनमोल है। ईश्वर आपको सदा स्वस्थ रखें।\n(Mummy/Papa, aapke janamdin par aapke charno mein pranaam. Aap jo pyaar aur balidaan humein dete hain, wo anmol hai. Ishwar aapko sada swasth rakhein.)",
        tags: ['Respectful', 'Parents']
      },
      {
        id: 'hi-6',
        text: "जन्मदिन की हार्दिक शुभकामनाएं! तुम्हारी हर ख्वाहिश पूरी हो, हर सपना साकार हो, और ज़िंदगी में सिर्फ प्यार और कामयाबी हो।\n(Janamdin ki hardik shubhkamnaye! Tumhari har khwahish poori ho, har sapna saakaar ho, aur zindagi mein sirf pyaar aur kaamyabi ho.)",
        tags: ['Inspirational', 'Beautiful']
      }
    ]
  },
  {
    slug: 'marathi',
    title: 'Birthday Wishes in Marathi: वाढदिवसाच्या शुभेच्छा',
    navTitle: 'Marathi',
    shortDescription: 'Authentic Marathi birthday wishes with transliteration, perfect for family and friends from Maharashtra.',
    metaTitle: 'Birthday Wishes in Marathi (2026). वाढदिवसाच्या शुभेच्छा | BirthdayGen',
    metaDescription: 'Beautiful birthday wishes in Marathi with English transliteration. Copy, share on WhatsApp, or create an interactive birthday card, free on BirthdayGen!',
    intro: 'Marathi birthday wishes carry a unique warmth rooted in tradition. Whether for your aai, baba, mitra, or any loved one from Maharashtra, these vaadhdiwasachya shubhechha messages blend sincerity with Marathi culture. Each wish includes transliteration for easy sharing.',
    tips: [
      'Use formal Marathi for elders and casual tone for friends.',
      'Pair with the Elegant or Royal Gold theme on BirthdayGen for a premium feel.',
      'Add family photos alongside the Marathi message for extra emotional impact.',
      'For younger recipients, a Hinglish-Marathi mix feels natural and fun.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday in Marathi?',
        answer: '"वाढदिवसाच्या हार्दिक शुभेच्छा!" (Vaadhdiwasachya hardik shubhechha!) is the most common and heartfelt way to say happy birthday in Marathi.'
      },
      {
        question: 'Can I write Marathi text in a BirthdayGen card?',
        answer: 'Yes! Simply paste your Marathi wish into the message field when creating your card. BirthdayGen supports Devanagari script natively.'
      }
    ],
    wishes: [
      {
        id: 'mr-1',
        text: "वाढदिवसाच्या हार्दिक शुभेच्छा! तुझ्या आयुष्यात सुख, समाधान आणि भरभराट नेहमी राहो. तू खूप खूप आनंदी रहा!\n(Vaadhdiwasachya hardik shubhechha! Tujhya aayushyat sukh, samaadhaan aani bharbharaat nehmi raho. Tu khup khup anandi raha!)",
        tags: ['Heartfelt', 'Marathi']
      },
      {
        id: 'mr-2',
        text: "Happy Birthday! तुझ्यासारखा मित्र/मैत्रीण मिळणं हे माझं भाग्य आहे. आज तुझा दिवस आहे. मनसोक्त एन्जॉय कर!\n(Happy Birthday! Tujhyasarkha mitra/maitrin milnein he mazhein bhagya aahe. Aaj tuzha divas aahe, mansokt enjoy kar!)",
        tags: ['Friend', 'Fun']
      },
      {
        id: 'mr-3',
        text: "वाढदिवसाच्या शुभेच्छा! देव तुला उत्तम आरोग्य, यश आणि प्रेमाने भरलेलं आयुष्य देवो. तुझ्या सर्व स्वप्नांची पूर्तता होवो!\n(Vaadhdiwasachya shubhechha! Dev tula uttam aarogya, yash aani premane bharlelein aayushya devo. Tujhya sarv swapnanchhi poorttata hovo!)",
        tags: ['Blessings', 'Elder']
      },
      {
        id: 'mr-4',
        text: "Birthday boy/girl, आज तुझा दिवस आहे! पार्टी कधी देतोयस? मस्त एन्जॉय कर आणि केक वर फुंकर मार. BirthdayGen वर!\n(Birthday boy/girl, aaj tuzha divas aahe! Party kadhi detoys? Mast enjoy kar aani cake var funkar maar. BirthdayGen var!)",
        tags: ['Casual', 'Playful']
      },
      {
        id: 'mr-5',
        text: "आई/बाबा, तुमच्या वाढदिवसानिमित्त तुमच्या पायी प्रणाम. तुम्ही दिलेलं प्रेम आणि संस्कार अमूल्य आहेत. तुम्हाला दीर्घायुष्य लाभो.\n(Aai/Baba, tumchya vaadhdiwasanimitt tumchya payi pranaam. Tumhi dilelein prem aani sanskaar amulya aahet. Tumhala dirghaayushya labho.)",
        tags: ['Respectful', 'Parents']
      },
      {
        id: 'mr-6',
        text: "वाढदिवसाच्या खूप खूप शुभेच्छा! तू जसा/जशी आहेस तसाच/तशीच राहा. सगळ्यांना आवडणारा/आवडणारी. तुझं हसू कधीच कमी होऊ नये!\n(Vaadhdiwasachya khup khup shubhechha! Tu jasa/jashi aahes tasach/tashich raha, sagalyanla aavadnara/aavadnari. Tuzhein hasu kadhich kami hou naye!)",
        tags: ['Sweet', 'Genuine']
      }
    ]
  },
  {
    slug: 'tamil',
    title: 'Birthday Wishes in Tamil: பிறந்தநாள் வாழ்த்துக்கள்',
    navTitle: 'Tamil',
    shortDescription: 'Warm and meaningful birthday wishes in Tamil with transliteration, for family, friends and loved ones.',
    metaTitle: 'Birthday Wishes in Tamil (2026). பிறந்தநாள் வாழ்த்துக்கள் | BirthdayGen',
    metaDescription: 'Beautiful birthday wishes in Tamil with English transliteration. Share on WhatsApp or create a free interactive birthday card on BirthdayGen!',
    intro: 'Tamil birthday wishes blend poetic beauty with heartfelt emotion. Whether for your amma, appa, nanban, or any dear one, these piranthanaal vaalthukkal messages express love in the rich tradition of Tamil culture. Every wish includes transliteration for easy reading and sharing.',
    tips: [
      'Tamil script looks gorgeous on the Royal Gold and Midnight Stars themes.',
      'For close friends, a casual Tanglish (Tamil + English) mix works best.',
      'For parents and elders, keep it respectful with blessings-style wishes.',
      'Include childhood photos alongside the Tamil wish for maximum emotional impact.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday in Tamil?',
        answer: '"பிறந்தநாள் வாழ்த்துக்கள்!" (Piranthanaal Vaalthukkal!) is the standard and beautiful way to wish someone happy birthday in Tamil.'
      },
      {
        question: 'Does BirthdayGen support Tamil script?',
        answer: 'Yes! BirthdayGen supports Tamil text in your birthday message. Paste your Tamil wish and it will render beautifully on any theme.'
      }
    ],
    wishes: [
      {
        id: 'ta-1',
        text: "பிறந்தநாள் வாழ்த்துக்கள்! உங்கள் வாழ்க்கையில் மகிழ்ச்சியும், நல்ல ஆரோக்கியமும், வெற்றியும் நிறைந்திருக்க வாழ்த்துகிறேன்!\n(Piranthanaal Vaalthukkal! Ungal vaazhkkaiyil magizhchiyum, nalla aarokkiyamum, vetriyum nirainthirukka vaazhthugiren!)",
        tags: ['Classic', 'Tamil']
      },
      {
        id: 'ta-2',
        text: "Happy Birthday da/di! Nee enga life la irukkura best person. Innaiku un day, full enjoy pannu, cake cut pannu, candles oothivu!\n(Happy Birthday da/di! You're the best person in our life. Today is your day, enjoy fully!)",
        tags: ['Tanglish', 'Friend']
      },
      {
        id: 'ta-3',
        text: "அம்மா/அப்பா, உங்கள் பிறந்தநாளில் உங்களுக்கு எனது வணக்கங்கள். நீங்கள் கொடுத்த அன்பும் தியாகமும் விலைமதிப்பற்றவை. இறைவன் உங்களை நீண்ட ஆயுளுடன் ஆசீர்வதிக்கட்டும்.\n(Amma/Appa, ungal piranthanaalil ungalukku enathu vanakkangal. Neengal koduththa anbum thiyaakamum vilaimathippatrravai. Iraivan ungalai neenda aayuludan aaseervathhikkattum.)",
        tags: ['Respectful', 'Parents']
      },
      {
        id: 'ta-4',
        text: "பிறந்தநாள் வாழ்த்துக்கள்! நீ இந்த உலகத்துக்கே ஒரு அழகான பரிசு. உன் ஒவ்வொரு கனவும் நிஜமாகட்டும்!\n(Piranthanaal Vaalthukkal! Nee intha ulagathhukkae oru azhagaana parisu. Un ovvoru kanavum nijamaagatttum!)",
        tags: ['Beautiful', 'Emotional']
      },
      {
        id: 'ta-5',
        text: "Birthday-kku innum oru vayasu aagudhu, aana nee matum ever young! Wish you all happiness machan/machi!\n(One more year older, but you stay ever young! Wish you all happiness friend!)",
        tags: ['Fun', 'Tanglish']
      },
      {
        id: 'ta-6',
        text: "பிறந்தநாள் வாழ்த்துக்கள்! கடவுள் உனக்கு நல்ல ஆரோக்கியமும், அமைதியும், வெற்றியும் தருவார். இனிய நாள் வாழ்க!\n(Piranthanaal Vaalthukkal! Kadavul unakku nalla aarokkiyamum, amaithiyum, vetriyum tharuvaar. Iniya naal vaazhga!)",
        tags: ['Blessings', 'Traditional']
      }
    ]
  },
  {
    slug: 'telugu',
    title: 'Birthday Wishes in Telugu: పుట్టినరోజు శుభాకాంక్షలు',
    navTitle: 'Telugu',
    shortDescription: 'Heartfelt Telugu birthday wishes with transliteration, for family, friends and loved ones.',
    metaTitle: 'Birthday Wishes in Telugu (2026). పుట్టినరోజు శుభాకాంక్షలు | BirthdayGen',
    metaDescription: 'Beautiful birthday wishes in Telugu with English transliteration. Copy and share or create a free interactive birthday card with candles on BirthdayGen!',
    intro: 'Telugu birthday wishes radiate warmth and affection. Whether for your amma, nanna, snehithudu, or any beloved person, these puttinaroju shubhakankshalu messages express your feelings in authentic Telugu. Each wish includes transliteration for easy sharing on WhatsApp.',
    tips: [
      'Telugu script looks stunning on the Royal Gold theme.',
      'Mix formal Telugu for elders and casual Tenglish for friends.',
      'Add personal photos and Telugu music from the BirthdayGen collection.',
      'A morning delivery makes Telugu birthday wishes feel extra special.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday in Telugu?',
        answer: '"పుట్టినరోజు శుభాకాంక్షలు!" (Puttinaroju Shubhakankshalu!) is the heartfelt way to wish happy birthday in Telugu. A simpler version is "హ్యాపీ బర్త్‌డే!" (Happy Birthday!).'
      },
      {
        question: 'Can I use Telugu text in a BirthdayGen card?',
        answer: 'Yes! BirthdayGen fully supports Telugu script. Paste your Telugu wish into the message field and it will display beautifully on any theme.'
      }
    ],
    wishes: [
      {
        id: 'te-1',
        text: "పుట్టినరోజు శుభాకాంక్షలు! మీ జీవితంలో ఆనందం, ఆరోగ్యం మరియు విజయం నిండి ఉండాలని కోరుకుంటున్నాను!\n(Puttinaroju Shubhakankshalu! Mee jeevithamlo aanandam, aarogyam mariyu vijayam nindi undaalani korukuntunnanu!)",
        tags: ['Classic', 'Telugu']
      },
      {
        id: 'te-2',
        text: "Happy Birthday ra/ri! Nuvvu na life lo best. Ee roju nee day, full ga enjoy cheyyi, cake cut cheyyi!\n(Happy Birthday! You're the best in my life. Today is your day, enjoy fully!)",
        tags: ['Tenglish', 'Friend']
      },
      {
        id: 'te-3',
        text: "అమ్మా/నాన్నా, మీ పుట్టినరోజున మీ పాదాలకు నమస్కారాలు. మీరు ఇచ్చిన ప్రేమ మరియు త్యాగాలు అమూల్యమైనవి. భగవంతుడు మిమ్మల్ని దీర్ఘాయుష్షుతో ఆశీర్వదించాలి.\n(Amma/Nanna, mee puttinarojuna mee paadaalaku namaskaralu. Meeru ichchina prema mariyu tyaagalu amulyamainavi. Bhagavanthudu mimmalni dirghaayushsutho aashirvadinchaali.)",
        tags: ['Respectful', 'Parents']
      },
      {
        id: 'te-4',
        text: "పుట్టినరోజు శుభాకాంక్షలు! నీలాంటి మంచి మనిషి ఈ ప్రపంచానికి ఒక వరం. నీ ప్రతి కల నిజం అవాలని కోరుకుంటున్నాను!\n(Puttinaroju Shubhakankshalu! Neelanti manchi manishi ee prapanchaniki oka varam. Nee prati kala nijam avaalani korukuntunnanu!)",
        tags: ['Beautiful', 'Emotional']
      },
      {
        id: 'te-5',
        text: "Inko year peddavadav/peddadanaivav, kani nuvvu eppudu young ae! Full enjoy cheyyi birthday boy/girl!\n(One more year older, but you're always young! Full enjoy birthday boy/girl!)",
        tags: ['Fun', 'Tenglish']
      },
      {
        id: 'te-6',
        text: "పుట్టినరోజు శుభాకాంక్షలు! దేవుడు నీకు మంచి ఆరోగ్యం, శాంతి మరియు విజయాలు ప్రసాదించాలి. ఈ రోజు నీకు చాలా ప్రత్యేకం!\n(Puttinaroju Shubhakankshalu! Devudu neeku manchi aarogyam, shaanthi mariyu vijayaalu prasaadinchali. Ee roju neeku chaala pratyekam!)",
        tags: ['Blessings', 'Traditional']
      }
    ]
  },
  {
    slug: 'bengali',
    title: 'Birthday Wishes in Bengali: শুভ জন্মদিন',
    navTitle: 'Bengali',
    shortDescription: 'Beautiful Bengali birthday wishes with transliteration, for family, friends and loved ones from Bengal.',
    metaTitle: 'Birthday Wishes in Bengali (2026). শুভ জন্মদিন | BirthdayGen',
    metaDescription: 'Heartfelt birthday wishes in Bengali with transliteration. Copy and share on WhatsApp or create a free interactive card with candles on BirthdayGen!',
    intro: 'Bengali birthday wishes are known for their lyrical beauty and emotional depth. Whether for your maa, baba, bondhu, or any cherished person, these shubho jonmodin messages capture the soul of Bengali culture. Each wish includes transliteration for effortless sharing.',
    tips: [
      'Bengali script looks poetic on the Midnight Stars and Elegant themes.',
      'For Kolkata friends, a Banglish mix feels natural and warm.',
      'Pair with traditional Bengali music for a nostalgic birthday card.',
      'Morning wishes with "shubho jonmodin" hit different when sent with a card.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday in Bengali?',
        answer: '"শুভ জন্মদিন!" (Shubho Jonmodin!) is the most common and beautiful way to say happy birthday in Bengali. "জন্মদিনের শুভেচ্ছা!" (Jonmodineer Shubhechha!) is also widely used.'
      },
      {
        question: 'Can I create a birthday card with Bengali text?',
        answer: 'Yes! BirthdayGen fully supports Bengali script. Type or paste your Bengali wish into the message field to create a beautiful interactive card.'
      }
    ],
    wishes: [
      {
        id: 'bn-1',
        text: "শুভ জন্মদিন! তোমার জীবনে অনেক সুখ, সমৃদ্ধি আর ভালোবাসা আসুক। তুমি সবসময় হাসিখুশি থাকো!\n(Shubho Jonmodin! Tomar jeeboné onek sukh, smriddhi ar bhalobaasha ashuk. Tumi shobshomoy hashikhushi thako!)",
        tags: ['Heartfelt', 'Bengali']
      },
      {
        id: 'bn-2',
        text: "Happy Birthday re! Tor moto bondhu paowa ta amar shobcheye boro bhagyo. Aj tor din, full enjoy kor, cake kaat!\n(Happy Birthday! Having a friend like you is my greatest fortune. Today is your day, enjoy!)",
        tags: ['Banglish', 'Friend']
      },
      {
        id: 'bn-3',
        text: "মা/বাবা, আপনার জন্মদিনে আপনাকে প্রণাম। আপনি যে ভালোবাসা ও ত্যাগ আমাদের দিয়েছেন তা অমূল্য। ঈশ্বর আপনাকে দীর্ঘায়ু দিন।\n(Maa/Baba, apnar jonmodiney apnake pronam. Apni je bhalobaasha o tyaag aamader diyechhen ta omulyo. Ishwor apnake dirghaayu din.)",
        tags: ['Respectful', 'Parents']
      },
      {
        id: 'bn-4',
        text: "শুভ জন্মদিন! তুমি এই পৃথিবীতে একটি অসাধারণ উপহার। তোমার প্রতিটি স্বপ্ন সত্যি হোক!\n(Shubho Jonmodin! Tumi ei prithibite ekti oshadharon upohar. Tomar protiti swapno shotti hok!)",
        tags: ['Beautiful', 'Emotional']
      },
      {
        id: 'bn-5',
        text: "Birthday te aar ek bochor badhlo, kintu tui jemon chhili temon-i aachchhish! Khub dhum dham kore birthday celebrate kor!\n(One more year at your birthday, but you're just as you always were! Celebrate with a bang!)",
        tags: ['Fun', 'Banglish']
      },
      {
        id: 'bn-6',
        text: "জন্মদিনের অনেক অনেক শুভেচ্ছা! ভগবান তোমাকে সুস্থ, সুখী ও সফল করুন। আজকের দিনটা তোমার জন্য অনেক বিশেষ!\n(Jonmodineer onek onek shubhechha! Bhogoban tomake shustho, shukhi o shofol korun. Ajker din-ta tomar jonyo onek bishesh!)",
        tags: ['Blessings', 'Traditional']
      }
    ]
  },
  {
    slug: 'punjabi',
    title: 'Birthday Wishes in Punjabi: ਜਨਮਦਿਨ ਮੁਬਾਰਕ',
    navTitle: 'Punjabi',
    shortDescription: 'Warm and vibrant Punjabi birthday wishes with transliteration, full of love, fun and blessings.',
    metaTitle: 'Birthday Wishes in Punjabi (2026). ਜਨਮਦਿਨ ਮੁਬਾਰਕ | BirthdayGen',
    metaDescription: 'Vibrant birthday wishes in Punjabi with English transliteration. Share on WhatsApp or create a free interactive birthday card with candles on BirthdayGen!',
    intro: 'Punjabi birthday wishes are as vibrant and warm as the culture itself. Whether for your bebe, paji, yaar, or any loved one, these janamdin mubarak messages bring the full energy of Punjab to their special day. Each wish includes transliteration so you can share easily on WhatsApp.',
    tips: [
      'Punjabi wishes pair perfectly with the Fun & Colorful or Royal Gold themes.',
      'For close friends, a Punglish (Punjabi + English) mix sounds natural.',
      'Add bhangra music from the BirthdayGen collection for the full Punjab vibe.',
      'Send at midnight for maximum birthday surprise impact.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday in Punjabi?',
        answer: '"ਜਨਮਦਿਨ ਮੁਬਾਰਕ!" (Janamdin Mubarak!) is the most popular way to say happy birthday in Punjabi. You can also say "ਜਨਮਦਿਨ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ!" (Janamdin diyaan lakh lakh vadhaiyan!).'
      },
      {
        question: 'Can I use Gurmukhi script in a BirthdayGen card?',
        answer: 'Yes! BirthdayGen supports Gurmukhi (Punjabi) script. Paste your Punjabi wish and it will look beautiful on any theme.'
      }
    ],
    wishes: [
      {
        id: 'pa-1',
        text: "ਜਨਮਦਿਨ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ! ਰੱਬ ਤੈਨੂੰ ਲੰਬੀ ਉਮਰ, ਚੰਗੀ ਸਿਹਤ ਤੇ ਬੇਅੰਤ ਖੁਸ਼ੀਆਂ ਦੇਵੇ। ਸਦਾ ਹੱਸਦਾ ਵੱਸਦਾ ਰਹਿ!\n(Janamdin diyaan lakh lakh vadhaiyan! Rabb tainu lambi umar, changi sihat te beant khushiyan deve. Sada hassda vassda rahi!)",
        tags: ['Heartfelt', 'Punjabi']
      },
      {
        id: 'pa-2',
        text: "Happy Birthday veere/veerno! Tere wargi/warga koi nahi, tu sachi ch one in a million hai. Aaj tera din aa, full enjoy kar!\n(Happy Birthday bro/sis! There's no one like you, you're truly one in a million. Today is your day!)",
        tags: ['Punglish', 'Friend']
      },
      {
        id: 'pa-3',
        text: "ਬੀਬੀ/ਬਾਪੂ ਜੀ, ਤੁਹਾਡੇ ਜਨਮਦਿਨ ਤੇ ਤੁਹਾਡੇ ਪੈਰੀਂ ਹੱਥ ਲਾਉਂਦੇ ਹਾਂ। ਤੁਸੀਂ ਜੋ ਪਿਆਰ ਤੇ ਕੁਰਬਾਨੀ ਸਾਨੂੰ ਦਿੱਤੀ ਹੈ ਉਹ ਅਨਮੋਲ ਹੈ। ਰੱਬ ਤੁਹਾਨੂੰ ਸਦਾ ਤੰਦਰੁਸਤ ਰੱਖੇ।\n(Beebi/Baapu ji, tuhaade janamdin te tuhaade pairin hath launde haan. Tusi jo pyaar te kurbani saanu ditti hai oh anmol hai. Rabb tuhaanu sada tandrust rakkhe.)",
        tags: ['Respectful', 'Parents']
      },
      {
        id: 'pa-4',
        text: "ਜਨਮਦਿਨ ਮੁਬਾਰਕ! ਤੇਰੇ ਵਰਗਾ ਯਾਰ ਕਿਸੇ ਨੂੰ ਨਹੀਂ ਮਿਲਦਾ। ਤੂੰ ਸੱਚਮੁੱਚ ਬਹੁਤ ਖਾਸ ਹੈਂ। ਅੱਜ ਖੂਬ ਮੌਜਾਂ ਮਾਣ!\n(Janamdin Mubarak! Tere warga yaar kise nu nahi milda. Tu sachmuch bahut khaas hain. Aj khoob mauja maan!)",
        tags: ['Warm', 'Friend']
      },
      {
        id: 'pa-5',
        text: "Paaji/Penji, birthday de bahane hi sahi, keh denda/dendi haan, tu best hai! Rabb teri har wish poori kare. Party kithe aa?\n(Bro/Sis, on the occasion of your birthday, you're the best! May God fulfil every wish. Where's the party?)",
        tags: ['Fun', 'Punglish']
      },
      {
        id: 'pa-6',
        text: "ਜਨਮਦਿਨ ਦੀਆਂ ਬਹੁਤ ਬਹੁਤ ਮੁਬਾਰਕਾਂ! ਵਾਹਿਗੁਰੂ ਤੈਨੂੰ ਚੜ੍ਹਦੀ ਕਲਾ ਵਿੱਚ ਰੱਖੇ। ਤੇਰੀ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਸਿਰਫ਼ ਖੁਸ਼ੀਆਂ ਹੀ ਖੁਸ਼ੀਆਂ ਹੋਣ!\n(Janamdin diyaan bahut bahut mubaarkaan! Waheguru tainu charhdi kala vich rakkhe. Teri zindagi vich sirf khushiyan hi khushiyan hon!)",
        tags: ['Blessings', 'Traditional']
      }
    ]
  },

  // ─── Missing Relation Pages (Programmatic SEO) ────────────────────────

  {
    slug: 'uncle',
    title: 'Warm Birthday Wishes for Uncle',
    navTitle: 'Uncle',
    shortDescription: 'Heartfelt and respectful birthday wishes for your uncle, from funny to deeply appreciative.',
    metaTitle: 'Birthday Wishes for Uncle: Heartfelt & Funny (2026) | BirthdayGen',
    metaDescription: 'Find the perfect birthday wishes for your uncle. From warm and respectful messages to funny greetings, copy or create a free interactive birthday card!',
    intro: 'Uncles hold a special place in our lives, part mentor, part friend, and always someone who has your back. Whether he is the cool uncle who spoils you or the wise one who gives the best advice, these birthday wishes help you celebrate him properly.',
    tips: [
      'Mention a specific memory or quality you admire about him.',
      'Humour works great for uncles, they usually appreciate a good roast.',
      'If he is tech-savvy, the BirthdayGen interactive card will impress him.',
      'Keep it warm and genuine, uncles rarely hear how much they are appreciated.'
    ],
    faqs: [
      {
        question: 'What is a good birthday message for an uncle?',
        answer: '"Happy Birthday to the coolest uncle anyone could ask for! Thank you for always being there with wisdom, laughs, and the best stories. Wishing you a year full of health, joy, and well-deserved relaxation!"'
      },
      {
        question: 'How can I make my uncle feel special on his birthday?',
        answer: 'Create a personalised BirthdayGen card with family photos, a heartfelt message, and virtual candles he can blow out. Share it on WhatsApp for an instant surprise!'
      }
    ],
    wishes: [
      {
        id: 'un-1',
        text: "Happy Birthday to the coolest uncle in the family! Thank you for always being the fun one, the wise one, and the one who never says no to seconds. Wishing you a year as awesome as you are!",
        tags: ['Warm', 'Fun']
      },
      {
        id: 'un-2',
        text: "Happy Birthday, Uncle! You are not just family, you are a mentor, a friend, and someone I look up to every single day. May this year bring you all the happiness you deserve!",
        tags: ['Respectful', 'Heartfelt']
      },
      {
        id: 'un-3',
        text: "To my favourite uncle: Happy Birthday! If being cool was a superpower, you would be the superhero of the family. Keep being amazing!",
        tags: ['Funny', 'Cheerful']
      },
      {
        id: 'un-4',
        text: "Happy Birthday, Uncle! Thank you for the stories, the advice, the laughs, and for always making family gatherings the best. You are truly one of a kind!",
        tags: ['Grateful', 'Family']
      },
      {
        id: 'un-5',
        text: "Wishing the happiest birthday to an uncle who makes everything more fun. Your energy, humour, and heart are what make you so special to all of us!",
        tags: ['Energetic', 'Celebratory']
      },
      {
        id: 'un-6',
        text: "Happy Birthday to my uncle! Some people are lucky to have one great role model. I got two, because you have always been right up there with dad. Have the best day!",
        tags: ['Deep', 'Emotional']
      }
    ]
  },
  {
    slug: 'aunt',
    title: 'Loving Birthday Wishes for Aunt',
    navTitle: 'Aunt',
    shortDescription: 'Sweet and heartfelt birthday wishes for your aunt, from loving messages to fun celebrations.',
    metaTitle: 'Birthday Wishes for Aunt: Sweet & Heartfelt (2026) | BirthdayGen',
    metaDescription: 'Beautiful birthday wishes for your aunt. Heartfelt, funny, and warm messages to celebrate her special day, send as a free interactive card!',
    intro: 'Aunts are the unsung heroes of every family, part second mother, part secret-keeper, and always ready with love and support. These birthday wishes help you tell her just how much she means to you, whether she is the glamorous aunty or the warm-hearted one who always cooks your favourite meal.',
    tips: [
      'Mention something specific she does that makes her special.',
      'Aunts love being appreciated, even a few genuine words go a long way.',
      'Add family event photos to the card for a nostalgic touch.',
      'The Elegant or Princess theme pairs beautifully with aunt birthday wishes.'
    ],
    faqs: [
      {
        question: 'What is a sweet birthday message for an aunt?',
        answer: '"Happy Birthday to the most wonderful aunt! Your love, warmth, and kindness have been a constant blessing in my life. Wishing you a day as beautiful as your heart!"'
      },
      {
        question: 'How to wish your aunt happy birthday in a special way?',
        answer: 'Create a BirthdayGen surprise card with your favourite photos together, a heartfelt message, and virtual candles. Share the link on WhatsApp for an instant smile!'
      }
    ],
    wishes: [
      {
        id: 'at-1',
        text: "Happy Birthday to the most amazing aunt! You bring so much warmth, love, and laughter to our family. Wishing you a year filled with everything that makes your heart happy!",
        tags: ['Sweet', 'Loving']
      },
      {
        id: 'at-2',
        text: "Happy Birthday, Aunty! You are like a second mom to me, always caring, always kind, always there. I am so grateful for you!",
        tags: ['Heartfelt', 'Family']
      },
      {
        id: 'at-3',
        text: "To my favourite aunt: Happy Birthday! If there was an award for being the coolest aunt ever, you would win every single year. Keep shining!",
        tags: ['Fun', 'Cheerful']
      },
      {
        id: 'at-4',
        text: "Happy Birthday to the aunt who always has the best advice, the warmest hugs, and the most delicious food. You are truly the heart of our family!",
        tags: ['Warm', 'Appreciative']
      },
      {
        id: 'at-5',
        text: "Wishing a wonderful birthday to my wonderful aunt! Your grace, strength, and kindness inspire everyone around you. May this year be your best one yet!",
        tags: ['Inspirational', 'Elegant']
      },
      {
        id: 'at-6',
        text: "Happy Birthday, Aunty! You make family feel like the safest place in the world. Thank you for always being our anchor. I love you so much!",
        tags: ['Emotional', 'Deep']
      }
    ]
  },
  {
    slug: 'cousin',
    title: 'Birthday Wishes for Cousin: Fun & Heartfelt',
    navTitle: 'Cousin',
    shortDescription: 'Fun, heartfelt and relatable birthday wishes for your cousin, your built-in best friend.',
    metaTitle: 'Birthday Wishes for Cousin: Fun & Heartfelt (2026) | BirthdayGen',
    metaDescription: 'Find the best birthday wishes for your cousin. Fun, nostalgic, and heartfelt messages, copy or turn into a free interactive birthday card with candles!',
    intro: 'Cousins are the friends that family gives you for free, the childhood partners in crime who know all your embarrassing stories. Whether close as siblings or connected across cities, these birthday wishes celebrate the unique bond only cousins share.',
    tips: [
      'Reference childhood memories and family events, cousins love nostalgia.',
      'Inside jokes hit different when sent as a birthday card.',
      'A BirthdayGen card with throwback family photos is pure gold.',
      'Keep the tone matching your relationship, banter for close cousins, warm for distant ones.'
    ],
    faqs: [
      {
        question: 'What is a good birthday wish for a cousin?',
        answer: '"Happy Birthday, cuz! Growing up with you was the best adventure, and I would not trade our memories for anything. Here is to another year of chaos, laughs, and being each other\'s favourite relative!"'
      },
      {
        question: 'How do I wish my cousin happy birthday in a unique way?',
        answer: 'Create a BirthdayGen card with throwback family photos, a personal message about your favourite cousin memories, and let them blow out virtual candles!'
      }
    ],
    wishes: [
      {
        id: 'co-1',
        text: "Happy Birthday, cuz! From childhood mischief to adult adventures, you have been my favourite partner in crime. Here is to many more years of creating memories together!",
        tags: ['Nostalgic', 'Fun']
      },
      {
        id: 'co-2',
        text: "Happy Birthday to my favourite cousin! You are not just family, you are my built-in best friend. Wishing you a year full of laughter, love, and everything you deserve!",
        tags: ['Heartfelt', 'Close']
      },
      {
        id: 'co-3',
        text: "To my cousin and fellow survivor of every family gathering: Happy Birthday! Nobody gets the chaos quite like we do. Keep being awesome!",
        tags: ['Funny', 'Relatable']
      },
      {
        id: 'co-4',
        text: "Happy Birthday, cousin! Thank you for all the inside jokes, family secrets, and being someone I can always count on. You make our family so much more fun!",
        tags: ['Warm', 'Grateful']
      },
      {
        id: 'co-5',
        text: "Wishing the happiest birthday to my incredible cousin! Even though we might not see each other every day, you are always close to my heart. Miss you and love you!",
        tags: ['Long Distance', 'Sweet']
      },
      {
        id: 'co-6',
        text: "Happy Birthday to my cousin! Growing up together is still my favourite chapter. Here is to writing many more great ones. Have an amazing day!",
        tags: ['Meaningful', 'Celebratory']
      }
    ]
  },
  {
    slug: 'nephew',
    title: 'Birthday Wishes for Nephew: Proud & Fun',
    navTitle: 'Nephew',
    shortDescription: 'Proud and fun birthday wishes for your nephew, from cool uncle/aunt vibes to heartfelt messages.',
    metaTitle: 'Birthday Wishes for Nephew (2026) | BirthdayGen',
    metaDescription: 'Find the perfect birthday wishes for your nephew. Proud, fun, and heartfelt messages, send as a free interactive birthday card with candles!',
    intro: 'Your nephew might be small or grown, but he will always be the kid who stole your heart. These birthday wishes let you be the cool uncle or aunt who actually makes his birthday memorable, whether he is 5 or 25.',
    tips: [
      'Match the tone to his age, playful for kids, proud for teenagers, supportive for adults.',
      'The Unicorn or Retro Neon theme works great for younger nephews.',
      'Add a photo of you two together for extra sentimental value.',
      'An interactive card with candle blowing is especially fun for kids.'
    ],
    faqs: [
      {
        question: 'What is a sweet birthday wish for a nephew?',
        answer: '"Happy Birthday to my amazing nephew! Watching you grow into the wonderful person you are fills my heart with so much pride. Keep shining, keep dreaming, and know that I am always cheering for you!"'
      },
      {
        question: 'How can I make my nephew\'s birthday special?',
        answer: 'Create a BirthdayGen surprise with fun photos, a personalised message, and the Unicorn or Retro Neon theme, then send the link for him to blow out virtual candles!'
      }
    ],
    wishes: [
      {
        id: 'np-1',
        text: "Happy Birthday to my amazing nephew! Watching you grow into the person you are fills me with so much pride. Keep chasing your dreams. I am always in your corner!",
        tags: ['Proud', 'Supportive']
      },
      {
        id: 'np-2',
        text: "Happy Birthday, little champ! Being your uncle/aunt is one of my greatest joys. May your day be filled with cake, fun, and all the presents you wished for!",
        tags: ['Fun', 'Young']
      },
      {
        id: 'np-3',
        text: "To my favourite nephew: Happy Birthday! You bring so much energy, laughter, and chaos to our family, and we would not have it any other way!",
        tags: ['Warm', 'Playful']
      },
      {
        id: 'np-4',
        text: "Happy Birthday, nephew! You are not just my brother's/sister's kid, you are one of my favourite humans. Have the most epic birthday ever!",
        tags: ['Cool Uncle', 'Cheerful']
      },
      {
        id: 'np-5',
        text: "Wishing my incredible nephew the happiest birthday! May you always stay curious, kind, and fearlessly yourself. The world is so lucky to have you!",
        tags: ['Inspirational', 'Heartfelt']
      },
      {
        id: 'np-6',
        text: "Happy Birthday to the coolest nephew ever! Every year you become more amazing, and every year I become prouder. Keep being you!",
        tags: ['Proud', 'Celebratory']
      }
    ]
  },
  {
    slug: 'niece',
    title: 'Birthday Wishes for Niece: Sweet & Proud',
    navTitle: 'Niece',
    shortDescription: 'Sweet and proud birthday wishes for your niece, from adorable to deeply heartfelt.',
    metaTitle: 'Birthday Wishes for Niece: Sweet & Proud (2026) | BirthdayGen',
    metaDescription: 'Beautiful birthday wishes for your niece. Sweet, proud, and heartfelt messages, copy or send as a free interactive birthday card on BirthdayGen!',
    intro: 'Your niece is the little (or not so little) sunshine who lights up every family gathering. Whether she is a toddler, a teenager, or a young woman, these birthday wishes help you be the aunt or uncle who always makes her feel special.',
    tips: [
      'The Princess or Unicorn theme is perfect for younger nieces.',
      'For teenage nieces, keep it empowering, they remember the adults who believed in them.',
      'Add childhood-to-now photos for maximum emotional impact.',
      'A BirthdayGen card sent at midnight is the ultimate cool-aunt/uncle move.'
    ],
    faqs: [
      {
        question: 'What is a sweet birthday wish for a niece?',
        answer: '"Happy Birthday to my precious niece! You are a beautiful soul with a heart of gold. Watching you grow is one of my life\'s greatest joys. May all your dreams come true!"'
      },
      {
        question: 'How to make a niece\'s birthday memorable?',
        answer: 'Create a BirthdayGen card with the Princess or Unicorn theme, add your favourite photos together, write a heartfelt message, and let her blow out virtual candles!'
      }
    ],
    wishes: [
      {
        id: 'nc-1',
        text: "Happy Birthday to my beautiful niece! You are sunshine wrapped in a smile. Watching you grow into the incredible person you are fills my heart with joy and pride!",
        tags: ['Sweet', 'Proud']
      },
      {
        id: 'nc-2',
        text: "Happy Birthday, princess! Being your aunt/uncle is one of the best things that ever happened to me. May your day be as sparkly and magical as you are!",
        tags: ['Adorable', 'Young']
      },
      {
        id: 'nc-3',
        text: "To my favourite niece: Happy Birthday! You have this incredible ability to light up every room you walk into. Never lose that spark, the world needs it!",
        tags: ['Empowering', 'Warm']
      },
      {
        id: 'nc-4',
        text: "Happy Birthday, sweetheart! I am so proud of the smart, kind, and brave person you are becoming. Dream big. I will always be your biggest cheerleader!",
        tags: ['Inspirational', 'Heartfelt']
      },
      {
        id: 'nc-5',
        text: "Wishing my amazing niece the happiest birthday! From our silly moments to the deep talks, being in your life is a gift I treasure every day.",
        tags: ['Emotional', 'Close']
      },
      {
        id: 'nc-6',
        text: "Happy Birthday to the coolest niece ever! You make our family brighter, louder, and so much more fun. Keep being wonderfully you!",
        tags: ['Fun', 'Celebratory']
      }
    ]
  },
  {
    slug: 'boss',
    title: 'Professional Birthday Wishes for Boss',
    navTitle: 'Boss',
    shortDescription: 'Professional yet warm birthday wishes for your boss, respectful, appropriate and genuinely appreciative.',
    metaTitle: 'Birthday Wishes for Boss: Professional & Warm (2026) | BirthdayGen',
    metaDescription: 'Find the perfect birthday wishes for your boss. Professional, respectful, and warm messages to celebrate their birthday. Send as a team card on BirthdayGen!',
    intro: 'Wishing your boss a happy birthday strikes a delicate balance, too formal feels robotic, too casual feels inappropriate. These birthday wishes for bosses are crafted to be genuinely warm without crossing professional boundaries. Perfect for team cards, emails, or a BirthdayGen surprise.',
    tips: [
      'Keep it professional but not stiff, warmth is appropriate.',
      'Mention their leadership qualities or something specific you admire.',
      'A team BirthdayGen card with everyone contributing a message is a great idea.',
      'The Elegant or Minimal theme feels appropriately professional.'
    ],
    faqs: [
      {
        question: 'What is a good birthday message for your boss?',
        answer: '"Happy Birthday! Your leadership, vision, and dedication inspire our entire team every day. Wishing you a wonderful year ahead filled with success and well-deserved celebrations!"'
      },
      {
        question: 'Is it appropriate to send a birthday card to your boss?',
        answer: 'Absolutely! A thoughtful, professional birthday wish shows respect and appreciation. A BirthdayGen card from the whole team is a great way to celebrate together.'
      }
    ],
    wishes: [
      {
        id: 'bo-1',
        text: "Happy Birthday! Your leadership and vision inspire our entire team. Wishing you a year filled with success, growth, and well-deserved celebrations!",
        tags: ['Professional', 'Respectful']
      },
      {
        id: 'bo-2',
        text: "Happy Birthday to a truly exceptional leader! Working with you is both a privilege and an inspiration. May this year bring you new achievements and great happiness!",
        tags: ['Appreciative', 'Warm']
      },
      {
        id: 'bo-3',
        text: "Wishing you a wonderful birthday! Thank you for creating an environment where we all thrive. Your guidance makes a real difference in our careers and our days!",
        tags: ['Grateful', 'Team']
      },
      {
        id: 'bo-4',
        text: "Happy Birthday! Here is to the person who turns meetings into milestones and deadlines into victories. Enjoy your special day, you have earned it!",
        tags: ['Light', 'Corporate']
      },
      {
        id: 'bo-5',
        text: "Happy Birthday to our amazing boss! Your dedication, patience, and encouragement do not go unnoticed. The whole team wishes you a fantastic year ahead!",
        tags: ['Team', 'Heartfelt']
      },
      {
        id: 'bo-6',
        text: "Wishing you a very happy birthday! A great boss is hard to find, and we know how fortunate we are. May your year be as remarkable as your leadership!",
        tags: ['Sincere', 'Professional']
      }
    ]
  },
  {
    slug: 'friend',
    title: 'Birthday Wishes for Friend: Simple & Genuine',
    navTitle: 'Friend',
    shortDescription: 'Simple, genuine, and heartfelt birthday wishes for friends of all kinds, not just best friends.',
    metaTitle: 'Birthday Wishes for Friend (2026). Simple & Genuine | BirthdayGen',
    metaDescription: 'Find simple and genuine birthday wishes for a friend. Warm, honest messages for close friends, work friends, and new friends, create a free card on BirthdayGen!',
    intro: 'Not every friend is a best friend, some are work friends, school friends, gym friends, or the kind of friend you do not see often but always pick up right where you left off. These birthday wishes are for all of them, simple, honest, and warm without being over the top.',
    tips: [
      'Match the depth to the friendship, not every friend needs a novel.',
      'A simple, genuine wish often means more than something overly elaborate.',
      'The Fun & Colorful or Minimal theme works well for casual friends.',
      'Adding a photo together makes even a short message feel personal.'
    ],
    faqs: [
      {
        question: 'What is a simple birthday wish for a friend?',
        answer: '"Happy Birthday! Knowing you makes life better. Wishing you a day full of good vibes, great people, and all the things that make you smile!"'
      },
      {
        question: 'How do I wish a friend I am not super close to?',
        answer: 'Keep it warm but brief. Something like "Happy Birthday! Hope your day is awesome and your year ahead is even better!" is perfectly appropriate and genuine.'
      }
    ],
    wishes: [
      {
        id: 'fr-1',
        text: "Happy Birthday! Knowing you makes life genuinely better. Wishing you a day full of good vibes, great people, and all the things that make you smile!",
        tags: ['Simple', 'Warm']
      },
      {
        id: 'fr-2',
        text: "Happy Birthday, friend! Here is to another year of good times, honest conversations, and memories worth keeping. Enjoy your day!",
        tags: ['Genuine', 'Easy']
      },
      {
        id: 'fr-3',
        text: "Wishing you the happiest birthday! You deserve all the good things coming your way. Here is to a year full of growth, adventure, and happiness!",
        tags: ['Positive', 'Hopeful']
      },
      {
        id: 'fr-4',
        text: "Happy Birthday! I am really glad we are friends. May your birthday be as awesome as you are, and your year ahead be full of wins!",
        tags: ['Casual', 'Cheerful']
      },
      {
        id: 'fr-5',
        text: "Happy Birthday to a wonderful human! Thank you for being someone who makes the world a little brighter just by being in it.",
        tags: ['Sweet', 'Appreciative']
      },
      {
        id: 'fr-6',
        text: "Birthday cheers to you, friend! Whether we see each other every day or once a year, I always value having you in my life. Have the best day!",
        tags: ['Long Distance', 'Meaningful']
      }
    ]
  },
  {
    slug: 'crush',
    title: 'Birthday Wishes for Crush: Subtle & Sweet',
    navTitle: 'Crush',
    shortDescription: 'Subtle, sweet birthday wishes for your crush, enough to show interest without scaring them away.',
    metaTitle: 'Birthday Wishes for Crush: Cute & Subtle (2026) | BirthdayGen',
    metaDescription: 'Cute and subtle birthday wishes for your crush. Say just enough to show you care, copy or send as a free interactive birthday card on BirthdayGen!',
    intro: 'Wishing your crush happy birthday is a high-stakes moment, say too little and you blend into the crowd, say too much and you might come on too strong. These wishes are calibrated to be sweetly suggestive without crossing any lines. Bonus points if you send a BirthdayGen card, nothing says "I put in effort" like an interactive surprise.',
    tips: [
      'Keep it light and warm, subtlety is your superpower here.',
      'A BirthdayGen card shows effort without being overwhelming.',
      'The Midnight Stars or Princess theme sets a romantic-but-not-too-much mood.',
      'Do not overthink it, genuine warmth always wins.'
    ],
    faqs: [
      {
        question: 'What is a cute birthday message for a crush?',
        answer: '"Happy Birthday! I just wanted you to know that knowing you makes my days a little brighter. Hope your birthday is as amazing as your smile!"'
      },
      {
        question: 'Should I send a birthday card to my crush?',
        answer: 'Yes! A thoughtful birthday wish stands out. A BirthdayGen card with a sweet message and virtual candles is cute, creative, and non-threatening, the perfect move.'
      }
    ],
    wishes: [
      {
        id: 'cr-1',
        text: "Happy Birthday! I just wanted you to know that knowing you makes everything a little brighter. Hope your day is as amazing as your smile!",
        tags: ['Sweet', 'Subtle']
      },
      {
        id: 'cr-2',
        text: "Happy Birthday to someone who makes ordinary days feel special just by being around. Wishing you the best day and an incredible year ahead!",
        tags: ['Warm', 'Smooth']
      },
      {
        id: 'cr-3',
        text: "Hey, happy birthday! Just wanted to be one of the people who makes you smile today. You deserve all the good things, seriously.",
        tags: ['Casual', 'Genuine']
      },
      {
        id: 'cr-4',
        text: "Happy Birthday! Not gonna lie, you are one of the people I look forward to hearing from. Hope your birthday is as wonderful as you are!",
        tags: ['Honest', 'Bold']
      },
      {
        id: 'cr-5',
        text: "Wishing you a really happy birthday! Some people just have this energy that makes everything better, and you are definitely one of them.",
        tags: ['Charming', 'Light']
      },
      {
        id: 'cr-6',
        text: "Happy Birthday! Here is a small surprise to show I was thinking about you today. Because honestly, I think about you more than you probably know.",
        tags: ['Brave', 'Romantic']
      }
    ]
  },

  // ─── Social, Status & Quote Categories (High-Volume Keywords) ─────────

  {
    slug: 'captions',
    title: 'Birthday Captions for Instagram (2026). Aesthetic, Funny & Short',
    navTitle: 'Instagram Captions',
    shortDescription: 'Trending, aesthetic, funny, and short birthday captions for Instagram posts, stories, and reels.',
    metaTitle: '100+ Best Birthday Captions for Instagram (2026) | BirthdayGen',
    metaDescription: 'Discover the best birthday captions for Instagram. Aesthetic, funny, baddie, short, and sentimental captions for your photos, stories, and reels. Copy or turn into an interactive birthday card!',
    intro: 'Finding the right Instagram caption for a birthday post shouldn’t take longer than picking the photo. Whether you are posting for yourself, your best friend, or your partner, here are top trending birthday captions for 2026, categorized from short & aesthetic to hilarious roasts.',
    tips: [
      'Keep it punchy for stories, one-liners get the highest engagement.',
      'Add emojis that match the vibe of your photo palette.',
      'Tag the birthday person and drop a BirthdayGen link in your bio or story for a virtual cake blow-out.',
      'Self-birthday captions work best with a bit of humorous self-love.'
    ],
    faqs: [
      {
        question: 'What is a catchy birthday caption for myself?',
        answer: '"Leveling up today. Cheers to another trip around the sun! 🥂✨"'
      },
      {
        question: 'What is a short aesthetic birthday caption?',
        answer: '"Another year bolder, brighter, better. 🤍"'
      }
    ],
    wishes: [
      {
        id: 'cap-1',
        text: "Leveling up today. Cheers to another 365 days of making my own rules! 🥂✨",
        tags: ['Self', 'Aesthetic']
      },
      {
        id: 'cap-2',
        text: "Made it through another year and somehow got even cuter. Happy Birthday to me! 🎂💁‍♀️",
        tags: ['Funny', 'Baddie']
      },
      {
        id: 'cap-3',
        text: "Happy birthday to my favorite human on this earth. Life would be so boring without our chaos! 🖤",
        tags: ['Best Friend', 'Vibe']
      },
      {
        id: 'cap-4',
        text: "Another year older, none the wiser. 🎈✨",
        tags: ['Short', 'Humor']
      },
      {
        id: 'cap-5',
        text: "Holding onto my childhood like it is a limited edition vinyl. Grateful for another year. 🕯️💛",
        tags: ['Nostalgic', 'Thoughtful']
      },
      {
        id: 'cap-6',
        text: "Here is to the nights that turned into mornings with the friend that turned into family. Happy birthday! 🥂🎉",
        tags: ['Emotional', 'Friendship']
      },
      {
        id: 'cap-7',
        text: "Celebrating the birth of the main character. 🎬✨ Happy Birthday!",
        tags: ['Trending', 'Fun']
      },
      {
        id: 'cap-8',
        text: "I do not get older, I just level up in vintage value. 🍷 Happy Birthday to me!",
        tags: ['Classy', 'Witty']
      }
    ]
  },
  {
    slug: 'whatsapp-status',
    title: 'Birthday Status for WhatsApp: Best One-Liners & Video Quotes',
    navTitle: 'WhatsApp Status',
    shortDescription: 'Short, sweet, and emoji-packed birthday status messages for WhatsApp, stories, and bios.',
    metaTitle: 'Best Birthday Status for WhatsApp (2026). Short & Sweet | BirthdayGen',
    metaDescription: 'Find trending birthday WhatsApp status quotes and wishes. Perfect for 24-hour status, stories, and reels, copy with 1 click or share a virtual candle-blowing card link!',
    intro: 'A 24-hour WhatsApp status is the easiest way to show love on someone’s birthday. From midnight countdown messages to emotional lines and funny one-liners with emojis, here are the best WhatsApp birthday status updates ready to copy and post with one tap.',
    tips: [
      'Post at 12:00 AM sharp for maximum midnight surprise points.',
      'Pair the status with a BirthdayGen interactive card link so their contacts can blow candles together.',
      'Use clean emojis (🎂 ✨ 🥂 ❤️) to make the text pop in the status feed.',
      'Keep status text under 2 lines so viewers can read it before the story auto-skips.'
    ],
    faqs: [
      {
        question: 'What can I write in a WhatsApp status for a friend\'s birthday?',
        answer: '"Happy Birthday to my favourite crime partner! May your day be as wild and unforgettable as our memories together. 🥂🎉"'
      },
      {
        question: 'How can I make a WhatsApp birthday status interactive?',
        answer: 'Paste a link to a personalized BirthdayGen card in your status caption. When your friend taps it, they get interactive candles they can blow out!'
      }
    ],
    wishes: [
      {
        id: 'ws-1',
        text: "Wishing the happiest birthday to the one who makes every room brighter! 🎂✨ May all your secret prayers be answered this year.",
        tags: ['Sweet', 'Blessings']
      },
      {
        id: 'ws-2',
        text: "Happy Birthday to my favourite person to annoy! 😂❤️ Stay blessed, stay crazy, and never change!",
        tags: ['Playful', 'Close']
      },
      {
        id: 'ws-3',
        text: "12:00 AM officially unlocked your day! 🥳🎉 Happy Birthday, superstar! Let the celebrations begin!",
        tags: ['Midnight', 'Hype']
      },
      {
        id: 'ws-4',
        text: "Happy Birthday! May your day be filled with warm smiles, endless laughter, and extra slices of cake. 🍰💖",
        tags: ['Classic', 'Warm']
      },
      {
        id: 'ws-5',
        text: "No matter how old you get, you will always be my favourite headache. Happy Birthday! 🍾🎈",
        tags: ['BFF', 'Roast']
      },
      {
        id: 'ws-6',
        text: "May God shower you with health, peace, prosperity, and unlimited joy. Happy Birthday! 🙏🌟",
        tags: ['Blessings', 'Heartfelt']
      }
    ]
  },
  {
    slug: 'quotes',
    title: 'Inspiring Birthday Quotes: Meaningful & Famous Sayings',
    navTitle: 'Quotes',
    shortDescription: 'Thoughtful, inspiring, and timeless birthday quotes from renowned authors, poets, and thinkers.',
    metaTitle: 'Inspiring Birthday Quotes & Famous Sayings (2026) | BirthdayGen',
    metaDescription: 'Explore timeless and inspiring birthday quotes from famous authors and thinkers. Deep, poetic, and meaningful birthday messages, copy or design an interactive card!',
    intro: 'Sometimes our own words feel too small for someone who means the world to us. These timeless birthday quotes by poets, authors, and philosophers capture the beauty of aging, the joy of existence, and the deep gratitude of having someone in our lives.',
    tips: [
      'Pair a classic quote with a brief personal memory to give it intimacy.',
      'Quotes look exceptionally elegant when paired with the Royal Gold or Midnight Stars theme.',
      'Great for cards to mentors, parents, grandparents, and spouses.',
      'Add author attribution for that extra touch of sophistication.'
    ],
    faqs: [
      {
        question: 'What is a famous inspiring quote about birthdays?',
        answer: '"Do not count the candles, see the light they give. Don\'t count your years, but the life you live." (Unknown)'
      },
      {
        question: 'How to use birthday quotes in a card?',
        answer: 'Start with the quote as the opening hook, followed by your personal message expressing how the quote reminds you of them.'
      }
    ],
    wishes: [
      {
        id: 'qt-1',
        text: "\"Count your age by friends, not years. Count your life by smiles, not tears.\" (John Lennon)",
        tags: ['Classic', 'Poetic']
      },
      {
        id: 'qt-2',
        text: "\"The more you praise and celebrate your life, the more there is in life to celebrate.\" (Oprah Winfrey)",
        tags: ['Inspirational', 'Celebration']
      },
      {
        id: 'qt-3',
        text: "\"You don’t get older, you get better.\" (Shirley Bassey)",
        tags: ['Empowering', 'Short']
      },
      {
        id: 'qt-4',
        text: "\"Today you are you, that is truer than true. There is no one alive who is you-er than you.\" (Dr. Seuss)",
        tags: ['Playful', 'Heartwarming']
      },
      {
        id: 'qt-5',
        text: "\"With mirth and laughter let old wrinkles come.\" (William Shakespeare)",
        tags: ['Timeless', 'Literature']
      },
      {
        id: 'qt-6',
        text: "\"Wrinkles should merely indicate where smiles have been.\" (Mark Twain)",
        tags: ['Wise', 'Comforting']
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
