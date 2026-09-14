import { db } from '@/lib/db/repositories';
import type { Discount, ListingView, PlanAudience, SubscriptionPlan, User } from '@/lib/types';

export type SavingsExample = {
  discount: Discount;
  listing: ListingView;
  regularMinor: number;
  premiumMinor: number;
  saveMinor: number;
};

function applyDiscount(priceMinor: number, discount: Discount): number {
  const raw =
    discount.kind === 'PERCENT'
      ? priceMinor - Math.round((priceMinor * discount.value) / 100)
      : priceMinor - discount.value;
  return Math.max(0, Math.round(raw));
}

/**
 * Premium gating.
 *
 * The free-forever commitment (docs/PREMIUM_STRATEGY.md §1) is enforced here:
 * a benefit flagged `alwaysFree` can never be gated, whatever a caller asks.
 */

export const FREE_SHOPPING_LIST_LIMIT = 1;
export const FREE_OPEN_REQUEST_LIMIT = 3;

export const premiumService = {
  isPremium(userId: string | undefined): boolean {
    return userId ? db.premium.isPremium(userId) : false;
  },

  /**
   * Whether a user may use a feature. Returns true for always-free resources
   * regardless of subscription state.
   */
  canAccess(user: User | null | undefined, featureKey: string): boolean {
    const benefit = db.premium.benefitByFeatureKey(featureKey);
    if (benefit?.alwaysFree) return true;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return db.premium.isPremium(user.id);
  },

  audienceFor(user: User | null | undefined): PlanAudience {
    switch (user?.role) {
      case 'FARMER':
        return 'FARMER';
      case 'BUSINESS':
        return 'BUSINESS';
      case 'BUYER':
        return 'BUYER';
      default:
        return 'ALL';
    }
  },

  /**
   * Plans for a market. Returns an empty list when Premium has not been priced
   * for that country — the UI then says so rather than showing a default price,
   * because there is no default price anywhere in the codebase.
   */
  plansFor(countryCode: string, audience: PlanAudience): SubscriptionPlan[] {
    return db.premium.plans(countryCode, audience);
  },

  benefitsFor(audience: PlanAudience) {
    return db.premium.benefits(audience);
  },

  /** Shopping list quota. Free members get one; Premium is unlimited. */
  canCreateShoppingList(user: User): boolean {
    if (this.isPremium(user.id)) return true;
    return db.shoppingLists.countFor(user.id) < FREE_SHOPPING_LIST_LIMIT;
  },

  /** Open buyer request quota. */
  canCreateRequest(user: User): boolean {
    if (this.isPremium(user.id)) return true;
    return db.buyerRequests.search({ buyerId: user.id, status: 'OPEN', perPage: 60 }).total <
      FREE_OPEN_REQUEST_LIMIT;
  },

  /**
   * Savings, computed only from real completed orders. Returns zeroes rather
   * than an invented figure when nothing has been recorded yet; the dashboard
   * renders an empty state for that case.
   */
  savingsFor(userId: string) {
    return db.orders.savingsFor(userId);
  },

  /**
   * Concrete "Regular / Premium / You Save" examples for `/premium`, built
   * only from real, currently-active Premium-only `Discount` rows applied to
   * a real listing that actually has a fixed price. A discount with no
   * matching priced listing in its category is simply skipped — never
   * rendered with an invented example price (docs/PREMIUM_STRATEGY.md §5).
   */
  savingsExamplesFor(countryCode: string, limit = 3): SavingsExample[] {
    const discounts = db.premium.discounts(countryCode).filter((d) => d.premiumOnly);
    const examples: SavingsExample[] = [];

    for (const discount of discounts) {
      if (examples.length >= limit) break;
      const candidates = discount.categoryId
        ? db.listings.search({ countryCode, categoryId: discount.categoryId, sort: 'popular', perPage: 10 }).items
        : [];
      const listing = candidates.find((l) => l.priceMinor !== undefined);
      if (!listing?.priceMinor) continue;

      const premiumMinor = applyDiscount(listing.priceMinor, discount);
      examples.push({
        discount,
        listing,
        regularMinor: listing.priceMinor,
        premiumMinor,
        saveMinor: listing.priceMinor - premiumMinor,
      });
    }

    return examples;
  },
};
