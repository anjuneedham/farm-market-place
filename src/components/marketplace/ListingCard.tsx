import Link from 'next/link';
import { MapPin, MessageCircle } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { AvailabilityBadge, FeaturedBadge, VerifiedBadge, WholesaleBadge } from '@/components/ui/Badge';
import { ListingPrice } from '@/components/ui/Money';
import { ProduceSwatch } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';
import { SaveButton } from '@/components/marketplace/SaveButton';
import type { ListingView } from '@/lib/types';

/**
 * Image-first marketplace card. When a listing has no photo (most seed data,
 * honestly — AgriLoop does not fabricate stock photography), a stable colour
 * swatch keyed to the product name stands in rather than a broken image icon.
 *
 * `signedIn`/`saved` are best-effort context passed by the page: pages that
 * already resolve the viewer (most do) pass the real values, so Save behaves
 * correctly; pages that render this card on a cached/static path (the home
 * preview) fall back to the guest state, which SaveButton already handles by
 * routing to sign-in — never a broken or silently-wrong button.
 */
export function ListingCard({
  listing,
  signedIn = false,
  saved = false,
}: {
  listing: ListingView;
  signedIn?: boolean;
  saved?: boolean;
}) {
  const image = listing.imageUrls[0];
  const href = `/market/listing/${listing.slug}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-brand-300 hover:bg-brand-50/40">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-brand-50">
        <Link href={href} className="absolute inset-0 block" aria-label={listing.title}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <ProduceSwatch seed={listing.title} className="h-full w-full" />
          )}
        </Link>
        {listing.isFeatured ? (
          <div className="pointer-events-none absolute left-2 top-2">
            <FeaturedBadge />
          </div>
        ) : null}
        <div className="absolute right-2 top-2">
          <SaveButton
            listingId={listing.id}
            initiallySaved={saved}
            signedIn={signedIn}
            className="h-9 w-9 border-none bg-surface/90 shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <Link href={href} className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-ink-900">
          {listing.title}
        </h3>

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
      </Link>

      <div className="flex gap-2 border-t border-line p-3">
        <ButtonLink href={href} variant="secondary" size="sm" fullWidth>
          View
        </ButtonLink>
        <ButtonLink href={`${href}#contact`} size="sm" fullWidth>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {listing.wholesaleAvailable ? 'Request Quote' : 'Contact'}
        </ButtonLink>
      </div>
    </div>
  );
}

export function ListingCardGrid({
  listings,
  signedIn = false,
  savedIds,
}: {
  listings: ListingView[];
  signedIn?: boolean;
  savedIds?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          signedIn={signedIn}
          saved={savedIds?.has(listing.id) ?? false}
        />
      ))}
    </div>
  );
}
