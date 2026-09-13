import { randomBytes } from 'node:crypto';
import type { Paginated, PageParams } from '@/lib/types';

export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 60;

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomBytes(6).toString('hex')}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

/** Appends a numeric suffix until the slug is unique within `taken`. */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const existing = new Set(taken);
  const root = slugify(base) || 'item';
  if (!existing.has(root)) return root;

  let counter = 2;
  while (existing.has(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
}

/**
 * Every list read in AgriLoop is paginated. No repository method returns an
 * unbounded collection (docs/API_ARCHITECTURE.md §5).
 */
export function paginate<T>(items: T[], params: PageParams = {}): Paginated<T> {
  const perPage = Math.min(Math.max(1, params.perPage ?? DEFAULT_PER_PAGE), MAX_PER_PAGE);
  const page = Math.max(1, params.page ?? 1);
  const start = (page - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  return {
    items: slice,
    page,
    perPage,
    total: items.length,
    hasMore: start + slice.length < items.length,
  };
}

export function byNewest<T extends { createdAt: string }>(a: T, b: T): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/** Case- and accent-insensitive containment, used by search. */
export function matches(haystack: string, needle: string): boolean {
  return normalise(haystack).includes(normalise(needle));
}

export function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function isFuture(iso?: string): boolean {
  return Boolean(iso && Date.parse(iso) > Date.now());
}
