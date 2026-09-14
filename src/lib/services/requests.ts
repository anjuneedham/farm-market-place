import { can } from '@/lib/auth/permissions';
import { db } from '@/lib/db/repositories';
import { notificationService } from '@/lib/integrations';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import type { BuyerRequest, RequestResponse, User } from '@/lib/types';
import type { z } from 'zod';
import type { buyerRequestSchema, requestResponseSchema } from '@/lib/validation';
import { premiumService } from './premium';

type RequestInput = z.infer<typeof buyerRequestSchema>;
type ResponseInput = z.infer<typeof requestResponseSchema>;

export const requestService = {
  search: db.buyerRequests.search.bind(db.buyerRequests),

  bySlug(slug: string) {
    return db.buyerRequests.viewBySlug(slug);
  },

  responsesFor(requestId: string): RequestResponse[] {
    return db.buyerRequests.responsesFor(requestId);
  },

  async create(user: User, input: RequestInput): Promise<ServiceResult<BuyerRequest>> {
    if (!can(user, 'request:create')) {
      return fail('forbidden', 'Sign in to post a buyer request.');
    }

    if (!premiumService.canCreateRequest(user)) {
      return fail(
        'conflict',
        'You have reached the number of open requests on the free plan. Close one, or upgrade for more.',
      );
    }

    const profile =
      db.profiles.buyerByUserId(user.id) ??
      db.profiles.farmByUserId(user.id) ??
      db.profiles.businessByUserId(user.id);
    const countryCode = profile?.countryCode ?? 'JM';
    const country = db.locations.country(countryCode);
    if (!country) return fail('validation', 'Your profile is missing a country.');

    if (!db.locations.regionBelongsToCountry(input.regionId, country.code)) {
      return fail('validation', `Choose a ${country.regionLabel.toLowerCase()}.`, {
        regionId: 'Choose a valid location.',
      });
    }

    const request = db.buyerRequests.create({
      buyerId: user.id,
      categoryId: input.categoryId || undefined,
      title: input.title,
      description: input.description,
      quantity: input.quantity,
      unit: input.unit,
      frequency: input.frequency,
      budgetMinor: input.budgetMinor,
      budgetIsNegotiable: input.budgetIsNegotiable,
      currency: country.currency,
      countryCode: country.code,
      regionId: input.regionId,
      communityId:
        input.communityId &&
        db.locations.communityBelongsToRegion(input.communityId, input.regionId)
          ? input.communityId
          : undefined,
      neededBy: input.neededBy || undefined,
    });

    await this.alertMatchingSellers(request);

    db.analytics.record({
      type: 'request_created',
      entityType: 'buyer_request',
      entityId: request.id,
      countryCode: country.code,
      userId: user.id,
    });

    return ok(request);
  },

  /**
   * Buyer-request alerts: a Premium farmer benefit (`buyer_request_alerts`).
   * Sellers in the same parish with a matching category are notified.
   */
  async alertMatchingSellers(request: BuyerRequest): Promise<void> {
    const candidates = db.listings.search({
      countryCode: request.countryCode,
      regionId: request.regionId,
      categoryId: request.categoryId,
      perPage: 60,
    }).items;

    const notified = new Set<string>();
    for (const listing of candidates) {
      if (notified.has(listing.sellerId)) continue;
      notified.add(listing.sellerId);

      const seller = db.users.byId(listing.sellerId);
      if (!seller || !premiumService.canAccess(seller, 'buyer_request_alerts')) continue;

      await notificationService.notify({
        userId: seller.id,
        type: 'BUYER_REQUEST',
        title: `New buyer request in ${db.locations.region(request.regionId)?.name ?? 'your area'}`,
        body: request.title,
        href: `/requests/${request.slug}`,
      });
    }
  },

  async respond(user: User, input: ResponseInput): Promise<ServiceResult<RequestResponse>> {
    if (!can(user, 'request:respond')) {
      return fail(
        'forbidden',
        'Only farmers and agricultural businesses can respond to buyer requests.',
      );
    }

    const request = db.buyerRequests.byId(input.buyerRequestId);
    if (!request) return fail('not_found', 'We could not find that request.');
    if (request.status !== 'OPEN') return fail('conflict', 'This request is no longer open.');
    if (request.buyerId === user.id) {
      return fail('conflict', 'You cannot respond to your own request.');
    }
    if (db.moderation.isBlockedEitherWay(user.id, request.buyerId)) {
      return fail('forbidden', 'You cannot respond to this request.');
    }

    const isUpdate = Boolean(db.buyerRequests.responseBy(request.id, user.id));

    const response = db.buyerRequests.respond(request.id, user.id, {
      message: input.message,
      quotedPriceMinor: input.quotedPriceMinor,
      currency: input.quotedPriceMinor ? request.currency : undefined,
      quotedQuantity: input.quotedQuantity,
    });

    // Responding opens a conversation so the two can keep talking in one place.
    const conversation = db.conversations.findOrCreate(user.id, request.buyerId, {
      buyerRequestId: request.id,
    });
    db.conversations.send(conversation.id, user.id, input.message);

    if (!isUpdate) {
      await notificationService.notify({
        userId: request.buyerId,
        type: 'REQUEST_RESPONSE',
        title: `${db.profiles.displayFor(user.id).label} responded to your request`,
        body: request.title,
        href: `/requests/${request.slug}`,
      });
    }

    return ok(response);
  },

  async decideResponse(
    user: User,
    responseId: string,
    status: Extract<RequestResponse['status'], 'ACCEPTED' | 'REJECTED'>,
  ): Promise<ServiceResult<RequestResponse>> {
    const response = db.buyerRequests.responseById(responseId);
    if (!response) return fail('not_found', 'We could not find that response.');

    const request = db.buyerRequests.byId(response.buyerRequestId);
    if (!request) return fail('not_found', 'We could not find that request.');

    // Only the buyer who posted the request can accept or reject an offer on
    // it — never the responder themselves, and never another buyer.
    if (request.buyerId !== user.id) {
      return fail('forbidden', 'Only the buyer who posted this request can respond to offers.');
    }

    const updated = db.buyerRequests.setResponseStatus(responseId, status);
    if (!updated) return fail('not_found', 'We could not find that response.');

    await notificationService.notify({
      userId: response.responderId,
      type: 'REQUEST_RESPONSE',
      title: status === 'ACCEPTED' ? `Your offer was accepted` : `Your offer was declined`,
      body: request.title,
      href: `/requests/${request.slug}`,
    });

    return ok(updated);
  },

  async close(user: User, requestId: string): Promise<ServiceResult<BuyerRequest>> {
    const request = db.buyerRequests.byId(requestId);
    if (!request) return fail('not_found', 'We could not find that request.');
    if (!can(user, 'request:update', request)) {
      return fail('forbidden', 'You can only change your own requests.');
    }

    const updated = db.buyerRequests.update(requestId, { status: 'CLOSED' });
    return updated ? ok(updated) : fail('not_found', 'We could not find that request.');
  },
};
