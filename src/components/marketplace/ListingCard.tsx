import { MapPin } from 'lucide-react';
import { CardLink } from '@/components/ui/Card';
import { AvailabilityBadge, FeaturedBadge, VerifiedBadge, WholesaleBadge } from '@/components/ui/Badge';
import { ListingPrice } from '@/components/ui/Money';
import { ProduceSwatch } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';
import type { ListingView } from '@/lib/types';

/**
 * Image-first marketplace card. When a listing has no photo (most seed data,
 * honestly — AgriLoop does not fabricate stock photography), a stable colour
 * swatch keyed to the product name stands in rather than a broken image icon.
 */
export function ListingCard({ listing }: { listing: ListingView }) {
  const image = listing.imageUrls[0];

  return (
    <CardLink href={`/market/listing/${listing.slug}`} className="group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-brand-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <ProduceSwatch seed={listing.title} className="h-full w-full" />
        )}
        {listing.isFeatured ? (
          <div className="absolute left-2 top-2">
            <FeaturedBadge />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-ink-900">
            {listing.title}
          </h3>
        </div>

        <ListingPrice
          pricingMode={listing.pricingMode}
          priceMinor={listing.priceMinor}
          currency={listing.currency}
          unit={listing.unit}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <AvailabilityBadge availability={listing.availability} />
          {listing.wholesaleAvailable ? <WholesaleBadge /> : null}
        </div>

        <div className="mt-auto space-y-1.5 pt-2">
          <div className="flex items-center gap-1 text-sm text-ink-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              {listing.community ? `${listing.community.name}, ` : ''}
              {listing.region.name}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm text-ink-700">{listing.sellerName}</span>
            {listing.sellerVerified ? <VerifiedBadge kind="" /> : null}
          </div>
          {listing.sellerRatingCount > 0 ? (
            <Rating average={listing.sellerRating} count={listing.sellerRatingCount} size="sm" />
          ) : null}
        </div>
      </div>
    </CardLink>
  );
}

export function ListingCardGrid({ listings }: { listings: ListingView[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
