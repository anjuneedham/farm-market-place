import { data, mutate } from '../datasource';
import type {
  AnalyticsEvent,
  Conversation,
  ConversationView,
  Favorite,
  FavoriteKind,
  Message,
  Notification,
  NotificationType,
  Order,
  OrderItem,
  OrderView,
  Paginated,
  PageParams,
  Report,
  ReportTargetType,
  Review,
  ReviewView,
  ShoppingList,
  ShoppingListItem,
  ShoppingListView,
  UserBlock,
  Verification,
} from '@/lib/types';
import { newId, nowIso, paginate } from './common';
import { profiles, toPublicUser, users } from './users';

// ── Favourites ───────────────────────────────────────────────────────────────

export const favorites = {
  forUser(userId: string, kind?: FavoriteKind): Favorite[] {
    return data()
      .favorites.filter((f) => f.userId === userId && (!kind || f.kind === kind))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  has(userId: string, kind: FavoriteKind, targetId: string): boolean {
    return data().favorites.some(
      (f) => f.userId === userId && f.kind === kind && f.targetId === targetId,
    );
  },

  /** Returns the new saved state. */
  toggle(userId: string, kind: FavoriteKind, targetId: string): boolean {
    return mutate((db) => {
      const index = db.favorites.findIndex(
        (f) => f.userId === userId && f.kind === kind && f.targetId === targetId,
      );
      if (index >= 0) {
        db.favorites.splice(index, 1);
        return false;
      }
      db.favorites.push({ id: newId('favorite'), userId, kind, targetId, createdAt: nowIso() });
      return true;
    });
  },

  countFor(kind: FavoriteKind, targetId: string): number {
    return data().favorites.filter((f) => f.kind === kind && f.targetId === targetId).length;
  },
};

// ── Shopping lists ───────────────────────────────────────────────────────────

export const shoppingLists = {
  forUser(userId: string): ShoppingListView[] {
    return data()
      .shoppingLists.filter((l) => l.ownerId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((list) => ({
        ...list,
        items: data()
          .shoppingListItems.filter((i) => i.listId === list.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }));
  },

  byId(id: string): ShoppingList | undefined {
    return data().shoppingLists.find((l) => l.id === id);
  },

  countFor(userId: string): number {
    return data().shoppingLists.filter((l) => l.ownerId === userId).length;
  },

  create(ownerId: string, name: string, notes?: string): ShoppingList {
    return mutate((db) => {
      const list: ShoppingList = {
        id: newId('list'),
        ownerId,
        name,
        notes,
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.shoppingLists.push(list);
      return list;
    });
  },

  addItem(listId: string, item: Omit<ShoppingListItem, 'id' | 'listId' | 'sortOrder'>): void {
    mutate((db) => {
      const existing = db.shoppingListItems.filter((i) => i.listId === listId);
      db.shoppingListItems.push({
        ...item,
        id: newId('li'),
        listId,
        sortOrder: existing.length,
      });
      const list = db.shoppingLists.find((l) => l.id === listId);
      if (list) list.updatedAt = nowIso();
    });
  },

  removeItem(itemId: string): void {
    mutate((db) => {
      db.shoppingListItems = db.shoppingListItems.filter((i) => i.id !== itemId);
    });
  },

  remove(listId: string): void {
    mutate((db) => {
      db.shoppingLists = db.shoppingLists.filter((l) => l.id !== listId);
      db.shoppingListItems = db.shoppingListItems.filter((i) => i.listId !== listId);
    });
  },
};

// ── Messaging ────────────────────────────────────────────────────────────────

export const conversations = {
  forUser(userId: string): ConversationView[] {
    return data()
      .conversations.filter((c) => c.participantAId === userId || c.participantBId === userId)
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
      .map((conversation) => this.toView(conversation, userId))
      .filter((view): view is ConversationView => view !== undefined);
  },

  toView(conversation: Conversation, viewerId: string): ConversationView | undefined {
    const otherId =
      conversation.participantAId === viewerId
        ? conversation.participantBId
        : conversation.participantAId;
    const other = users.byId(otherId);
    if (!other) return undefined;

    const display = profiles.displayFor(otherId);
    const listing = conversation.listingId
      ? data().listings.find((l) => l.id === conversation.listingId)
      : undefined;
    const request = conversation.buyerRequestId
      ? data().buyerRequests.find((r) => r.id === conversation.buyerRequestId)
      : undefined;

    return {
      ...conversation,
      other: toPublicUser(other),
      otherDisplayName: display.label,
      unread:
        conversation.participantAId === viewerId
          ? conversation.unreadForA
          : conversation.unreadForB,
      contextLabel: listing?.title ?? request?.title,
      contextHref: listing
        ? `/market/listing/${listing.slug}`
        : request
          ? `/requests/${request.slug}`
          : undefined,
    };
  },

  byId(id: string): Conversation | undefined {
    return data().conversations.find((c) => c.id === id);
  },

  unreadCount(userId: string): number {
    return data()
      .conversations.filter((c) => c.participantAId === userId || c.participantBId === userId)
      .reduce(
        (sum, c) => sum + (c.participantAId === userId ? c.unreadForA : c.unreadForB),
        0,
      );
  },

  /**
   * Conversations are deduplicated on (participants, listing, request), so
   * messaging the same farmer about the same listing continues one thread.
   */
  findOrCreate(
    userA: string,
    userB: string,
    context: { listingId?: string; buyerRequestId?: string } = {},
  ): Conversation {
    const [participantAId, participantBId] = userA < userB ? [userA, userB] : [userB, userA];

    return mutate((db) => {
      const existing = db.conversations.find(
        (c) =>
          c.participantAId === participantAId &&
          c.participantBId === participantBId &&
          c.listingId === context.listingId &&
          c.buyerRequestId === context.buyerRequestId,
      );
      if (existing) return existing;

      const conversation: Conversation = {
        id: newId('conversation'),
        participantAId,
        participantBId,
        listingId: context.listingId,
        buyerRequestId: context.buyerRequestId,
        lastMessageAt: nowIso(),
        unreadForA: 0,
        unreadForB: 0,
        isDemoData: false,
        createdAt: nowIso(),
      };
      db.conversations.push(conversation);
      return conversation;
    });
  },

  messages(conversationId: string): Message[] {
    return data()
      .messages.filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  send(conversationId: string, senderId: string, body: string, kind: Message['kind'] = 'TEXT'): Message {
    return mutate((db) => {
      const message: Message = {
        id: newId('message'),
        conversationId,
        senderId,
        kind,
        body,
        createdAt: nowIso(),
      };
      db.messages.push(message);

      const conversation = db.conversations.find((c) => c.id === conversationId);
      if (conversation) {
        conversation.lastMessageAt = message.createdAt;
        conversation.lastMessagePreview = body.slice(0, 120);
        if (conversation.participantAId === senderId) {
          conversation.unreadForB += 1;
        } else {
          conversation.unreadForA += 1;
        }
      }

      return message;
    });
  },

  markRead(conversationId: string, viewerId: string): void {
    mutate((db) => {
      const conversation = db.conversations.find((c) => c.id === conversationId);
      if (!conversation) return;
      if (conversation.participantAId === viewerId) conversation.unreadForA = 0;
      else conversation.unreadForB = 0;

      for (const message of db.messages) {
        if (message.conversationId === conversationId && message.senderId !== viewerId) {
          message.readAt ??= nowIso();
        }
      }
    });
  },
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const orders = {
  byId(id: string): Order | undefined {
    return data().orders.find((o) => o.id === id);
  },

  itemsFor(orderId: string): OrderItem[] {
    return data().orderItems.filter((i) => i.orderId === orderId);
  },

  toView(order: Order): OrderView {
    return {
      ...order,
      items: this.itemsFor(order.id),
      buyerName: profiles.displayFor(order.buyerId).label,
      sellerName: profiles.displayFor(order.sellerId).label,
    };
  },

  forUser(
    userId: string,
    role: 'buyer' | 'seller',
    params: PageParams = {},
  ): Paginated<OrderView> {
    const items = data()
      .orders.filter((o) => (role === 'buyer' ? o.buyerId === userId : o.sellerId === userId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((order) => this.toView(order));
    return paginate(items, params);
  },

  all(params: PageParams = {}): Paginated<OrderView> {
    const items = data()
      .orders.slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((order) => this.toView(order));
    return paginate(items, params);
  },

  countFor(userId: string, role: 'buyer' | 'seller', status?: Order['status']): number {
    return data().orders.filter(
      (o) =>
        (role === 'buyer' ? o.buyerId === userId : o.sellerId === userId) &&
        (!status || o.status === status),
    ).length;
  },

  revenueFor(sellerId: string): number {
    return data()
      .orders.filter((o) => o.sellerId === sellerId && o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalMinor, 0);
  },

  /**
   * Premium savings, computed only from real recorded orders. There is no
   * fallback demo figure — see docs/PREMIUM_STRATEGY.md §5.
   */
  savingsFor(buyerId: string): { monthMinor: number; lifetimeMinor: number; currency?: string } {
    const relevant = data().orders.filter(
      (o) => o.buyerId === buyerId && o.status === 'COMPLETED' && o.savedMinor > 0,
    );
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return {
      monthMinor: relevant
        .filter((o) => Date.parse(o.completedAt ?? o.createdAt) >= startOfMonth.getTime())
        .reduce((sum, o) => sum + o.savedMinor, 0),
      lifetimeMinor: relevant.reduce((sum, o) => sum + o.savedMinor, 0),
      currency: relevant[0]?.currency,
    };
  },

  create(
    input: Omit<Order, 'id' | 'reference' | 'createdAt' | 'updatedAt' | 'isDemoData'>,
    items: Array<Omit<OrderItem, 'id' | 'orderId'>>,
  ): Order {
    return mutate((db) => {
      const order: Order = {
        ...input,
        id: newId('order'),
        reference: `AL-${String(1000 + db.orders.length)}`,
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.orders.push(order);

      items.forEach((item, index) => {
        db.orderItems.push({ ...item, id: `${order.id}_item_${index}`, orderId: order.id });
      });

      return order;
    });
  },

  setStatus(id: string, status: Order['status']): Order | undefined {
    return mutate((db) => {
      const order = db.orders.find((o) => o.id === id);
      if (!order) return undefined;
      order.status = status;
      order.updatedAt = nowIso();
      if (status === 'COMPLETED') order.completedAt = nowIso();
      return order;
    });
  },

  total(): number {
    return data().orders.length;
  },
};

// ── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = {
  forSubject(subjectUserId: string, params: PageParams = {}): Paginated<ReviewView> {
    const items = data()
      .reviews.filter((r) => r.subjectUserId === subjectUserId && !r.isHidden)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((review) => {
        const author = users.byId(review.authorId);
        return {
          ...review,
          author: author
            ? toPublicUser(author)
            : {
                id: review.authorId,
                name: 'Former member',
                role: 'BUYER' as const,
                createdAt: review.createdAt,
              },
        };
      });
    return paginate(items, params);
  },

  byOrderAndAuthor(orderId: string, authorId: string): Review | undefined {
    return data().reviews.find((r) => r.orderId === orderId && r.authorId === authorId);
  },

  all(): Review[] {
    return [...data().reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  create(input: Omit<Review, 'id' | 'createdAt' | 'isHidden' | 'isDemoData'>): Review {
    return mutate((db) => {
      const review: Review = {
        ...input,
        id: newId('review'),
        isHidden: false,
        isDemoData: false,
        createdAt: nowIso(),
      };
      db.reviews.push(review);

      // Rating aggregates are denormalized onto the profile for list
      // performance and recomputed here on every write.
      const subjectReviews = db.reviews.filter(
        (r) => r.subjectUserId === input.subjectUserId && !r.isHidden,
      );
      const average =
        subjectReviews.reduce((sum, r) => sum + r.rating, 0) / (subjectReviews.length || 1);

      const farm = db.farms.find((f) => f.userId === input.subjectUserId);
      if (farm) {
        farm.ratingAverage = Math.round(average * 10) / 10;
        farm.ratingCount = subjectReviews.length;
      }
      const business = db.businesses.find((b) => b.userId === input.subjectUserId);
      if (business) {
        business.ratingAverage = Math.round(average * 10) / 10;
        business.ratingCount = subjectReviews.length;
      }
      const buyer = db.buyers.find((b) => b.userId === input.subjectUserId);
      if (buyer) {
        buyer.ratingAverage = Math.round(average * 10) / 10;
        buyer.ratingCount = subjectReviews.length;
      }

      return review;
    });
  },

  setHidden(id: string, isHidden: boolean): void {
    mutate((db) => {
      const review = db.reviews.find((r) => r.id === id);
      if (review) review.isHidden = isHidden;
    });
  },
};

// ── Notifications ────────────────────────────────────────────────────────────

export const notifications = {
  forUser(userId: string, params: PageParams = {}): Paginated<Notification> {
    const items = data()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginate(items, params);
  },

  unreadCount(userId: string): number {
    return data().notifications.filter((n) => n.userId === userId && !n.readAt).length;
  },

  create(input: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    href?: string;
  }): Notification {
    return mutate((db) => {
      const notification: Notification = { ...input, id: newId('notification'), createdAt: nowIso() };
      db.notifications.push(notification);
      return notification;
    });
  },

  markAllRead(userId: string): void {
    mutate((db) => {
      for (const notification of db.notifications) {
        if (notification.userId === userId) notification.readAt ??= nowIso();
      }
    });
  },
};

// ── Moderation ───────────────────────────────────────────────────────────────

export const moderation = {
  reports(status?: Report['status']): Report[] {
    return data()
      .reports.filter((r) => !status || r.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  openReportCount(): number {
    return data().reports.filter((r) => r.status === 'OPEN').length;
  },

  createReport(input: {
    reporterId: string;
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
    details?: string;
  }): Report {
    return mutate((db) => {
      const report: Report = {
        ...input,
        id: newId('report'),
        status: 'OPEN',
        createdAt: nowIso(),
      };
      db.reports.push(report);
      return report;
    });
  },

  resolveReport(id: string, status: Report['status'], resolution?: string): void {
    mutate((db) => {
      const report = db.reports.find((r) => r.id === id);
      if (!report) return;
      report.status = status;
      report.resolution = resolution;
      report.resolvedAt = nowIso();
    });
  },

  blocks(actorId: string): UserBlock[] {
    return data().userBlocks.filter((b) => b.actorId === actorId);
  },

  isBlockedEitherWay(a: string, b: string): boolean {
    return data().userBlocks.some(
      (block) =>
        (block.actorId === a && block.targetId === b) ||
        (block.actorId === b && block.targetId === a),
    );
  },

  block(actorId: string, targetId: string): void {
    mutate((db) => {
      const exists = db.userBlocks.some(
        (block) => block.actorId === actorId && block.targetId === targetId,
      );
      if (!exists) {
        db.userBlocks.push({ id: newId('block'), actorId, targetId, createdAt: nowIso() });
      }
    });
  },

  unblock(actorId: string, targetId: string): void {
    mutate((db) => {
      db.userBlocks = db.userBlocks.filter(
        (block) => !(block.actorId === actorId && block.targetId === targetId),
      );
    });
  },
};

// ── Verification ─────────────────────────────────────────────────────────────

export const verification = {
  pending(): Verification[] {
    return data()
      .verifications.filter((v) => v.status === 'PENDING')
      .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
  },

  all(): Verification[] {
    return [...data().verifications].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  },

  forUser(userId: string): Verification | undefined {
    return data().verifications.find((v) => v.subjectId === userId);
  },

  request(subjectId: string, kind: Verification['kind']): Verification {
    return mutate((db) => {
      const existing = db.verifications.find((v) => v.subjectId === subjectId);
      if (existing && existing.status === 'PENDING') return existing;

      const record: Verification = {
        id: newId('verification'),
        subjectId,
        kind,
        status: 'PENDING',
        evidenceUrls: [],
        requestedAt: nowIso(),
      };
      db.verifications.push(record);
      return record;
    });
  },

  decide(
    id: string,
    reviewerId: string,
    status: Verification['status'],
    note?: string,
  ): Verification | undefined {
    return mutate((db) => {
      const record = db.verifications.find((v) => v.id === id);
      if (!record) return undefined;

      record.status = status;
      record.reviewerId = reviewerId;
      record.note = note;
      record.decidedAt = nowIso();

      const approved = status === 'APPROVED';
      const farm = db.farms.find((f) => f.userId === record.subjectId);
      if (farm) {
        farm.isVerified = approved;
        farm.verifiedAt = approved ? nowIso() : undefined;
      }
      const business = db.businesses.find((b) => b.userId === record.subjectId);
      if (business) {
        business.isVerified = approved;
        business.verifiedAt = approved ? nowIso() : undefined;
      }
      const buyer = db.buyers.find((b) => b.userId === record.subjectId);
      if (buyer) {
        buyer.isVerified = approved;
        buyer.verifiedAt = approved ? nowIso() : undefined;
      }

      return record;
    });
  },
};

// ── Analytics ────────────────────────────────────────────────────────────────

export const analytics = {
  /**
   * Privacy-conscious by design: no IP, no user agent, no cross-site
   * identifier. userId is optional and omitted for anonymous traffic.
   */
  record(input: Omit<AnalyticsEvent, 'id' | 'occurredAt'>): void {
    mutate((db) => {
      db.analyticsEvents.push({ ...input, id: newId('event'), occurredAt: nowIso() });
      // Bounded in the memory adapter; the Prisma adapter rolls these up.
      if (db.analyticsEvents.length > 5000) db.analyticsEvents.splice(0, 1000);
    });
  },

  /** Search terms are stored with no user linkage at all. */
  recordSearch(term: string, resultCount: number, countryCode?: string): void {
    mutate((db) => {
      db.searchQueries.push({
        id: newId('search'),
        term: term.trim().toLowerCase().slice(0, 80),
        countryCode,
        resultCount,
        occurredAt: nowIso(),
      });
      if (db.searchQueries.length > 2000) db.searchQueries.splice(0, 500);
    });
  },

  topSearchTerms(limit = 10): Array<{ term: string; count: number }> {
    const counts = new Map<string, number>();
    for (const query of data().searchQueries) {
      counts.set(query.term, (counts.get(query.term) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  eventCount(type: string): number {
    return data().analyticsEvents.filter((e) => e.type === type).length;
  },
};
