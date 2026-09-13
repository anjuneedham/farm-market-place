import { db } from '@/lib/db/repositories';
import { notificationService } from '@/lib/integrations';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import { canTransition } from '@/lib/order-transitions';
import type { Order, OrderStatus, Review, User } from '@/lib/types';
import type { z } from 'zod';
import type { orderSchema, reviewSchema } from '@/lib/validation';

type OrderInput = z.infer<typeof orderSchema>;
type ReviewInput = z.infer<typeof reviewSchema>;

export { canTransition };

export const orderService = {
  forUser: db.orders.forUser.bind(db.orders),

  byId(id: string) {
    return db.orders.byId(id);
  },

  /**
   * Records a deal that was agreed off-platform. The MVP does not process
   * payments, so the order exists to unlock reviews, savings and history —
   * paymentStatus is OFF_PLATFORM.
   */
  async create(user: User, input: OrderInput): Promise<ServiceResult<Order>> {
    const listing = db.listings.byId(input.listingId);
    if (!listing) return fail('not_found', 'We could not find that listing.');

    // Only the seller records an order against their own listing, so a buyer
    // cannot manufacture a completed order to leave themselves a review.
    if (listing.sellerId !== user.id) {
      return fail('forbidden', 'Only the seller can record an order for this listing.');
    }

    const buyer = db.users.byId(input.buyerId);
    if (!buyer) return fail('not_found', 'We could not find that buyer.');
    if (buyer.id === user.id) return fail('validation', 'Choose a different buyer.');

    const unitPrice = listing.priceMinor ?? 0;
    const subtotal = Math.round(unitPrice * input.quantity);

    const order = db.orders.create(
      {
        buyerId: buyer.id,
        sellerId: user.id,
        status: 'REQUESTED',
        paymentStatus: 'OFF_PLATFORM',
        fulfilment: input.fulfilment,
        currency: listing.currency,
        subtotalMinor: subtotal,
        savedMinor: 0,
        totalMinor: subtotal,
        notes: input.notes,
      },
      [
        {
          listingId: listing.id,
          titleSnapshot: listing.title,
          unit: listing.unit,
          quantity: input.quantity,
          unitPriceMinor: unitPrice,
          lineTotalMinor: subtotal,
        },
      ],
    );

    await notificationService.notify({
      userId: buyer.id,
      type: 'ORDER',
      title: `${db.profiles.displayFor(user.id).label} recorded an order`,
      body: `${order.reference} — ${listing.title}`,
      href: '/dashboard/buyer/orders',
    });

    return ok(order);
  },

  async setStatus(user: User, orderId: string, status: OrderStatus): Promise<ServiceResult<Order>> {
    const order = db.orders.byId(orderId);
    if (!order) return fail('not_found', 'We could not find that order.');

    if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== 'ADMIN') {
      return fail('forbidden', 'You are not part of this order.');
    }

    if (!canTransition(order.status, status)) {
      return fail('conflict', `An order that is ${order.status.toLowerCase()} cannot move to ${status.toLowerCase()}.`);
    }

    const updated = db.orders.setStatus(orderId, status);
    if (!updated) return fail('not_found', 'We could not find that order.');

    const counterpartId = order.buyerId === user.id ? order.sellerId : order.buyerId;
    await notificationService.notify({
      userId: counterpartId,
      type: 'ORDER',
      title: `Order ${order.reference} is now ${status.toLowerCase()}`,
      href: order.buyerId === counterpartId ? '/dashboard/buyer/orders' : '/dashboard/farmer/orders',
    });

    return ok(updated);
  },
};

export const reviewService = {
  forSubject: db.reviews.forSubject.bind(db.reviews),

  /**
   * Reviews are anchored to a completed order and limited to one per party.
   * This is the anti-spam design: you cannot review someone you have not
   * traded with (docs/USER_FLOWS.md §5).
   */
  async create(user: User, input: ReviewInput): Promise<ServiceResult<Review>> {
    const order = db.orders.byId(input.orderId);
    if (!order) return fail('not_found', 'We could not find that order.');

    if (order.status !== 'COMPLETED') {
      return fail('conflict', 'You can leave a review once the order is completed.');
    }
    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      return fail('forbidden', 'You are not part of this order.');
    }
    if (db.reviews.byOrderAndAuthor(order.id, user.id)) {
      return fail('conflict', 'You have already reviewed this order.');
    }

    const subjectUserId = order.buyerId === user.id ? order.sellerId : order.buyerId;

    const review = db.reviews.create({
      orderId: order.id,
      authorId: user.id,
      subjectUserId,
      rating: input.rating,
      body: input.body,
    });

    await notificationService.notify({
      userId: subjectUserId,
      type: 'REVIEW',
      title: `${db.profiles.displayFor(user.id).label} left you a ${input.rating}-star review`,
    });

    return ok(review);
  },
};
