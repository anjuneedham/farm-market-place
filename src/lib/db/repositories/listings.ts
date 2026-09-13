import { data, mutate } from '../datasource';
import type {
  Listing,
  ListingView,
  Paginated,
  PageParams,
  PriceTier,
} from '@/lib/types';
import { catalog } from './catalog';
import { isFuture, matches, newId, nowIso, paginate, uniqueSlug } from './common';
import { locations } from './locations';
import { premium } from './premium';
import { profiles, toPublicUser, users } from './users';

export type ListingFilters = {
  countryCode?: string;
  regionId?: string;
  communityId?: string;
  categoryId?: string;
  productId?: string;
  sellerId?: string;
  search?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  availability?: Listing['availability'];
  wholesaleOnly?: boolean;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  status?: Listing['status'];
  sort?: 'recent' | 'price_asc' | 'price_desc' | 'rating';
} & PageParams;

function tiersFor(listingId: string): PriceTier[] {
  return data()
    .priceTiers.filter((t) => t.listingId === listingId)
    .sort((a, b) => a.minQuantity - b.minQuantity);
}

/** Joins a listing with everything a card or detail page needs in one pass. */
export function toListingView(listing: Listing): ListingView | undefined {
  const seller = users.byId(listing.sellerId);
  const category = catalog.byId(listing.categoryId);
  const region = locations.region(listing.regionId);
  const country = locations.country(listing.countryCode);
  if (!seller || !category || !region || !country) return undefined;

  const farm = profiles.farmByUserId(seller.id);
  const business = farm ? undefined : profiles.businessByUserId(seller.id);

  return {
    ...listing,
    seller: toPublicUser(seller),
    sellerKind: farm ? 'FARM' : business ? 'BUSINESS' : 'OTHER',
    sellerName: farm?.name ?? business?.name ?? seller.name,
    sellerSlug: farm?.slug ?? business?.slug,
    sellerVerified: farm?.isVerified ?? business?.isVerified ?? false,
    sellerRating: farm?.ratingAverage ?? business?.ratingAverage ?? 0,
    sellerRatingCount: farm?.ratingCount ?? business?.ratingCount ?? 0,
    sellerIsPremium: premium.isPremium(seller.id),
    category,
    parentCategory: catalog.parentOf(category),
    region,
    community: listing.communityId ? locations.community(listing.communityId) : undefined,
    country,
    priceTiers: tiersFor(listing.id),
    isFeatured: isFuture(listing.featuredUntil),
  };
}

function searchMatches(listing: Listing, term: string): boolean {
  if (matches(listing.title, term) || matches(listing.description, term)) return true;

  const product = listing.productId ? catalog.productById(listing.productId) : undefined;
  if (product) {
    if (matches(product.name, term)) return true;
    if (product.synonyms.some((synonym) => matches(synonym, term))) return true;
  }

  const region = locations.region(listing.regionId);
  if (region && matches(region.name, term)) return true;

  const community = listing.communityId ? locations.community(listing.communityId) : undefined;
  if (community && matches(community.name, term)) return true;

  return false;
}

export const listings = {
  byId(id: string): Listing | undefined {
    return data().listings.find((l) => l.id === id);
  },

  bySlug(slug: string): Listing | undefined {
    return data().listings.find((l) => l.slug === slug);
  },

  viewById(id: string): ListingView | undefined {
    const listing = this.byId(id);
    return listing ? toListingView(listing) : undefined;
  },

  viewBySlug(slug: string): ListingView | undefined {
    const listing = this.bySlug(slug);
    return listing ? toListingView(listing) : undefined;
  },

  /**
   * The core marketplace query. Every search token is matched against the
   * listing, its catalogue product and its synonyms, and its geography — so
   * "goat Manchester" and "wholesale pepper" both work.
   */
  search(filters: ListingFilters = {}): Paginated<ListingView> {
    const status = filters.status ?? 'ACTIVE';
    let items = data().listings.filter((l) => l.status === status);

    if (filters.countryCode) items = items.filter((l) => l.countryCode === filters.countryCode);
    if (filters.regionId) items = items.filter((l) => l.regionId === filters.regionId);
    if (filters.communityId) items = items.filter((l) => l.communityId === filters.communityId);
    if (filters.sellerId) items = items.filter((l) => l.sellerId === filters.sellerId);
    if (filters.productId) items = items.filter((l) => l.productId === filters.productId);
    if (filters.availability) items = items.filter((l) => l.availability === filters.availability);
    if (filters.wholesaleOnly) items = items.filter((l) => l.wholesaleAvailable);
    if (filters.featuredOnly) items = items.filter((l) => isFuture(l.featuredUntil));

    if (filters.categoryId) {
      const ids = new Set(catalog.withDescendantIds(filters.categoryId));
      items = items.filter((l) => ids.has(l.categoryId));
    }

    if (filters.minPriceMinor !== undefined) {
      const min = filters.minPriceMinor;
      items = items.filter((l) => l.priceMinor !== undefined && l.priceMinor >= min);
    }
    if (filters.maxPriceMinor !== undefined) {
      const max = filters.maxPriceMinor;
      items = items.filter((l) => l.priceMinor !== undefined && l.priceMinor <= max);
    }

    if (filters.search?.trim()) {
      // Each whitespace-separated token must match somewhere, so adding a
      // parish or "wholesale" to a query narrows rather than widens it.
      const tokens = filters.search.trim().split(/\s+/).filter(Boolean);
      items = items.filter((listing) => tokens.every((token) => searchMatches(listing, token)));
    }

    let views = items
      .map(toListingView)
      .filter((view): view is ListingView => view !== undefined);

    if (filters.verifiedOnly) views = views.filter((v) => v.sellerVerified);

    const sort = filters.sort ?? 'recent';
    views.sort((a, b) => {
      // Featured listings are additional placement above an unmodified organic
      // list — they are always labelled. See docs/PREMIUM_STRATEGY.md §7.
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      switch (sort) {
        case 'price_asc':
          return (a.priceMinor ?? Number.MAX_SAFE_INTEGER) - (b.priceMinor ?? Number.MAX_SAFE_INTEGER);
        case 'price_desc':
          return (b.priceMinor ?? -1) - (a.priceMinor ?? -1);
        case 'rating':
          return b.sellerRating - a.sellerRating;
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return paginate(views, filters);
  },

  featured(countryCode: string, limit = 8): ListingView[] {
    return this.search({ countryCode, featuredOnly: true, perPage: limit }).items;
  },

  recent(countryCode: string, limit = 8): ListingView[] {
    return this.search({ countryCode, perPage: limit }).items;
  },

  forSeller(sellerId: string, params: PageParams = {}): Paginated<Listing> {
    const items = data()
      .listings.filter((l) => l.sellerId === sellerId && l.status !== 'ARCHIVED')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return paginate(items, params);
  },

  countForSeller(sellerId: string, status?: Listing['status']): number {
    return data().listings.filter(
      (l) => l.sellerId === sellerId && (status ? l.status === status : l.status !== 'ARCHIVED'),
    ).length;
  },

  create(
    input: Omit<Listing, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'viewCount' | 'isDemoData'>,
    tiers: Array<Omit<PriceTier, 'id' | 'listingId'>> = [],
  ): Listing {
    return mutate((db) => {
      const listing: Listing = {
        ...input,
        id: newId('listing'),
        slug: uniqueSlug(
          input.title,
          db.listings.map((l) => l.slug),
        ),
        viewCount: 0,
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.listings.push(listing);

      tiers.forEach((tier, index) => {
        db.priceTiers.push({ ...tier, id: `${listing.id}_tier_${index}`, listingId: listing.id });
      });

      return listing;
    });
  },

  update(id: string, patch: Partial<Listing>): Listing | undefined {
    return mutate((db) => {
      const listing = db.listings.find((l) => l.id === id);
      if (!listing) return undefined;
      Object.assign(listing, patch, { updatedAt: nowIso() });
      return listing;
    });
  },

  replaceTiers(listingId: string, tiers: Array<Omit<PriceTier, 'id' | 'listingId'>>): void {
    mutate((db) => {
      db.priceTiers = db.priceTiers.filter((t) => t.listingId !== listingId);
      tiers.forEach((tier, index) => {
        db.priceTiers.push({ ...tier, id: `${listingId}_tier_${index}`, listingId });
      });
    });
  },

  recordView(id: string): void {
    mutate((db) => {
      const listing = db.listings.find((l) => l.id === id);
      if (listing) listing.viewCount += 1;
    });
  },

  totalActive(countryCode?: string): number {
    return data().listings.filter(
      (l) => l.status === 'ACTIVE' && (!countryCode || l.countryCode === countryCode),
    ).length;
  },
};
