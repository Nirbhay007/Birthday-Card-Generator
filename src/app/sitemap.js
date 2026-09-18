import { WISH_CATEGORIES } from '@/lib/wishesData';
import { AGE_PAGES } from '@/lib/ageWishesData';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

// Static dates — avoids telling Google every page is "always modified",
// which wastes crawl budget and can suppress rankings.
// Update these manually when you make meaningful content changes.
const LAST_MODIFIED_CORE = new Date('2026-09-18');
const LAST_MODIFIED_CONTENT = new Date('2026-09-18');
const LAST_MODIFIED_PREMIUM = new Date('2026-09-10');

export default async function sitemap() {
  // Core static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: LAST_MODIFIED_CORE,
      changeFrequency: 'daily',
      priority: 1.0,
      images: [
        {
          url: `${baseUrl}/api/og?name=Friend&theme=fun`,
          title: 'BirthdayGen - Free Birthday Website Maker',
          caption: 'Create a free personalized birthday website with candles, photos and music',
        },
      ],
    },
    {
      url: `${baseUrl}/wishes`,
      lastModified: LAST_MODIFIED_CONTENT,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ages`,
      lastModified: LAST_MODIFIED_CONTENT,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // /anniversary page.js not yet created — add back once live
  ];

  // Programmatic SEO category routes
  const wishesCategoryRoutes = WISH_CATEGORIES.map((category) => ({
    url: `${baseUrl}/wishes/${category.slug}`,
    lastModified: LAST_MODIFIED_CONTENT,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Milestone-age programmatic routes
  const ageRoutes = AGE_PAGES.map((a) => ({
    url: `${baseUrl}/ages/${a.age}`,
    lastModified: LAST_MODIFIED_CONTENT,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // NOTE: personal /b/[id] greeting pages are intentionally excluded —
  // they are noindex UGC. Indexing hundreds of thin name-pages would
  // dilute crawl budget and site quality. Only ranking hubs are listed.

  // Premium landing
  const premiumRoutes = [
    {
      url: `${baseUrl}/premium`,
      lastModified: LAST_MODIFIED_PREMIUM,
      changeFrequency: 'weekly',
      priority: 0.85,
      images: [
        {
          url: `${baseUrl}/api/og?name=Premium&theme=royal`,
          title: 'BirthdayGen Premium - Cinematic Birthday Experiences',
          caption: 'Premium cinematic birthday universes starting at ₹49',
        },
      ],
    },
  ];

  return [...routes, ...wishesCategoryRoutes, ...ageRoutes, ...premiumRoutes];
}
