import { db } from '@/lib/db/repositories';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import type { User, UserStatus } from '@/lib/types';

/**
 * Admin operations. Every method assumes the caller has already passed
 * requireRole('ADMIN') — this module does not re-check role, because it is
 * only ever invoked from server actions in src/app/admin/**, which do.
 */
export const adminService = {
  /**
   * Operates on the in-memory demo copy of accounts (see
   * src/lib/db/repositories/users.ts's header comment) — it does not yet
   * reach a real Supabase account's status, since that would need the
   * service-role key this app deliberately never holds. A suspended demo
   * user can therefore still sign in via Supabase Auth today; extending
   * admin moderation to real accounts is a follow-up, not silently faked
   * here.
   */
  setUserStatus(userId: string, status: UserStatus): ServiceResult<User> {
    const user = db.users.update(userId, { status });
    if (!user) return fail('not_found', 'User not found.');
    return ok(user);
  },

  removeListing(listingId: string): ServiceResult<null> {
    const listing = db.listings.update(listingId, { status: 'REMOVED_BY_ADMIN' });
    if (!listing) return fail('not_found', 'Listing not found.');
    return ok(null);
  },

  restoreListing(listingId: string): ServiceResult<null> {
    const listing = db.listings.update(listingId, { status: 'ACTIVE' });
    if (!listing) return fail('not_found', 'Listing not found.');
    return ok(null);
  },

  featureListing(listingId: string, days: number): ServiceResult<null> {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const listing = db.listings.update(listingId, { featuredUntil: until });
    if (!listing) return fail('not_found', 'Listing not found.');
    return ok(null);
  },

  unfeatureListing(listingId: string): ServiceResult<null> {
    const listing = db.listings.update(listingId, { featuredUntil: undefined });
    if (!listing) return fail('not_found', 'Listing not found.');
    return ok(null);
  },

  decideVerification(
    id: string,
    reviewerId: string,
    status: 'APPROVED' | 'REJECTED',
    note?: string,
  ): ServiceResult<null> {
    const record = db.verification.decide(id, reviewerId, status, note);
    if (!record) return fail('not_found', 'Verification request not found.');
    return ok(null);
  },

  resolveReport(id: string, status: 'ACTIONED' | 'DISMISSED', resolution?: string): ServiceResult<null> {
    db.moderation.resolveReport(id, status, resolution);
    return ok(null);
  },

  hideCommunityPost(postId: string): ServiceResult<null> {
    const post = db.community.updatePost(postId, { status: 'REMOVED_BY_ADMIN' });
    if (!post) return fail('not_found', 'Post not found.');
    return ok(null);
  },

  restoreCommunityPost(postId: string): ServiceResult<null> {
    const post = db.community.updatePost(postId, { status: 'PUBLISHED' });
    if (!post) return fail('not_found', 'Post not found.');
    return ok(null);
  },

  setCoursePublished(courseId: string, isPublished: boolean): ServiceResult<null> {
    const course = db.academy.setCoursePublished(courseId, isPublished);
    if (!course) return fail('not_found', 'Course not found.');
    return ok(null);
  },

  updatePlanPrice(planId: string, priceMinor: number): ServiceResult<null> {
    const plan = db.premium.updatePlan(planId, { priceMinor });
    if (!plan) return fail('not_found', 'Plan not found.');
    return ok(null);
  },

  /**
   * The PayPal-specific price/currency, separate from the plan's local-
   * currency price — PayPal cannot settle in most of AgriLoop's Caribbean
   * currencies. See docs/PREMIUM_STRATEGY.md § Online checkout currency.
   */
  updatePlanPaypalPrice(planId: string, priceMinor: number, currency: string): ServiceResult<null> {
    const plan = db.premium.updatePlan(planId, {
      paypalPriceMinor: priceMinor,
      paypalCurrency: currency.toUpperCase(),
    });
    if (!plan) return fail('not_found', 'Plan not found.');
    return ok(null);
  },

  grantSubscription(userId: string, planId: string, days: number): ServiceResult<null> {
    const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    db.premium.grantSubscription(userId, planId, until);
    return ok(null);
  },

  toggleCategoryActive(categoryId: string, isActive: boolean): ServiceResult<null> {
    const category = db.catalog.updateCategory(categoryId, { isActive });
    if (!category) return fail('not_found', 'Category not found.');
    return ok(null);
  },

  setProductStatus(productId: string, status: 'ACTIVE' | 'REJECTED'): ServiceResult<null> {
    const product = db.catalog.setProductStatus(productId, status);
    if (!product) return fail('not_found', 'Product not found.');
    return ok(null);
  },

  setCountryLive(countryCode: string, isLive: boolean): ServiceResult<null> {
    db.locations.setLive(countryCode, isLive);
    return ok(null);
  },
};
