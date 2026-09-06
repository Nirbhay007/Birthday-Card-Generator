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
  },
  {
    slug: 'mom',
    title: 'Touching Birthday Wishes for Mom From Daughter & Son',
    navTitle: 'Mom',
    shortDescription: 'Tender, grateful birthday messages that tell your mother how much her love means to you.',
    metaTitle: 'Heartfelt Birthday Wishes for Mom (2026) | BirthdayGen',
    metaDescription: 'Find touching birthday wishes for your mom from daughter or son. Turn any message into an interactive card with photos, music and blowable candles!',
    intro: 'Nobody deserves a beautiful birthday surprise more than Mom. Whether you live next door or across the world, these heartfelt birthday wishes for mothers help you say the thank-you that everyday life rarely makes room for — and with BirthdayGen you can deliver it as an interactive page with her favourite photos.',
    tips: [
      'Name something specific she did for you — the 5am lunches, the exam-night courage, the quiet sacrifices.',
      'Tell her what of hers you see in yourself; mothers treasure that above all.',
      'If words feel small, let family photos in a BirthdayGen gallery do the talking.',
      'End with a wish for HER — health, rest, joy — not just gratitude for what she gives.'
    ],
    faqs: [
      {
        question: 'What is the most touching birthday wish for a mom?',
        answer: '"Mom, everything I am started with your love. Thank you for the thousand invisible things you do every day. I wish you health, peace, and a year as beautiful as your heart. Happy Birthday!"'
      },
      {
        question: 'How can I surprise my mom on her birthday from far away?',
        answer: 'Create a BirthdayGen page with childhood photos, a voice-like personal message, and virtual candles she can blow out on her phone — then send the link on WhatsApp right at midnight.'
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
        text: "To the woman who taught me kindness by living it — thank you for every packed lunch, every late-night talk, every time you believed in me first. Have the happiest birthday, Mom!",
        tags: ['Thankful', 'Nostalgic']
      },
      {
        id: 'mo-3',
        text: "Mom, I catch myself saying your phrases, cooking your recipes, and loving the way you love — and I have never been prouder. Wishing you a birthday as wonderful as you are.",
        tags: ['Emotional', 'Daughter']
      },
      {
        id: 'mo-4',
        text: "Happy Birthday to my first home and forever safe place! Today we celebrate YOU — no chores, no worries, only cake, rest, and being spoiled the way you spoil us.",
        tags: ['Warm', 'Celebratory']
      },
      {
        id: 'mo-5',
        text: "They say superheroes wear capes; mine wears an apron and knows exactly when I need a hug over the phone. Happy Birthday, supermom!",
        tags: ['Sweet', 'Playful']
      },
      {
        id: 'mo-6',
        text: "Mom, may your year be gentle with you — good health, slow mornings, and dreams that are finally about YOU. You deserve every bit of happiness coming your way.",
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
    metaDescription: 'Honour your father with warm birthday wishes for dad — from respectful to funny. Pair any wish with photos and make him an interactive birthday card!',
    intro: 'Dads often love quietly — through fixed things, funded dreams, and bad jokes told with total confidence. These birthday wishes for fathers put words to that steady love, whether your dad is sentimental, stoic, or the family comedian.',
    tips: [
      'Thank him for something concrete: the driving lessons, the career advice, the safety net.',
      'Match his style — short and strong for stoic dads, warm and funny for softies.',
      'Old photos of you two together will undo even the toughest dad. Add them to the card.',
      'A little humour about his jokes or his naps always lands — keep it affectionate.'
    ],
    faqs: [
      {
        question: 'What is a good short birthday message for dad?',
        answer: '"Happy Birthday, Dad! Strong, kind, and always there — thank you for being my lifelong hero. Wishing you health and happiness today and always."'
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
        text: "To my first hero and permanent advisor — thank you for every sacrifice you never mentioned and every lesson you never charged for. Have a fantastic birthday, Papa!",
        tags: ['Grateful', 'Hero']
      },
      {
        id: 'da-3',
        text: "Dad, your jokes got worse and your wisdom got better — what a trade! Wishing you a birthday full of cake, naps, and zero remote-control fights.",
        tags: ['Funny', 'Playful']
      },
      {
        id: 'da-4',
        text: "Happy Birthday to the man whose shoulders I stood on — literally and in life. May this year bring you health, pride, and everything you quietly wished for us.",
        tags: ['Emotional', 'Proud']
      },
      {
        id: 'da-5',
        text: "Papa, distance means nothing: your voice still guides every big decision I make. Celebrating you today with all my heart. Happy Birthday!",
        tags: ['Long Distance', 'Tender']
      },
      {
        id: 'da-6',
        text: "Wishing the coolest dad a birthday as solid and golden as he is. Save me a slice of cake — you owe me for all those dad jokes!",
        tags: ['Cheerful', 'Banter']
      }
    ]
  },
  {
    slug: 'sister',
    title: 'Sweet & Sassy Birthday Wishes for Sister',
    navTitle: 'Sister',
    shortDescription: 'Loving, funny, and nostalgic birthday messages for your sister — kid sister or elder.',
    metaTitle: 'Birthday Wishes for Sister: Sweet, Funny & Emotional (2026)',
    metaDescription: 'The best birthday wishes for your sister — from childhood nostalgia to sassy one-liners. Add photos and send her an interactive surprise card!',
    intro: 'She stole your clothes, kept your secrets, and fought beside you like family and like a friend. These birthday wishes for sisters cover every dynamic — adoring younger siblings, grateful kid sisters, and partners-in-crime.',
    tips: [
      'Pick one shared childhood memory — the sillier, the more she will laugh-cry.',
      'Elder sisters love being thanked; younger sisters love being hyped up.',
      'Throwback photos of matching outfits or festival chaos are pure gold in the gallery.',
      'Mix one genuine line into the teasing — that is the message she screenshots.'
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
        text: "To my gorgeous, brilliant sister — may your birthday be filled with everything you pretend you don't want but absolutely deserve. Love you endlessly!",
        tags: ['Sweet', 'Loving']
      },
      {
        id: 'si-3',
        text: "Happy Birthday to the only person who knows exactly how annoying I was as a kid and loves me anyway. Your patience deserves its own award — and cake!",
        tags: ['Funny', 'Sibling Banter']
      },
      {
        id: 'si-4',
        text: "Didi, you paved the way, lent the clothes, and took the blame more times than I can count. Today the spotlight is all yours. Happiest of birthdays!",
        tags: ['Elder Sister', 'Grateful']
      },
      {
        id: 'si-5',
        text: "Watching my little sister grow into this incredible woman is my favourite plot twist. Keep shining, keep dreaming — and keep stealing my hoodies. Happy Birthday!",
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
    shortDescription: 'Brotherly birthday wishes — from heartfelt respect to legendary sibling roasts.',
    metaTitle: 'Birthday Wishes for Brother: Funny, Cool & Heartfelt (2026)',
    metaDescription: 'Epic birthday wishes for your brother — roasts, respect, and nostalgia. Turn one into an interactive card with photos and candles!',
    intro: 'He annoyed you, defended you, and taught you everything from cricket to comebacks. These birthday wishes for brothers range from brotherly pride to gloriously unfiltered roasts — pick your fighter.',
    tips: [
      'A good roast followed by one sincere line is the brother-message formula.',
      'Reference his obsessions — gaming, bikes, gym, films — for instant personal points.',
      'Childhood mischief photos in the card gallery guarantee a laugh.',
      'Elder brothers melt at respect; younger brothers melt at being called a legend.'
    ],
    faqs: [
      {
        question: 'What is a funny birthday wish for a brother?',
        answer: '"Happy Birthday, bro! Thanks for taking the blame all those years — consider this message my repayment, with interest paid entirely in cake."'
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
        text: "To my elder brother — my first rival and my forever role model. Everything cool I know, I learned trying to keep up with you. Have a massive birthday, bhai!",
        tags: ['Elder Brother', 'Respect']
      },
      {
        id: 'br-3',
        text: "Happy Birthday to my little brother, who finally grew taller but not wiser! Proud of the man you're becoming — now act your shoe size, not your age.",
        tags: ['Younger Brother', 'Roast']
      },
      {
        id: 'br-4',
        text: "Bro, thanks for the life lessons: how to negotiate with parents, how to finish the last slice first, and how to always have my back. Best birthday ever to you!",
        tags: ['Nostalgic', 'Grateful']
      },
      {
        id: 'br-5',
        text: "Wishing my brother a year with full battery, zero lag, maximum goals — on the field and off it. Game on, birthday boy! 🎮",
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
    intro: 'He is your teammate in bills and dreams alike. These birthday wishes for husbands blend romance with real-life appreciation — for the husband who fixes things, forgets dates, but never forgets you.',
    tips: [
      'Thank him for an unglamorous everyday thing — that lands deeper than grand poetry.',
      'Recall your wedding day or the day you knew — nostalgia is romance fuel.',
      'Couple photos from trips and tiny moments make the card unforgettable.',
      'A playful line about his habits keeps it real and makes him grin.'
    ],
    faqs: [
      {
        question: 'What is a romantic birthday message for my husband?',
        answer: '"Happy Birthday to the man I still choose every single day. Home was never a place — it was always you. Here is to growing old and still laughing together."'
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
        text: "To my husband — the man who kills spiders, carries the heavy bags, and holds my hand through every storm. Today we celebrate YOU, hero!",
        tags: ['Appreciative', 'Sweet']
      },
      {
        id: 'hu-3',
        text: "Happy Birthday, handsome! You snore, you steal blankets, and you are still the best decision I ever made. Here's to many more adventures side by side.",
        tags: ['Playful', 'Loving']
      },
      {
        id: 'hu-4',
        text: "Every year with you writes my favourite chapter. May this birthday begin your happiest one yet — I will be right beside you, as always.",
        tags: ['Poetic', 'Devoted']
      },
      {
        id: 'hu-5',
        text: "Cheers to the man who works so hard for our dreams and still shows up for movie night. Rest today, my love — the crown is yours. Happy Birthday!",
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
    intro: 'She runs the house, the calendar, and your heart. These birthday wishes for wives say what busy days leave unsaid — admiration, desire, gratitude, and a promise to celebrate her like day one.',
    tips: [
      'Compliment who she IS, not just what she does — her laugh, her courage, her mind.',
      'Mention a moment you fell for her again recently — wives notice everything except being noticed.',
      'Wedding and honeymoon photos in the gallery = instant tears (good ones).',
      'Promise one concrete thing: a date, a break, a chore off her plate forever.'
    ],
    faqs: [
      {
        question: 'How do I wish my wife a happy birthday romantically?',
        answer: '"Happy Birthday, my beautiful wife. Loving you is the easiest thing I have ever done. Today the world celebrates the day my favourite person arrived — and so do I, with all my heart."'
      }
    ],
    wishes: [
      {
        id: 'wi-1',
        text: "Happy Birthday, my gorgeous wife! You turn our house into a home and my life into an adventure. Today, the queen gets whatever she wants — starting with breakfast in bed.",
        tags: ['Romantic', 'Adoring']
      },
      {
        id: 'wi-2',
        text: "To the strongest, kindest woman I know — thank you for loving me at my worst and cheering loudest at my best. Wishing you a birthday as extraordinary as you are!",
        tags: ['Admiring', 'Deep']
      },
      {
        id: 'wi-3',
        text: "Happy Birthday, beautiful! You still give me butterflies — along with reminders, lists, and the occasional well-deserved scolding. Wouldn't trade a single day.",
        tags: ['Playful', 'Sweet']
      },
      {
        id: 'wi-4',
        text: "Every wrinkle we earn together is my favourite souvenir. Here's to growing old, laughing hard, and loving harder. Happy Birthday, my forever girl!",
        tags: ['Poetic', 'Timeless']
      },
      {
        id: 'wi-5',
        text: "Wishing my wife a day with zero chores, full pampering, and cake for every meal. You spend all year caring for us — today we care for you!",
        tags: ['Pampering', 'Caring']
      },
      {
        id: 'wi-6',
        text: "I asked for happiness and got you. Happy Birthday to my dream come true — may this year love you the way you love everyone else.",
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
    metaDescription: 'The cutest birthday wishes for your boyfriend — sweet, flirty, and fun. Send one as an interactive card with photos and candles!',
    intro: 'Whether it is your first birthday together or your fifth, these birthday wishes for boyfriends hit the sweet spot between cute and meaningful — flirty enough to make him blush, real enough to keep.',
    tips: [
      'Reference YOUR thing — the late-night calls, the food orders, the inside jokes.',
      'Compliment him in a way his friends never do — sweetly specific.',
      'Screenshots of cute chats plus couple selfies make a killer gallery.',
      'End with excitement for the future, not just the day.'
    ],
    faqs: [
      {
        question: 'What is a cute birthday text for my boyfriend?',
        answer: '"Happy Birthday to my favourite notification! You make ordinary days feel like festivals. Can\'t wait to celebrate you — cake first, cuddles after."'
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
        text: "To the boy with the best smile and the biggest heart — may your birthday be as amazing as the day you walked into my life. So glad you were born!",
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
        text: "Cheers to you — my gamer, my chef, my 2am philosopher! May this year unlock all your dream levels. Happy Birthday, hero!",
        tags: ['Modern', 'Cheerful']
      },
      {
        id: 'bo-6',
        text: "Every love story is beautiful, but ours is my favourite page-turner. Happy Birthday to my co-author — many more chapters to go!",
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
    intro: 'Her birthday is your annual championship match — and these birthday wishes for girlfriends are your winning playbook. Sweet, a little flirty, genuinely observant: the combination that actually melts hearts.',
    tips: [
      'Notice details: her laugh, her ambition, the way she cares — generic compliments lose.',
      'A tiny apology for your one annoying habit + promise = charm overload.',
      'Her favourite photos of YOU TWO (not just her) show partnership.',
      'Handwritten-style sincerity beats copied poetry every time.'
    ],
    faqs: [
      {
        question: 'How do I make my girlfriend feel special on her birthday?',
        answer: 'Combine words with effort: a personal message naming what you adore about her, her favourite photos in a surprise page, and one planned moment — even a video call with candles counts.'
      }
    ],
    wishes: [
      {
        id: 'gi-1',
        text: "Happy Birthday, gorgeous! You walked into my life and redecorated everything — brighter, warmer, better. Best renovation ever. Love you!",
        tags: ['Charming', 'Sweet']
      },
      {
        id: 'gi-2',
        text: "To my princess — may your day overflow with flowers, surprises, and a boyfriend who finally remembers everything. (Starting today. Promise.)",
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
    metaDescription: 'Celebrate your boy with proud birthday wishes for sons — from little champs to grown men. Build him a photo-filled interactive card!',
    intro: 'From first steps to big moves, watching your son grow is life\'s greatest privilege. These birthday wishes for sons speak parent-to-heart at every stage — little explorer, moody teen, or grown man still calling for recipes.',
    tips: [
      'Tell him what you are proud of RIGHT NOW — specific praise sticks for years.',
      'Share belief in his future; sons carry parental confidence like armour.',
      'Baby photos + recent photos side by side = instant emotional knockout.',
      'Keep the door open: end with "we are always here" — he hears it even when he eye-rolls.'
    ],
    faqs: [
      {
        question: 'What do parents write in a son\'s birthday card?',
        answer: '"Happy Birthday, beta! Watching you grow into a kind, brave young man is our greatest joy. Chase your dreams fearlessly — we will always be your loudest cheerleaders."'
      }
    ],
    wishes: [
      {
        id: 'so-1',
        text: "Happy Birthday, champ! From toy cars to big dreams, you have always raced ahead. Keep that spark — the world needs your kind of brave!",
        tags: ['Proud', 'Encouraging']
      },
      {
        id: 'so-2',
        text: "To our son — you make parenting look easy and pride feel endless. May this year bring you adventures worthy of your courage. We love you!",
        tags: ['Loving', 'Parental']
      },
      {
        id: 'so-3',
        text: "Happy Birthday, beta! Remember: grades fade, character stays. You already have the important part — a good heart. Now go eat cake!",
        tags: ['Wise', 'Warm']
      },
      {
        id: 'so-4',
        text: "Our little boy who became a fine young man — time flew, but our love only grew. Wishing you a birthday as awesome as your gaming skills!",
        tags: ['Nostalgic', 'Modern']
      },
      {
        id: 'so-5',
        text: "Son, may you always be brave enough to dream big and kind enough to lift others. Happy Birthday — mom and dad are your forever team!",
        tags: ['Inspirational', 'Blessing']
      },
      {
        id: 'so-6',
        text: "Another year taller, smarter, and (slightly) wiser! Happy Birthday to our superstar — the WiFi password is your birthday gift. Use it well!",
        tags: ['Funny', 'Playful']
      }
    ]
  },
  {
    slug: 'daughter',
    title: 'Adorable Birthday Wishes for Daughter',
    navTitle: 'Daughter',
    shortDescription: 'Loving birthday wishes for your little princess or grown-up girl — straight from proud parents.',
    metaTitle: 'Adorable Birthday Wishes for Daughter (2026) | BirthdayGen',
    metaDescription: 'Shower her with love: birthday wishes for daughters from mom and dad. Add her photos and send a magical interactive card!',
    intro: 'She wrapped you around her finger on day one and never let go. These birthday wishes for daughters capture that fierce parental love — for pigtails today, graduation caps tomorrow, and the incredible woman always.',
    tips: [
      'Tell her she is capable, not just pretty — that sentence shapes futures.',
      'Recall a moment she made YOU proud; daughters keep those forever.',
      'First-day-of-school vs today photo pairs never miss in the gallery.',
      'Promise your unwavering backup — the safest gift a parent gives.'
    ],
    faqs: [
      {
        question: 'What is a beautiful birthday wish for a daughter?',
        answer: '"Happy Birthday, princess! You are braver than you believe and more loved than you know. Dream without limits, shine without permission — we will always be behind you."'
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
        text: "To our daughter — smart, strong, and stunning inside-out. The world is better with you in it. Keep conquering, birthday girl!",
        tags: ['Empowering', 'Proud']
      },
      {
        id: 'dg-3',
        text: "Happy Birthday, gudiya! From pigtails to power moves, watching you grow is our life's highlight reel. Cake today, world domination tomorrow!",
        tags: ['Nostalgic', 'Fun']
      },
      {
        id: 'dg-4',
        text: "Beta, never shrink yourself to fit small rooms — you were born for big stages. Wishing you a fearless, fabulous birthday!",
        tags: ['Inspirational', 'Bold']
      },
      {
        id: 'dg-5',
        text: "You are our sunshine on cloudy days and our pride every day. Happy Birthday, sweetheart — mom and dad love you to the moon and back!",
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
    intro: 'Her hands tell stories, her kitchen heals everything, and her blessings power the whole family. These birthday wishes for grandmothers honour the matriarch — best read aloud on a video call with the whole parivaar.',
    tips: [
      'Mention her food, her stories, or her blessings — the holy trinity of grandma love.',
      'Get every grandchild to add one line; a group-signed card overwhelms her happily.',
      'Old black-and-white family photos in the gallery are pure treasure.',
      'Wish her health and comfort specifically — at her age, that is love language.'
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
        text: "To our dearest Nani — storyteller, chef, blessing-machine! May your birthday be as sweet as your kheer and as warm as your hugs.",
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
        text: "Four generations blessed because of you — what a legacy! Happy Birthday, Grandma. Thank you for being our roots and our wings.",
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
    shortDescription: 'Honouring birthday messages for grandpa — his wisdom, wit, and wonderful stories.',
    metaTitle: 'Respectful Birthday Wishes for Grandpa (2026) | BirthdayGen',
    metaDescription: 'Salute him with birthday wishes for grandpa — wise, warm, and witty. Add throwback photos in a family-signed interactive card!',
    intro: 'He has seen eras change and still beats everyone at cards. These birthday wishes for grandfathers salute the patriarch — his discipline that built the family and his mischief that keeps it laughing.',
    tips: [
      'Ask him for one story and quote it back — being heard is his favourite gift.',
      'Honour his struggles and achievements; grandpas light up at earned respect.',
      'Vintage photos of young grandpa stun the whole family in the gallery.',
      'Wish him strength and health — and mean it with a call, not just a card.'
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
        text: "Happy Birthday, Dadaji! Strong as a banyan, cool as ever — thank you for roots to ground us and stories to grow on. Stay healthy and legendary!",
        tags: ['Respectful', 'Strong']
      },
      {
        id: 'gp-2',
        text: "To our Nanaji — scholar, storyteller, champion of evening walks! May this year gift you morning sunshine, good health, and obedient grandchildren (we'll try).",
        tags: ['Warm', 'Witty']
      },
      {
        id: 'gp-3',
        text: "Grandpa, your life is our family's greatest novel. Wishing you a birthday chapter full of love, laughter, and your favourite sweets — doctor permitting!",
        tags: ['Playful', 'Honouring']
      },
      {
        id: 'gp-4',
        text: "Happy Birthday to the man who taught us honesty, hard work, and the perfect chai ratio. Your values are your true inheritance to us.",
        tags: ['Values', 'Grateful']
      },
      {
        id: 'gp-5',
        text: "Decades of wisdom, zero dull moments! Happy Birthday, Grandpa — may your health match your spirit, which is 25 forever.",
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
    shortDescription: 'Polished, friendly birthday messages for colleagues — warm without crossing lines.',
    metaTitle: 'Birthday Wishes for Colleague & Coworker (2026) | BirthdayGen',
    metaDescription: 'Perfect birthday wishes for colleagues — professional yet warm. Surprise your coworker with a fun team-signed interactive card!',
    intro: 'You spend more waking hours with colleagues than family — their birthday deserves better than a break-room mumur. These coworker birthday wishes are perfectly calibrated: friendly, inclusive, promotion-safe.',
    tips: [
      'Keep it team-flavoured: mention their help, humour, or coffee runs.',
      'Avoid age jokes upward and romance jokes entirely — safe laughs only.',
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
        text: "Happy Birthday to our team's secret weapon! Your hard work inspires us all — today, let the team spoil YOU for a change.",
        tags: ['Appreciative', 'Team']
      },
      {
        id: 'co-4',
        text: "Another year of crushing targets and stealing snacks from the pantry! Happy Birthday — the promotion conversation can wait till tomorrow.",
        tags: ['Playful', 'Peer']
      },
      {
        id: 'co-5',
        text: "To a wonderful coworker and an even better human — wishing you health, happiness, and a well-deserved break. Enjoy your special day!",
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
    intro: 'Great teachers echo through entire lives. These birthday wishes for teachers and mentors express the gratitude students feel but rarely send — perfect for a class-signed surprise that will genuinely move them.',
    tips: [
      'Name the specific lesson or belief they gave you — teachers live for that.',
      'Keep the tone respectful; save the memes for friends.',
      'Class photos and reunion pictures make the gallery deeply meaningful.',
      'A group-signed card from the whole batch multiplies the emotion.'
    ],
    faqs: [
      {
        question: 'How do you wish a teacher happy birthday respectfully?',
        answer: '"Happy Birthday, Sir/Ma\'am! Your guidance shaped not just my grades but my character. Thank you for believing in me — wishing you health and happiness always."'
      }
    ],
    wishes: [
      {
        id: 'te-1',
        text: "Happy Birthday, Sir/Ma'am! You didn't just teach subjects — you taught us how to think and dream. Forever grateful to be your student!",
        tags: ['Respectful', 'Grateful']
      },
      {
        id: 'te-2',
        text: "To the mentor who saw potential in me before I did — thank you for every push, every patience, every second chance. Have a wonderful birthday!",
        tags: ['Mentor', 'Thankful']
      },
      {
        id: 'te-3',
        text: "Happy Birthday to my favourite teacher! Your classes were the reason school felt like an adventure. Wishing you joy as lasting as your lessons!",
        tags: ['Warm', 'Nostalgic']
      },
      {
        id: 'te-4',
        text: "Great teachers plant trees they'll never sit under — yet here we are, shading you with love on your birthday! Enjoy your special day, Guru ji!",
        tags: ['Poetic', 'Cultural']
      },
      {
        id: 'te-5',
        text: "Wishing a very happy birthday to the strictest-checker, kindest-heart combo in education! Your students are your legacy — and it's a brilliant one.",
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
    metaDescription: 'Missed the day? These belated birthday wishes save the day with humour and heart. Send a surprise interactive card — fashionably late!',
    intro: 'Missed the birthday? Relax — a late wish with extra effort beats an on-time "HBD" text every time. These belated birthday messages blend honest apology with humour, and a surprise BirthdayGen card proves you cared enough to overcompensate.',
    tips: [
      'Own it briefly, then pivot to celebration — grovelling paragraphs help nobody.',
      'Humour is your rescue rope: blame the calendar, the traffic, the naps.',
      'Make the surprise BIGGER than usual — photos, candles, the works.',
      'Send it now, not "soon". Late + prompt beats late + later.'
    ],
    faqs: [
      {
        question: 'How do you say happy birthday late without sounding careless?',
        answer: '"Belated Happy Birthday! Good things come to those who wait — and great friends deserve extended celebrations. Consider this the deluxe edition of your birthday wish!"'
      },
      {
        question: 'Is it okay to send a birthday wish a week late?',
        answer: 'Absolutely — especially with effort attached. A personalised interactive card a week late delights far more than a timely one-word text.'
      }
    ],
    wishes: [
      {
        id: 'be-1',
        text: "Belated Happy Birthday! I missed the date but never the feeling — you deserve celebrating all week anyway. Consider this the grand finale!",
        tags: ['Apologetic', 'Sweet']
      },
      {
        id: 'be-2',
        text: "Happy Belated Birthday! My calendar betrayed me, but my love for you is right on schedule. Hope your day was as amazing as you are!",
        tags: ['Funny', 'Excuse']
      },
      {
        id: 'be-3',
        text: "They say the best gifts arrive late — exhibiting patience AND fashion. Belated birthday cheers to my favourite procrastination-compatible friend!",
        tags: ['Witty', 'Playful']
      },
      {
        id: 'be-4',
        text: "A little late, a lot sincere: wishing you a year of health, laughter, and dreams coming true. Sorry I missed the candles — I brought extra cake (virtually)!",
        tags: ['Sincere', 'Warm']
      },
      {
        id: 'be-5',
        text: "Breaking news: birthday extended due to popular demand (mine). Happy Belated Birthday — the celebration continues with this surprise!",
        tags: ['Creative', 'Dramatic']
      },
      {
        id: 'be-6',
        text: "Forgive the delay — great wishes take time to age, like fine wine and like you! Happiest belated birthday, superstar!",
        tags: ['Charming', 'Roast-lite']
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
