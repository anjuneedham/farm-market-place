import type { FarmProfile, FarmUpdate, Listing } from '@/lib/types';
import { daysAgo } from './helpers';

/**
 * A handful of realistic storefront updates, some linked to a real listing
 * from the same farm. Not every farm gets one — an empty "Farm Updates"
 * section is a true empty state, not a gap to paper over.
 */
const UPDATE_BODIES = [
  'First harvest of the season is in — fresher than ever and ready to go.',
  'Just restocked after a strong week. Message us if you need a specific quantity.',
  'New planting cycle underway. Reach out to reserve ahead of the next harvest.',
  'Thank you to everyone who ordered this month — we are grateful for the support.',
  'Weather has been kind this season and it shows in the quality coming off the farm.',
];

export function seedFarmUpdates(farms: FarmProfile[], listings: Listing[]): FarmUpdate[] {
  const updates: FarmUpdate[] = [];

  farms.forEach((farm, index) => {
    // Roughly every other farm has posted an update — a real, uneven pattern
    // rather than a manufactured "every farm has exactly N updates" grid.
    if (index % 2 !== 0) return;

    const farmListings = listings.filter((l) => l.sellerId === farm.userId);
    const linkedListing = farmListings[index % Math.max(farmListings.length, 1)];
    const body = UPDATE_BODIES[index % UPDATE_BODIES.length] ?? 'Fresh update from the farm.';

    updates.push({
      id: `farmupdate_${farm.id}_1`,
      farmId: farm.id,
      authorId: farm.userId,
      body: linkedListing ? `${body} Check out "${linkedListing.title}".` : body,
      imageUrls: [],
      listingId: linkedListing?.id,
      isDemoData: true,
      createdAt: daysAgo(2 + index),
    });
  });

  return updates;
}
