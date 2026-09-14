import type { Region } from '@/lib/types';

export type ParsedMarketQuery = {
  /** What is left of the query after structured terms are extracted — the actual product search. */
  search: string;
  wholesaleOnly?: boolean;
  verifiedOnly?: boolean;
  regionId?: string;
};

const WHOLESALE_WORDS = ['wholesale', 'bulk'];
const VERIFIED_WORDS = ['verified'];

/**
 * Turns a free-text query like "wholesale pepper Manchester" into structured
 * filters — wholesaleOnly, a region, and the remaining product search term —
 * using the same token-matching search underneath. This is deliberately a
 * small keyword/parish extractor, not a new search engine: it only pulls out
 * terms the existing filters already understand (docs/PRODUCT_ARCHITECTURE.md
 * §6). A query with no recognisable structure just passes through unchanged.
 */
export function parseMarketQuery(raw: string, regions: Region[]): ParsedMarketQuery {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { search: '' };

  const remaining: string[] = [];
  let wholesaleOnly: boolean | undefined;
  let verifiedOnly: boolean | undefined;
  let regionId: string | undefined;

  // Longest region name first, so "St. Elizabeth" matches before "St." alone would.
  const sortedRegions = [...regions].sort((a, b) => b.name.length - a.name.length);

  let i = 0;
  outer: while (i < tokens.length) {
    const lower = tokens[i]!.toLowerCase();

    if (WHOLESALE_WORDS.includes(lower)) {
      wholesaleOnly = true;
      i += 1;
      continue;
    }
    if (VERIFIED_WORDS.includes(lower)) {
      verifiedOnly = true;
      i += 1;
      continue;
    }

    for (const region of sortedRegions) {
      const nameTokens = region.name.toLowerCase().replace(/\./g, '').split(/\s+/);
      const slice = tokens
        .slice(i, i + nameTokens.length)
        .map((t) => t.toLowerCase().replace(/\./g, ''));
      if (slice.length === nameTokens.length && slice.every((t, idx) => t === nameTokens[idx])) {
        regionId = region.id;
        i += nameTokens.length;
        continue outer;
      }
    }

    remaining.push(tokens[i]!);
    i += 1;
  }

  return { search: remaining.join(' '), wholesaleOnly, verifiedOnly, regionId };
}
