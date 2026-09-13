import type { BuyerRequest, CommunityPost, Listing, User } from '@/lib/types';

/**
 * Every authorization rule in AgriLoop lives here. Pages and components never
 * inline role logic; they call `can()`.
 *
 * Ownership is always derived from the session user passed in — never from a
 * request body (docs/SECURITY.md §2).
 */

export type Action =
  | 'listing:create'
  | 'listing:update'
  | 'listing:delete'
  | 'request:create'
  | 'request:update'
  | 'request:respond'
  | 'post:create'
  | 'post:update'
  | 'comment:create'
  | 'message:send'
  | 'review:write'
  | 'order:create'
  | 'order:update'
  | 'admin:access';

type Subject = Listing | BuyerRequest | CommunityPost | undefined;

const SELLER_ROLES = new Set<User['role']>(['FARMER', 'BUSINESS']);

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === 'ADMIN';
}

export function canSell(user: User | null | undefined): boolean {
  return Boolean(user && SELLER_ROLES.has(user.role));
}

export function can(user: User | null | undefined, action: Action, subject?: Subject): boolean {
  if (!user || user.status !== 'ACTIVE') return false;
  if (user.role === 'ADMIN') return true;

  switch (action) {
    case 'admin:access':
      return false;

    case 'listing:create':
      return canSell(user);

    case 'listing:update':
    case 'listing:delete': {
      const listing = subject as Listing | undefined;
      return canSell(user) && Boolean(listing && listing.sellerId === user.id);
    }

    case 'request:create':
      // Anyone can express demand, including a farmer sourcing inputs.
      return true;

    case 'request:update': {
      const request = subject as BuyerRequest | undefined;
      return Boolean(request && request.buyerId === user.id);
    }

    case 'request:respond':
      // Sellers respond to demand; a buyer cannot quote on another buyer's request.
      return canSell(user);

    case 'post:create':
    case 'comment:create':
    case 'message:send':
    case 'review:write':
    case 'order:create':
      return true;

    case 'post:update': {
      const post = subject as CommunityPost | undefined;
      return Boolean(post && post.authorId === user.id);
    }

    case 'order:update':
      return true;

    default:
      return false;
  }
}

/** The dashboard a user lands on after signing in. */
export function dashboardPathFor(user: User): string {
  switch (user.role) {
    case 'ADMIN':
      return '/admin';
    case 'FARMER':
    case 'BUSINESS':
      return '/dashboard/farmer';
    case 'BUYER':
      return '/dashboard/buyer';
    default:
      return '/';
  }
}
