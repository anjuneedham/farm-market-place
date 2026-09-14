import { db } from '@/lib/db/repositories';
import type { RelatedRefType } from '@/lib/types';

export type RelatedResolved = {
  kind: string;
  label: string;
  sublabel?: string;
  href: string;
};

/**
 * Resolves a loose `{ relatedType, relatedId }` reference (Community post,
 * Academy course) into something a page can render. Returns undefined if the
 * referenced record no longer exists — a post never renders a link to
 * nothing, and a stale id from a deleted listing just quietly drops the
 * "Related on AgriLoop" panel rather than erroring.
 */
export function resolveRelatedRef(type: RelatedRefType, id: string): RelatedResolved | undefined {
  switch (type) {
    case 'LISTING': {
      const listing = db.listings.viewById(id);
      if (!listing) return undefined;
      return {
        kind: 'Product',
        label: listing.title,
        sublabel: `Sold by ${listing.sellerName}`,
        href: `/market/listing/${listing.slug}`,
      };
    }
    case 'FARM': {
      const farm = db.profiles.farmById(id);
      if (!farm) return undefined;
      return { kind: 'Farm', label: farm.name, href: `/farmers/${farm.slug}` };
    }
    case 'BUSINESS': {
      const business = db.profiles.businessById(id);
      if (!business) return undefined;
      return { kind: 'Business', label: business.name, href: `/businesses/${business.slug}` };
    }
    case 'BUYER_REQUEST': {
      const request = db.buyerRequests.byId(id);
      if (!request) return undefined;
      return { kind: 'Buyer Request', label: request.title, href: `/requests/${request.slug}` };
    }
    case 'CATEGORY': {
      const category = db.catalog.byId(id);
      if (!category) return undefined;
      return {
        kind: 'Marketplace category',
        label: category.name,
        href: `/market?category=${category.slug}`,
      };
    }
    default:
      return undefined;
  }
}
