import type { MetadataRoute } from 'next';
import { db } from '@/lib/db/repositories';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/**
 * Static and category-level routes. Individual listings, farms and posts
 * number in the thousands at scale and are deliberately left to search
 * engines to discover via internal links rather than enumerated here —
 * revisit with a paginated sitemap index once volume justifies it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/market`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/farmers`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/businesses`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/requests`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/community`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/academy`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/premium`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/signup`, lastModified: now, priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = db.catalog
    .categories()
    .filter((c) => c.level === 0)
    .map((category) => ({
      url: `${SITE_URL}/market?category=${category.slug}`,
      lastModified: now,
      priority: 0.6,
    }));

  const communityRoutes: MetadataRoute.Sitemap = db.community.categories().map((category) => ({
    url: `${SITE_URL}/community/${category.slug}`,
    lastModified: now,
    priority: 0.5,
  }));

  const academyRoutes: MetadataRoute.Sitemap = db.academy
    .courses()
    .map((course) => ({
      url: `${SITE_URL}/academy/${course.slug}`,
      lastModified: now,
      priority: 0.6,
    }));

  return [...staticRoutes, ...categoryRoutes, ...communityRoutes, ...academyRoutes];
}
