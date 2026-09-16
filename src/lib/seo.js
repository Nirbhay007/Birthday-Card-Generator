/**
 * Helper utilities for generating Schema.org JSON-LD structured data
 * for search engines and AI engines (Google, Gemini, Perplexity, Bing, ChatGPT, Claude).
 */

const SITE_DATE_PUBLISHED = '2024-01-01';
const SITE_DATE_MODIFIED = new Date().toISOString().split('T')[0];

export function getWebSiteSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BirthdayGen',
    alternateName: ['BirthdayGen - Free Birthday Website Maker', 'Birthday Generator', 'Birthday Card Generator'],
    url: siteUrl,
    description: 'Create a free personalized birthday website with custom messages, photo galleries, ambient music, and virtual candle blowing.',
    inLanguage: 'en-US',
    datePublished: SITE_DATE_PUBLISHED,
    dateModified: SITE_DATE_MODIFIED,
    publisher: {
      '@type': 'Organization',
      name: 'BirthdayGen',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/wishes/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getOrganizationSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BirthdayGen',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon.svg`,
      width: 512,
      height: 512,
    },
    foundingDate: '2024',
    description: 'BirthdayGen creates free interactive personalized birthday websites with virtual candle blowing, photo galleries, music, and instant WhatsApp sharing.',
    sameAs: [
      'https://x.com/nirbhay007singh',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: 'English',
      url: siteUrl,
    },
    knowsAbout: [
      'Birthday Websites',
      'Digital Birthday Cards',
      'Interactive Web Experiences',
      'Personalized Greetings',
      'Virtual Birthday Celebrations',
      'Virtual Candle Blowing Technology',
      'WhatsApp Birthday Sharing',
      'Free Online Card Maker',
    ],
  };
}

export function getSoftwareApplicationSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BirthdayGen - Free Birthday Website Maker',
    operatingSystem: 'Any (Web Browser, iOS, Android, macOS, Windows)',
    applicationCategory: 'MultimediaApplication',
    applicationSubCategory: 'Interactive Greeting Card Generator',
    datePublished: SITE_DATE_PUBLISHED,
    dateModified: SITE_DATE_MODIFIED,
    url: siteUrl,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Free to create and share personalized birthday websites. Premium cinematic experiences start at ₹49.',
    },
    featureList: [
      'Interactive Virtual Candle Blowing via Microphone',
      'Gift-box surprise reveal experience',
      'Personalized Photo Gallery Slideshow',
      'Ambient Music Selection (Classic, Music Box, Party Pop)',
      'Relationship Personalization (Mom, Best Friend, Partner, Kids)',
      '8 Free Visual Themes (Royal Gold, Midnight Stars, Princess, Unicorn, Retro Neon, Minimal)',
      'Instant Shareable Link Generation',
      'WhatsApp-ready sharing with rich personalized social card preview',
      'No account or signup required',
      'Pages active for 30 days with free renewal',
    ],
    description: 'An interactive web tool to design and send a personalized birthday website with greeting cards, photos, music and candle blowing, in seconds. 100% free, no signup needed.',
    screenshot: `${siteUrl}/api/og?name=Friend&theme=fun`,
    inLanguage: 'en-US',
  };
}

export function getWebApplicationSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BirthdayGen',
    url: siteUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.',
    description: 'Free browser-based birthday website maker. Create an interactive birthday page with photos, candle blowing, music and custom messages — shareable on WhatsApp instantly.',
    datePublished: SITE_DATE_PUBLISHED,
    dateModified: SITE_DATE_MODIFIED,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: 'BirthdayGen',
      url: siteUrl,
    },
  };
}

export function getProductSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'BirthdayGen Premium — Cinematic Birthday Universe',
    description: 'Multi-act cinematic birthday and anniversary experience with sealed letters, photo acts, and immersive storytelling. Starting at ₹49.',
    url: `${siteUrl}/premium`,
    brand: {
      '@type': 'Brand',
      name: 'BirthdayGen',
    },
    image: `${siteUrl}/api/og?name=Premium&theme=royal`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: '49',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/premium`,
    },
    category: 'Digital Greeting & Celebration',
  };
}

export function getFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getHowToSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create a Personalized Birthday Website with BirthdayGen',
    description: 'Step-by-step guide to generating a custom interactive birthday website with photos, personal message, music, and virtual candle blowing.',
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Enter Recipient Details',
        text: 'Type the recipient name, birthday date, and a heartfelt personal message.',
        url: `${siteUrl}/#create`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Customize Theme & Media',
        text: 'Select from Elegant, Fun, Royal Gold, Midnight Stars, Princess, Unicorn, Retro Neon, or Minimal themes, and upload special photos.',
        url: `${siteUrl}/#create`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Generate & Share',
        text: 'Click Generate Birthday Page and share the unique link via WhatsApp, email, or social media.',
        url: `${siteUrl}/#create`,
      },
    ],
  };
}

export function getBreadcrumbSchema(siteUrl, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

export function getGreetingCardSchema(siteUrl, pageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    additionalType: 'https://schema.org/VisualArtwork',
    name: `Happy Birthday ${pageData.recipientName}!`,
    description: pageData.message || `A personalized digital birthday greeting page for ${pageData.recipientName}.`,
    url: `${siteUrl}/b/${pageData.id}`,
    dateCreated: pageData.createdAt ? new Date(pageData.createdAt).toISOString() : new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'BirthdayGen',
      url: siteUrl,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/ViewAction',
      userInteractionCount: pageData.viewCount > 0 ? pageData.viewCount : 1,
    },
  };
}

export function getItemListSchema(siteUrl, name, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.text ? item.text.slice(0, 80) : item.name,
      description: item.text || item.description,
    })),
  };
}

export function getCollectionSchema(siteUrl, category) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.metaTitle || category.title,
    description: category.metaDescription || category.shortDescription,
    url: category.canonicalUrl || `${siteUrl}/wishes/${category.slug}`,
    dateModified: SITE_DATE_MODIFIED,
    publisher: {
      '@type': 'Organization',
      name: 'BirthdayGen',
      url: siteUrl,
    },
  };
}

/**
 * VideoObject schema for the app demo video.
 * Set NEXT_PUBLIC_DEMO_VIDEO_URL env var to the publicly hosted video URL
 * (e.g. a YouTube link or Vercel Blob URL after uploading birthday.mov).
 */
export function getVideoObjectSchema(siteUrl) {
  const videoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;
  if (!videoUrl) return null;

  // Extract YouTube ID if it's a YouTube link
  const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/i);
  const ytId = ytMatch ? ytMatch[1] : null;

  const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : videoUrl;
  const contentUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : videoUrl;
  const thumbnails = ytId
    ? [
        `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        `${siteUrl}/api/og?name=Friend&theme=fun`,
      ]
    : [`${siteUrl}/api/og?name=Friend&theme=fun`];

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'BirthdayGen Demo — Create a Free Personalized Birthday Website',
    description:
      'Watch how BirthdayGen lets you build an interactive birthday website in under 30 seconds — gift reveal, mic-powered candle blowing, photo gallery, custom music and instant WhatsApp sharing.',
    thumbnailUrl: thumbnails,
    contentUrl,
    embedUrl,
    uploadDate: '2024-09-01T00:00:00+05:30',
    duration: 'PT1M',
    publisher: {
      '@type': 'Organization',
      name: 'BirthdayGen',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
    inLanguage: 'en-US',
  };
}

