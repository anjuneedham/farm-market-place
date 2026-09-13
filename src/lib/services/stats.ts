import { db } from '@/lib/db/repositories';

/**
 * Platform metrics.
 *
 * Every figure here is counted from real records. Nothing is estimated,
 * projected or padded, and a zero renders as a zero.
 */
export type PlatformStats = {
  farmers: number;
  buyers: number;
  businesses: number;
  totalUsers: number;
  activeListings: number;
  openRequests: number;
  communityPosts: number;
  academyLessons: number;
  freeCourses: number;
  orders: number;
  premiumSubscribers: number;
  openReports: number;
  pendingVerifications: number;
  parishesCovered: number;
};

export function platformStats(countryCode?: string): PlatformStats {
  const listingRegions = new Set(
    db.listings
      .search({ countryCode, perPage: 60, page: 1 })
      .items.map((listing) => listing.regionId),
  );

  return {
    farmers: db.users.countByRole('FARMER'),
    buyers: db.users.countByRole('BUYER'),
    businesses: db.users.countByRole('BUSINESS'),
    totalUsers:
      db.users.countByRole('FARMER') +
      db.users.countByRole('BUYER') +
      db.users.countByRole('BUSINESS'),
    activeListings: db.listings.totalActive(countryCode),
    openRequests: db.buyerRequests.openCount(countryCode),
    communityPosts: db.community.totalPosts(),
    academyLessons: db.academy.totalLessons(),
    freeCourses: db.academy.freeCourseCount(),
    orders: db.orders.total(),
    premiumSubscribers: db.premium.activeSubscriberCount(),
    openReports: db.moderation.openReportCount(),
    pendingVerifications: db.verification.pending().length,
    parishesCovered: listingRegions.size,
  };
}

/** Per-listing metrics for the farmer dashboard, from recorded activity only. */
export function sellerStats(sellerId: string) {
  const listings = db.listings.forSeller(sellerId, { perPage: 60 }).items;
  const views = listings.reduce((sum, listing) => sum + listing.viewCount, 0);
  const saves = listings.reduce(
    (sum, listing) => sum + db.favorites.countFor('LISTING', listing.id),
    0,
  );

  return {
    activeListings: listings.filter((l) => l.status === 'ACTIVE').length,
    totalListings: listings.length,
    views,
    saves,
    conversations: db.conversations.forUser(sellerId).length,
    unreadMessages: db.conversations.unreadCount(sellerId),
    requestResponses: db.buyerRequests.responseCountFor(sellerId),
    orders: db.orders.countFor(sellerId, 'seller'),
    completedOrders: db.orders.countFor(sellerId, 'seller', 'COMPLETED'),
    revenueMinor: db.orders.revenueFor(sellerId),
    topListings: [...listings].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
  };
}

export function buyerStats(buyerId: string) {
  return {
    orders: db.orders.countFor(buyerId, 'buyer'),
    completedOrders: db.orders.countFor(buyerId, 'buyer', 'COMPLETED'),
    savedListings: db.favorites.forUser(buyerId, 'LISTING').length,
    savedFarms: db.favorites.forUser(buyerId, 'FARM').length,
    openRequests: db.buyerRequests.search({ buyerId, status: 'OPEN', perPage: 60 }).total,
    shoppingLists: db.shoppingLists.countFor(buyerId),
    unreadMessages: db.conversations.unreadCount(buyerId),
    savings: db.orders.savingsFor(buyerId),
  };
}
