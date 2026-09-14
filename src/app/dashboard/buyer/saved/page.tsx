import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { buyerNav } from '@/components/dashboard/BuyerNav';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { FarmerCard } from '@/components/marketplace/FarmerCard';
import { EmptyState } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Saved' };
export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const { user } = await requireRole('BUYER', '/dashboard/buyer/saved');

  const savedListingIds = db.favorites.forUser(user.id, 'LISTING').map((f) => f.targetId);
  const listings = savedListingIds
    .map((id) => db.listings.viewById(id))
    .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing));

  const savedFarmIds = db.favorites.forUser(user.id, 'FARM').map((f) => f.targetId);
  const farms = savedFarmIds
    .map((id) => db.profiles.farmById(id))
    .filter((farm): farm is NonNullable<typeof farm> => Boolean(farm));

  return (
    <DashboardShell title="Saved" nav={buyerNav()} activeHref="/dashboard/buyer/saved">
      <section className="mb-10">
        <h2 className="text-h2 mb-4">Saved listings</h2>
        {listings.length > 0 ? (
          <ListingCardGrid listings={listings} signedIn savedIds={new Set(savedListingIds)} />
        ) : (
          <EmptyState
            title="No saved listings yet."
            description="Save a listing while browsing to find it here later."
            action={<ButtonLink href="/market">Explore the Market</ButtonLink>}
          />
        )}
      </section>

      <section>
        <h2 className="text-h2 mb-4">Saved farms</h2>
        {farms.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {farms.map((farm) => {
              const region = db.locations.region(farm.regionId);
              const community = farm.communityId ? db.locations.community(farm.communityId) : undefined;
              return (
                <FarmerCard
                  key={farm.id}
                  farm={farm}
                  regionName={region?.name ?? ''}
                  communityName={community?.name}
                  isPremium={db.premium.isPremium(farm.userId)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No saved farms yet."
            action={<ButtonLink href="/farmers">Browse Farmers</ButtonLink>}
          />
        )}
      </section>
    </DashboardShell>
  );
}
