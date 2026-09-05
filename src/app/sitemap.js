import prisma from '@/lib/prisma';
import { WISH_CATEGORIES } from '@/lib/wishesData';

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
  ];

  // Programmatic SEO category routes
  const wishesCategoryRoutes = WISH_CATEGORIES.map((category) => ({
    url: `${baseUrl}/wishes/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));


  // Fetch recent public birthday pages for sitemap indexability
  try {
    const recentPages = await prisma.birthdayPage.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true },
    });

    const dynamicRoutes = recentPages.map((page) => ({
      url: `${baseUrl}/b/${page.id}`,
      lastModified: page.createdAt ? new Date(page.createdAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...routes, ...wishesCategoryRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...routes, ...wishesCategoryRoutes];
  }
}
