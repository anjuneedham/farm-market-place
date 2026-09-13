import { data, mutate } from '../datasource';
import type {
  BuyerRequest,
  BuyerRequestView,
  Paginated,
  PageParams,
  RequestResponse,
} from '@/lib/types';
import { catalog } from './catalog';
import { matches, newId, nowIso, paginate, uniqueSlug } from './common';
import { locations } from './locations';
import { profiles, toPublicUser, users } from './users';

export type RequestFilters = {
  countryCode?: string;
  regionId?: string;
  categoryId?: string;
  buyerId?: string;
  search?: string;
  frequency?: BuyerRequest['frequency'];
  status?: BuyerRequest['status'];
} & PageParams;

export function toRequestView(request: BuyerRequest): BuyerRequestView | undefined {
  const user = users.byId(request.buyerId);
  const region = locations.region(request.regionId);
  const country = locations.country(request.countryCode);
  if (!user || !region || !country) return undefined;

  const buyerProfile = profiles.buyerByUserId(user.id);

  return {
    ...request,
    buyer: toPublicUser(user),
    buyerName: buyerProfile?.displayName ?? user.name,
    buyerType: buyerProfile?.type ?? 'OTHER',
    buyerVerified: buyerProfile?.isVerified ?? false,
    region,
    community: request.communityId ? locations.community(request.communityId) : undefined,
    country,
    category: request.categoryId ? catalog.byId(request.categoryId) : undefined,
  };
}

export const buyerRequests = {
  byId(id: string): BuyerRequest | undefined {
    return data().buyerRequests.find((r) => r.id === id);
  },

  bySlug(slug: string): BuyerRequest | undefined {
    return data().buyerRequests.find((r) => r.slug === slug);
  },

  viewBySlug(slug: string): BuyerRequestView | undefined {
    const request = this.bySlug(slug);
    return request ? toRequestView(request) : undefined;
  },

  search(filters: RequestFilters = {}): Paginated<BuyerRequestView> {
    const status = filters.status ?? 'OPEN';
    let items = data().buyerRequests.filter((r) => r.status === status);

    if (filters.countryCode) items = items.filter((r) => r.countryCode === filters.countryCode);
    if (filters.regionId) items = items.filter((r) => r.regionId === filters.regionId);
    if (filters.buyerId) items = items.filter((r) => r.buyerId === filters.buyerId);
    if (filters.frequency) items = items.filter((r) => r.frequency === filters.frequency);

    if (filters.categoryId) {
      const ids = new Set(catalog.withDescendantIds(filters.categoryId));
      items = items.filter((r) => r.categoryId && ids.has(r.categoryId));
    }

    if (filters.search?.trim()) {
      const term = filters.search.trim();
      items = items.filter(
        (request) =>
          matches(request.title, term) ||
          matches(request.description, term) ||
          matches(locations.region(request.regionId)?.name ?? '', term),
      );
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const views = items
      .map(toRequestView)
      .filter((view): view is BuyerRequestView => view !== undefined);

    return paginate(views, filters);
  },

  openCount(countryCode?: string): number {
    return data().buyerRequests.filter(
      (r) => r.status === 'OPEN' && (!countryCode || r.countryCode === countryCode),
    ).length;
  },

  responsesFor(requestId: string): RequestResponse[] {
    return data()
      .requestResponses.filter((r) => r.buyerRequestId === requestId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  responseBy(requestId: string, responderId: string): RequestResponse | undefined {
    return data().requestResponses.find(
      (r) => r.buyerRequestId === requestId && r.responderId === responderId,
    );
  },

  responseCountFor(responderId: string): number {
    return data().requestResponses.filter((r) => r.responderId === responderId).length;
  },

  create(
    input: Omit<
      BuyerRequest,
      'id' | 'slug' | 'createdAt' | 'updatedAt' | 'responseCount' | 'status' | 'isDemoData'
    >,
  ): BuyerRequest {
    return mutate((db) => {
      const request: BuyerRequest = {
        ...input,
        id: newId('request'),
        slug: uniqueSlug(
          input.title,
          db.buyerRequests.map((r) => r.slug),
        ),
        status: 'OPEN',
        responseCount: 0,
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.buyerRequests.push(request);
      return request;
    });
  },

  update(id: string, patch: Partial<BuyerRequest>): BuyerRequest | undefined {
    return mutate((db) => {
      const request = db.buyerRequests.find((r) => r.id === id);
      if (!request) return undefined;
      Object.assign(request, patch, { updatedAt: nowIso() });
      return request;
    });
  },

  /**
   * One response per responder per request. A second attempt updates the first
   * rather than letting a farmer spam the buyer.
   */
  respond(
    requestId: string,
    responderId: string,
    input: Pick<RequestResponse, 'message' | 'quotedPriceMinor' | 'currency' | 'quotedQuantity'>,
  ): RequestResponse {
    return mutate((db) => {
      const existing = db.requestResponses.find(
        (r) => r.buyerRequestId === requestId && r.responderId === responderId,
      );
      if (existing) {
        Object.assign(existing, input, { createdAt: nowIso() });
        return existing;
      }

      const response: RequestResponse = {
        ...input,
        id: newId('response'),
        buyerRequestId: requestId,
        responderId,
        createdAt: nowIso(),
      };
      db.requestResponses.push(response);

      const request = db.buyerRequests.find((r) => r.id === requestId);
      if (request) request.responseCount += 1;

      return response;
    });
  },
};
