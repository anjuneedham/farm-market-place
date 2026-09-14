import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { marketplaceService } from '@/lib/services/marketplace';
import { ButtonLink } from '@/components/ui/Button';
import { AvailabilityBadge, PremiumBadge, VerifiedBadge, WholesaleBadge } from '@/components/ui/Badge';
import { ListingPrice, Money } from '@/components/ui/Money';
import { Rating } from '@/components/ui/Rating';
import { ProduceSwatch } from '@/components/ui/Avatar';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { SaveButton } from '@/components/marketplace/SaveButton';
import { ShareButton } from '@/components/marketplace/ShareButton';
import { ContactSellerPanel } from '@/components/marketplace/ContactSellerPanel';
import { ReportButton } from '@/components/marketplace/ReportButton';
import { humanise, timeAgo } from '@/lib/utils';

export const revalidate = 60;

async function getListing(slug: string) {
  return db.listings.viewBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return {};

  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${listing.title} — AgriLoop`,
      description: listing.description.slice(0, 160),
      images: listing.imageUrls[0] ? [listing.imageUrls[0]] : undefined,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const user = await getCurrentUser();
  marketplaceService.recordView(listing, user?.id);

  const related = marketplaceService.relatedTo(listing);
  const moreFromSeller = marketplaceService.fromSameSeller(listing);
  const savedInitially = user ? db.favorites.has(user.id, 'LISTING', listing.id) : false;
  const savedListingIds = user
    ? new Set(db.favorites.forUser(user.id, 'LISTING').map((f) => f.targetId))
    : undefined;
  const isOwner = user?.id === listing.sellerId;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-500" aria-label="Breadcrumb">
        <Link href="/market" className="hover:text-brand-600">Market</Link>
        <span aria-hidden>/</span>
        {listing.parentCategory ? (
          <>
            <Link href={`/market?category=${listing.parentCategory.slug}`} className="hover:text-brand-600">
              {listing.parentCategory.name}
            </Link>
            <span aria-hidden>/</span>
          </>
        ) : null}
        <Link href={`/market?category=${listing.category.slug}`} className="hover:text-brand-600">
          {listing.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-brand-50 sm:aspect-[16/10]">
            {listing.imageUrls[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.imageUrls[0]} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <ProduceSwatch seed={listing.title} className="h-full w-full" />
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-h1">{listing.title}</h1>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
                <MapPin className="h-4 w-4" aria-hidden />
                {listing.community ? `${listing.community.name}, ` : ''}
                {listing.region.name}, {listing.country.name}
                <span aria-hidden>·</span>
                {timeAgo(listing.createdAt)}
              </div>
            </div>
            <div className="flex gap-2">
              <ShareButton title={listing.title} />
              <SaveButton listingId={listing.id} initiallySaved={savedInitially} signedIn={Boolean(user)} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AvailabilityBadge availability={listing.availability} />
            {listing.wholesaleAvailable ? <WholesaleBadge /> : null}
          </div>

          <div className="prose-agriloop mt-6">
            <p style={{ whiteSpace: 'pre-wrap' }}>{listing.description}</p>
          </div>

          {listing.priceTiers.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-h3 mb-3 font-semibold">Wholesale &amp; bulk pricing</h2>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-sm">
                  <thead className="bg-canvas text-left text-ink-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Quantity</th>
                      <th className="px-4 py-2.5 font-medium">Price per {listing.unit}</th>
                      <th className="px-4 py-2.5 font-medium">Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listing.priceTiers.map((tier) => (
                      <tr key={tier.id} className="border-t border-line">
                        <td className="px-4 py-2.5 tabular">{tier.minQuantity}+ {listing.unit}</td>
                        <td className="px-4 py-2.5 font-medium tabular">
                          <Money minor={tier.unitPrice} currency={listing.currency} />
                        </td>
                        <td className="px-4 py-2.5 text-ink-500">{tier.label ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {moreFromSeller.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-h3 mb-3 font-semibold">More from {listing.sellerName}</h2>
              <ListingCardGrid listings={moreFromSeller} signedIn={Boolean(user)} savedIds={savedListingIds} />
            </div>
          ) : null}
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-line bg-surface p-5">
            <ListingPrice
              pricingMode={listing.pricingMode}
              priceMinor={listing.priceMinor}
              currency={listing.currency}
              unit={listing.unit}
              className="text-2xl"
            />
            <dl className="mt-4 space-y-2 text-sm">
              {listing.quantity !== undefined ? (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Available</dt>
                  <dd className="font-medium tabular">{listing.quantity} {listing.unit}</dd>
                </div>
              ) : null}
              {listing.minOrder !== undefined ? (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Minimum order</dt>
                  <dd className="font-medium tabular">{listing.minOrder} {listing.unit}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-ink-500">Pricing</dt>
                <dd className="font-medium">{humanise(listing.pricingMode)}</dd>
              </div>
            </dl>

            {!isOwner ? (
              <div id="contact" className="mt-5 scroll-mt-20">
                <ContactSellerPanel listing={listing} signedIn={Boolean(user)} />
              </div>
            ) : (
              <ButtonLink href={`/dashboard/farmer/listings/${listing.id}/edit`} fullWidth className="mt-5" variant="secondary">
                Edit your listing
              </ButtonLink>
            )}
          </div>

          <Link
            href={listing.sellerSlug ? `/farmers/${listing.sellerSlug}` : '#'}
            className="block rounded-lg border border-line bg-surface p-5 hover:border-brand-300"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-ink-900">{listing.sellerName}</p>
              {listing.sellerIsPremium ? <PremiumBadge /> : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {listing.sellerVerified ? (
                <VerifiedBadge kind={listing.sellerKind === 'BUSINESS' ? 'Business' : 'Farmer'} />
              ) : null}
            </div>
            {listing.sellerRatingCount > 0 ? (
              <div className="mt-2">
                <Rating average={listing.sellerRating} count={listing.sellerRatingCount} size="sm" />
              </div>
            ) : null}
            <p className="mt-3 text-sm font-medium text-brand-600">View profile →</p>
          </Link>

          {!isOwner ? (
            <div className="flex justify-end">
              <ReportButton targetType="LISTING" targetId={listing.id} signedIn={Boolean(user)} />
            </div>
          ) : null}
        </aside>
      </div>

      {related.length > 0 ? (
        <div className="mt-14">
          <h2 className="text-h2 mb-4">You might also like</h2>
          <ListingCardGrid listings={related} signedIn={Boolean(user)} savedIds={savedListingIds} />
        </div>
      ) : null}
    </div>
  );
}
