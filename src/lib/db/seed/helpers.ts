/**
 * Seed helpers.
 *
 * All seeded records carry `isDemoData: true` so demo content can always be
 * identified, badged in the UI and purged. Nothing seeded here is presented as
 * a real business, a real market price or a genuinely verified user.
 */

import { createHash } from 'node:crypto';

const DAY_MS = 24 * 60 * 60 * 1000;

// Fixed, arbitrary namespace for AgriLoop's demo-account UUIDs (RFC 4122
// UUIDv5) — must never change, or every demo user/farm/business/buyer id
// shifts and stops matching the rows already seeded into Supabase.
const DEMO_USER_NAMESPACE = '6f2c9b0a-5b1e-4b8a-9c2e-2f7d6a1b3c4d';

/**
 * Deterministic UUID derived from a demo user's old plain-string id (e.g.
 * "user_farmer_green-valley-farm"), so demo people can live as real
 * Supabase Auth users (whose id column is uuid) while every other seed file
 * that references them by that same string keeps resolving to the same
 * identity — no shared lookup table needed, just wrap the existing id
 * string in this function everywhere it's constructed.
 */
export function demoUserId(rawId: string): string {
  const namespaceBytes = Buffer.from(DEMO_USER_NAMESPACE.replace(/-/g, ''), 'hex');
  const nameBytes = Buffer.from(rawId, 'utf8');
  const hash = createHash('sha1').update(Buffer.concat([namespaceBytes, nameBytes])).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // RFC 4122 variant
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
