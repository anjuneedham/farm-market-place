import { data, mutate } from '../datasource';
import type { FarmUpdate, FarmUpdateView } from '@/lib/types';
import { newId, nowIso } from './common';
import { toListingView } from './listings';
import { toRequestView } from './requests';

function toView(update: FarmUpdate): FarmUpdateView {
  const listing = update.listingId ? data().listings.find((l) => l.id === update.listingId) : undefined;
  const request = update.buyerRequestId
    ? data().buyerRequests.find((r) => r.id === update.buyerRequestId)
    : undefined;

  const listingView = listing ? toListingView(listing) : undefined;
  const requestView = request ? toRequestView(request) : undefined;

  return {
    ...update,
    listing: listingView ? { id: listingView.id, slug: listingView.slug, title: listingView.title } : undefined,
    buyerRequest: requestView ? { id: requestView.id, slug: requestView.slug, title: requestView.title } : undefined,
  };
}

export const farmUpdates = {
  forFarm(farmId: string, limit = 10): FarmUpdateView[] {
    return data()
      .farmUpdates.filter((u) => u.farmId === farmId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map(toView);
  },

  countForFarm(farmId: string): number {
    return data().farmUpdates.filter((u) => u.farmId === farmId).length;
  },

  create(input: {
    farmId: string;
    authorId: string;
    body: string;
    imageUrls?: string[];
    listingId?: string;
    buyerRequestId?: string;
  }): FarmUpdate {
    return mutate((db) => {
      const update: FarmUpdate = {
        id: newId('farmupdate'),
        farmId: input.farmId,
        authorId: input.authorId,
        body: input.body,
        imageUrls: input.imageUrls ?? [],
        listingId: input.listingId,
        buyerRequestId: input.buyerRequestId,
        isDemoData: false,
        createdAt: nowIso(),
      };
      db.farmUpdates.push(update);
      return update;
    });
  },
};
