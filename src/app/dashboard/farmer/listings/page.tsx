import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { farmerNav } from '@/components/dashboard/FarmerNav';
import { ButtonLink } from '@/components/ui/Button';
import { AvailabilityBadge, FeaturedBadge } from '@/components/ui/Badge';
import { ListingPrice } from '@/components/ui/Money';
import { EmptyState } from '@/components/ui/States';
import { ListingStatusMenu } from './ListingStatusMenu';

export const metadata: Metadata = { title: 'My Listings' };
export const dynamic = 'force-dynamic';

export default async function FarmerListingsPage() {
  const { user } = await requireRole(['FARMER', 'BUSINESS'], '/dashboard/farmer/listings');
  const results = db.listings.forSeller(user.id, { perPage: 60 });

  return (
    <DashboardShell
      title="My Listings"
      nav={farmerNav()}
      activeHref="/dashboard/farmer/listings"
      action={<ButtonLink href="/dashboard/farmer/listings/new">Add Listing</ButtonLink>}
    >
      {results.items.length > 0 ? (
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {results.items.map((listing) => (
            <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-ink-900">{listing.title}</p>
                  {listing.featuredUntil && Date.parse(listing.featuredUntil) > Date.now() ? <FeaturedBadge /> : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <AvailabilityBadge availability={listing.availability} />
                  <ListingPrice
                    pricingMode={listing.pricingMode}
                    priceMinor={listing.priceMinor}
                    currency={listing.currency}
                    unit={listing.unit}
                    className="text-sm"
                  />
                  <span className="text-xs text-ink-400">{listing.viewCount} views</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ButtonLink href={`/dashboard/farmer/listings/${listing.id}/edit`} size="sm" variant="secondary">
                  Edit
                </ButtonLink>
                <ListingStatusMenu listingId={listing.id} currentStatus={listing.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your farm isn't listed yet. Add your first product."
          action={<ButtonLink href="/dashboard/farmer/listings/new">Add Listing</ButtonLink>}
        />
      )}
    </DashboardShell>
  );
}
