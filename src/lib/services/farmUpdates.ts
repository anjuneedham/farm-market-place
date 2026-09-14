import { can } from '@/lib/auth/permissions';
import { db } from '@/lib/db/repositories';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import { checkRateLimit } from '@/lib/security/rate-limit';
import type { FarmUpdate, User } from '@/lib/types';

export const farmUpdateService = {
  forFarm: db.farmUpdates.forFarm.bind(db.farmUpdates),

  async create(
    user: User,
    input: { body: string; listingId?: string },
  ): Promise<ServiceResult<FarmUpdate>> {
    if (!can(user, 'farmUpdate:create')) {
      return fail('forbidden', 'Only the farm owner can post an update.');
    }

    const farm = db.profiles.farmByUserId(user.id);
    if (!farm) return fail('validation', 'Set up your farm profile before posting an update.');

    if (!input.body.trim()) {
      return fail('validation', 'Write something before posting.', { body: 'Write something before posting.' });
    }

    const limit = checkRateLimit('createFarmUpdate', user.id);
    if (!limit.allowed) {
      return fail('rate_limited', 'You have posted several updates recently. Try again later.');
    }

    // Re-checked server-side: a farmer can only link an update to their own
    // listing, never someone else's (docs/SECURITY.md §2).
    if (input.listingId) {
      const listing = db.listings.byId(input.listingId);
      if (!listing || listing.sellerId !== user.id) {
        return fail('validation', 'Choose one of your own listings, or leave it blank.', {
          listingId: 'Choose one of your own listings, or leave it blank.',
        });
      }
    }

    const update = db.farmUpdates.create({
      farmId: farm.id,
      authorId: user.id,
      body: input.body.trim(),
      listingId: input.listingId,
    });

    return ok(update);
  },
};
