/**
 * Helper utilities for generating Schema.org JSON-LD structured data
 * for search engines and AI engines (Google, Gemini, Perplexity, Bing).
 */

export function getWebSiteSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BirthdayGen',
    url: siteUrl,
    description: 'Create free personalized interactive birthday pages with custom messages, photo galleries, ambient music, and virtual candle blowing.',
    publisher: {
      '@type': 'Organization',
      name: 'BirthdayGen Team',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
  };
}

export function getOrganizationSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BirthdayGen',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    sameAs: [],
    knowsAbout: [
      'Digital Birthday Cards',
      'Interactive Web Experiences',
      'Personalized Greetings',
      'Virtual Birthday Celebrations',
    ],
  };
}

export function getSoftwareApplicationSchema(siteUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'BirthdayGen - Personalized Birthday Card Generator',
    operatingSystem: 'Any (Web Browser)',
    applicationCategory: 'MultimediaApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    featureList: [
      'Interactive Virtual Candle Blowing',
      'Gift-box surprise reveal experience',
      'Personalized Photo Gallery',
      'Music choice: classic song, music box, party pop',
      'Relationship personalization (Mom, Best Friend, Partner...)',
      'Multiple Visual Themes (Elegant, Fun, Royal Gold, Midnight Stars, Princess, Unicorn, Retro Neon, Minimal)',
      'Instant Shareable Link Generation',
      'WhatsApp-ready sharing with personalized preview',
    ],
    description: 'An interactive web tool to design and send personalized digital birthday greeting microsites in seconds.',
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
    name: 'How to Create a Personalized Birthday Page with BirthdayGen',
    description: 'Step-by-step guide to generating a custom interactive birthday microsite with photos, personal message, music, and virtual candle blowing.',
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
    publisher: {
      '@type': 'Organization',
      name: 'BirthdayGen',
      url: siteUrl,
    },
  };
}

