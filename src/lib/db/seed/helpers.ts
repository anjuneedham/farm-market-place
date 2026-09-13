/**
 * Seed helpers.
 *
 * All seeded records carry `isDemoData: true` so demo content can always be
 * identified, badged in the UI and purged. Nothing seeded here is presented as
 * a real business, a real market price or a genuinely verified user.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Timestamps are generated relative to now so demo content never looks stale. */
export function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * DAY_MS - hours * 60 * 60 * 1000).toISOString();
}

export function daysAhead(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function regionId(parishSlug: string): string {
  return `region_jm_${parishSlug}`;
}

export function communityId(parishSlug: string, community: string): string {
  return `community_jm_${parishSlug}_${slugify(community)}`;
}
