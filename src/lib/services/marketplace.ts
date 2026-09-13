import { can } from '@/lib/auth/permissions';
import { db } from '@/lib/db/repositories';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import { checkRateLimit } from '@/lib/security/rate-limit';
import type { Listing, ListingView, Paginated, User } from '@/lib/types';
import type { z } from 'zod';
import type { listingSchema, priceTierSchema } from '@/lib/validation';

type ListingInput = z.infer<typeof listingSchema>;
type TierInput = z.infer<typeof priceTierSchema>;

export const marketplaceService = {
  search: db.listings.search.bind(db.listings),

  bySlug(slug: string): ListingView | undefined {
    return db.listings.viewBySlug(slug);
  },

  /**
   * Records a view for analytics and the farmer dashboard. Sellers viewing
   * their own listing do not inflate their numbers.
   */
  recordView(listing: Listing, viewerId?: string): void {
    if (viewerId && viewerId === listing.sellerId) return;
    db.listings.recordView(listing.id);
    db.analytics.record({
      type: 'listing_view',
      entityType: 'listing',
      entityId: listing.id,
      countryCode: listing.countryCode,
      userId: viewerId,
    });
  },

  relatedTo(listing: ListingView, limit = 4): ListingView[] {
    return db.listings
      .search({
        countryCode: listing.countryCode,
        categoryId: listing.categoryId,
        perPage: limit + 1,
      })
      .items.filter((item) => item.id !== listing.id)
      .slice(0, limit);
  },

  fromSameSeller(listing: ListingView, limit = 4): ListingView[] {
    return db.listings
      .search({ sellerId: listing.sellerId, perPage: limit + 1 })
      .items.filter((item) => item.id !== listing.id)
      .slice(0, limit);
  },

  async create(
    user: User,
    input: ListingInput,
    tiers: TierInput[] = [],
  ): Promise<ServiceResult<Listing>> {
    if (!can(user, 'listing:create')) {
      return fail('forbidden', 'Only farmers and agricultural businesses can publish listings.');
    }

    const limit = checkRateLimit('createListing', user.id);
    if (!limit.allowed) {
      return fail('rate_limited', 'You have published a lot of listings recently. Try again later.');
    }

    const profile =
      db.profiles.farmByUserId(user.id) ?? db.profiles.businessByUserId(user.id);
    if (!profile) {
      return fail('validation', 'Set up your farm or business profile before publishing a listing.');
    }

    const country = db.locations.country(profile.countryCode);
    if (!country) return fail('validation', 'Your profile is missing a country.');

    if (!db.locations.regionBelongsToCountry(input.regionId, country.code)) {
      return fail('validation', `Choose a ${country.regionLabel.toLowerCase()} in ${country.name}.`, {
        regionId: 'Choose a valid location.',
      });
    }

    const category = db.catalog.byId(input.categoryId);
    if (!category) return fail('validation', 'Choose a category.', { categoryId: 'Choose a category.' });

    const communityId =
      input.communityId && db.locations.communityBelongsToRegion(input.communityId, input.regionId)
        ? input.communityId
        : undefined;

    const listing = db.listings.create(
      {
        sellerId: user.id,
        productId: input.productId || undefined,
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        imageUrls: input.imageUrls,
        countryCode: country.code,
        regionId: input.regionId,
        communityId,
        pricingMode: input.pricingMode,
        priceMinor: input.pricingMode === 'CONTACT_FOR_PRICE' ? undefined : input.priceMinor,
        // Currency always comes from the country configuration, never the form.
        currency: country.currency,
        unit: input.unit,
        quantity: input.quantity,
        minOrder: input.minOrder,
        availability: input.availability,
        wholesaleAvailable: input.wholesaleAvailable,
        status: 'ACTIVE',
      },
      tiers,
    );

    db.analytics.record({
      type: 'listing_created',
      entityType: 'listing',
      entityId: listing.id,
      countryCode: country.code,
      userId: user.id,
    });

    return ok(listing);
  },

  async update(
    user: User,
    listingId: string,
    patch: Partial<ListingInput>,
  ): Promise<ServiceResult<Listing>> {
    const listing = db.listings.byId(listingId);
    if (!listing) return fail('not_found', 'We could not find that listing.');

    // Ownership is re-checked here even though the UI already hid the control.
    if (!can(user, 'listing:update', listing)) {
      return fail('forbidden', 'You can only edit your own listings.');
    }

    const updated = db.listings.update(listingId, {
      ...patch,
      priceMinor:
        patch.pricingMode === 'CONTACT_FOR_PRICE' ? undefined : patch.priceMinor ?? listing.priceMinor,
    });
    if (!updated) return fail('not_found', 'We could not find that listing.');

    return ok(updated);
  },

  async setStatus(
    user: User,
    listingId: string,
    status: Listing['status'],
  ): Promise<ServiceResult<Listing>> {
    const listing = db.listings.byId(listingId);
    if (!listing) return fail('not_found', 'We could not find that listing.');
    if (!can(user, 'listing:update', listing)) {
      return fail('forbidden', 'You can only change your own listings.');
    }

    const updated = db.listings.update(listingId, { status });
    return updated ? ok(updated) : fail('not_found', 'We could not find that listing.');
  },

  /** Records a search term with no user linkage (docs/SECURITY.md §9). */
  logSearch(term: string, results: Paginated<ListingView>, countryCode?: string): void {
    if (!term.trim()) return;
    const limit = checkRateLimit('search', countryCode ?? 'anonymous');
    if (!limit.allowed) return;
    db.analytics.recordSearch(term, results.total, countryCode);
  },
};
