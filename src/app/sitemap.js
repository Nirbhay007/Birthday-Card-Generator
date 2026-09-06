import { WISH_CATEGORIES } from '@/lib/wishesData';
import { AGE_PAGES } from '@/lib/ageWishesData';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

  // Core static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/wishes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ages`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Programmatic SEO category routes
  const wishesCategoryRoutes = WISH_CATEGORIES.map((category) => ({
    url: `${baseUrl}/wishes/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Milestone-age programmatic routes
  const ageRoutes = AGE_PAGES.map((a) => ({
    url: `${baseUrl}/ages/${a.age}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));


  // NOTE: personal /b/[id] greeting pages are intentionally excluded —
  // they are noindex UGC. Indexing hundreds of thin name-pages would
  // dilute crawl budget and site quality. Only ranking hubs are listed.
  return [...routes, ...wishesCategoryRoutes, ...ageRoutes];
}
