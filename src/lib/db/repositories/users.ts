/**
 * The in-memory demo/seed copy of people and their profiles — read by
 * marketplace display surfaces (directories, listings, search, admin's demo
 * views) exactly as before Supabase Auth was introduced.
 *
 * This is NOT where authentication or a signed-in user's own account lives
 * anymore — that's src/lib/supabase/account.ts, backed by real Supabase
 * Postgres tables with the same ids as the demo people seeded here (see
 * src/lib/db/seed/helpers.ts's demoUserId()), so both stores agree on who's
 * who. A real (non-demo) signup only ever writes to Supabase; it has no
 * shadow row here, so it won't appear in these in-memory-backed pages yet —
 * see the migration report for the full Tier 1/Tier 2 explanation.
 */
import { data, mutate } from '../datasource';
import type {
  BusinessProfile,
  BuyerProfile,
  FarmProfile,
  PublicUser,
  User,
  UserRole,
} from '@/lib/types';
import { newId, nowIso, paginate, uniqueSlug } from './common';
import type { Paginated, PageParams } from '@/lib/types';

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export const users = {
  byId(id: string): User | undefined {
    return data().users.find((u) => u.id === id);
  },

  publicById(id: string): PublicUser | undefined {
    const user = this.byId(id);
    return user ? toPublicUser(user) : undefined;
  },

  list(
    filters: { role?: UserRole; status?: User['status']; search?: string } & PageParams = {},
  ): Paginated<User> {
    let items = [...data().users];
    if (filters.role) items = items.filter((u) => u.role === filters.role);
    if (filters.status) items = items.filter((u) => u.status === filters.status);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
      );
    }
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginate(items, filters);
  },

  countByRole(role: UserRole): number {
    return data().users.filter((u) => u.role === role).length;
  },

  update(id: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
    return mutate((db) => {
      const user = db.users.find((u) => u.id === id);
      if (!user) return undefined;
      Object.assign(user, patch, { updatedAt: nowIso() });
      return user;
    });
  },

  touch(id: string): void {
    mutate((db) => {
      const user = db.users.find((u) => u.id === id);
      if (user) user.lastSeenAt = nowIso();
    });
  },
};

export const profiles = {
  farmByUserId(userId: string): FarmProfile | undefined {
    return data().farms.find((f) => f.userId === userId);
  },

  farmBySlug(slug: string): FarmProfile | undefined {
    return data().farms.find((f) => f.slug === slug);
  },

  farmById(id: string): FarmProfile | undefined {
    return data().farms.find((f) => f.id === id);
  },

  businessByUserId(userId: string): BusinessProfile | undefined {
    return data().businesses.find((b) => b.userId === userId);
  },

  businessBySlug(slug: string): BusinessProfile | undefined {
    return data().businesses.find((b) => b.slug === slug);
  },

  businessById(id: string): BusinessProfile | undefined {
    return data().businesses.find((b) => b.id === id);
  },

  buyerByUserId(userId: string): BuyerProfile | undefined {
    return data().buyers.find((b) => b.userId === userId);
  },

  buyerBySlug(slug: string): BuyerProfile | undefined {
    return data().buyers.find((b) => b.slug === slug);
  },

  listFarms(
    filters: {
      countryCode?: string;
      regionId?: string;
      verifiedOnly?: boolean;
      specialty?: string;
      search?: string;
    } & PageParams = {},
  ): Paginated<FarmProfile> {
    let items = [...data().farms];
    if (filters.countryCode) items = items.filter((f) => f.countryCode === filters.countryCode);
    if (filters.regionId) items = items.filter((f) => f.regionId === filters.regionId);
    if (filters.verifiedOnly) items = items.filter((f) => f.isVerified);
    if (filters.specialty) {
      const term = filters.specialty.toLowerCase();
      items = items.filter((f) => f.specialties.some((s) => s.toLowerCase().includes(term)));
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.specialties.some((s) => s.toLowerCase().includes(term)) ||
          (f.tagline ?? '').toLowerCase().includes(term),
      );
    }
    // Verified farms first, then by rating — the trust signal leads discovery.
    items.sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return b.ratingAverage - a.ratingAverage;
    });
    return paginate(items, filters);
  },

  listBusinesses(
    filters: {
      countryCode?: string;
      regionId?: string;
      type?: BusinessProfile['type'];
      verifiedOnly?: boolean;
      search?: string;
    } & PageParams = {},
  ): Paginated<BusinessProfile> {
    let items = [...data().businesses];
    if (filters.countryCode) items = items.filter((b) => b.countryCode === filters.countryCode);
    if (filters.regionId) items = items.filter((b) => b.regionId === filters.regionId);
    if (filters.type) items = items.filter((b) => b.type === filters.type);
    if (filters.verifiedOnly) items = items.filter((b) => b.isVerified);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.servicesOffered.some((s) => s.toLowerCase().includes(term)),
      );
    }
    items.sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return b.ratingAverage - a.ratingAverage;
    });
    return paginate(items, filters);
  },

  createFarm(
    input: Omit<
      FarmProfile,
      | 'id'
      | 'slug'
      | 'createdAt'
      | 'updatedAt'
      | 'isVerified'
      | 'verifiedAt'
      | 'ratingAverage'
      | 'ratingCount'
      | 'followerCount'
      | 'isDemoData'
    >,
  ): FarmProfile {
    return mutate((db) => {
      const farm: FarmProfile = {
        ...input,
        id: newId('farm'),
        slug: uniqueSlug(
          input.name,
          db.farms.map((f) => f.slug),
        ),
        isVerified: false,
        ratingAverage: 0,
        ratingCount: 0,
        followerCount: 0,
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.farms.push(farm);
      return farm;
    });
  },

  updateFarm(id: string, patch: Partial<FarmProfile>): FarmProfile | undefined {
    return mutate((db) => {
      const farm = db.farms.find((f) => f.id === id);
      if (!farm) return undefined;
      Object.assign(farm, patch, { updatedAt: nowIso() });
      return farm;
    });
  },

  createBuyer(
    input: Omit<
      BuyerProfile,
      | 'id'
      | 'slug'
      | 'createdAt'
      | 'updatedAt'
      | 'isVerified'
      | 'verifiedAt'
      | 'ratingAverage'
      | 'ratingCount'
      | 'isDemoData'
    >,
  ): BuyerProfile {
    return mutate((db) => {
      const buyer: BuyerProfile = {
        ...input,
        id: newId('buyer'),
        slug: uniqueSlug(
          input.displayName,
          db.buyers.map((b) => b.slug),
        ),
        isVerified: false,
        ratingAverage: 0,
        ratingCount: 0,
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.buyers.push(buyer);
      return buyer;
    });
  },

  updateBuyer(id: string, patch: Partial<BuyerProfile>): BuyerProfile | undefined {
    return mutate((db) => {
      const buyer = db.buyers.find((b) => b.id === id);
      if (!buyer) return undefined;
      Object.assign(buyer, patch, { updatedAt: nowIso() });
      return buyer;
    });
  },

  createBusiness(
    input: Omit<
      BusinessProfile,
      | 'id'
      | 'slug'
      | 'createdAt'
      | 'updatedAt'
      | 'isVerified'
      | 'verifiedAt'
      | 'ratingAverage'
      | 'ratingCount'
      | 'isDemoData'
    >,
  ): BusinessProfile {
    return mutate((db) => {
      const business: BusinessProfile = {
        ...input,
        id: newId('business'),
        slug: uniqueSlug(
          input.name,
          db.businesses.map((b) => b.slug),
        ),
        isVerified: false,
        ratingAverage: 0,
        ratingCount: 0,
        isDemoData: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.businesses.push(business);
      return business;
    });
  },

  updateBusiness(id: string, patch: Partial<BusinessProfile>): BusinessProfile | undefined {
    return mutate((db) => {
      const business = db.businesses.find((b) => b.id === id);
      if (!business) return undefined;
      Object.assign(business, patch, { updatedAt: nowIso() });
      return business;
    });
  },

  /**
   * The display name and public link for any user, whatever their role.
   * Used by messaging, community and reviews, which all deal in "a user".
   */
  displayFor(userId: string): { label: string; href?: string; verified: boolean } {
    const farm = this.farmByUserId(userId);
    if (farm) return { label: farm.name, href: `/farmers/${farm.slug}`, verified: farm.isVerified };

    const business = this.businessByUserId(userId);
    if (business) {
      return {
        label: business.name,
        href: `/businesses/${business.slug}`,
        verified: business.isVerified,
      };
    }

    const buyer = this.buyerByUserId(userId);
    if (buyer) return { label: buyer.displayName, verified: buyer.isVerified };

    const user = users.byId(userId);
    return { label: user?.name ?? 'AgriLoop member', verified: false };
  },
};
