import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { getDefaultCountry, sortByRegionProximity, distanceIndex } from '@/lib/location';
import { NearYouLocator } from '@/components/location/NearYouLocator';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { FarmerCard } from '@/components/marketplace/FarmerCard';
import { CardLink, SectionHeader } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { Checkbox, Select } from '@/components/ui/Field';
import { humanise } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Near You',
  description: 'Find farmers, businesses and listings close to you, anywhere in Jamaica.',
};

type SearchParams = { region?: string; category?: string; verified?: string };

export default async function NearYouPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const country = getDefaultCountry();
  const regions = db.locations.regions(country.code);
  const origin = params.region ? db.locations.regionBySlug(country.code, params.region) : undefined;

  if (!origin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        <h1 className="text-h1">Near You</h1>
        <p className="mt-2 text-ink-600">
          Find farmers, businesses and listings close to you — anywhere in {country.name}.
        </p>
        <div className="mt-6">
          <NearYouLocator regions={regions} />
        </div>
      </div>
    );
  }

  const categories = db.catalog.categories();
  const category = params.category ? db.catalog.bySlug(params.category) : undefined;
  const verifiedOnly = params.verified === 'true';
  const distances = distanceIndex(origin, regions);

  const user = await getCurrentUser();
  const savedListingIds = user
    ? new Set(db.favorites.forUser(user.id, 'LISTING').map((f) => f.targetId))
    : undefined;

  const listings = sortByRegionProximity(
    db.listings.search({ countryCode: country.code, categoryId: category?.id, verifiedOnly, perPage: 300 }).items,
    origin.id,
    distances,
  ).slice(0, 24);

  const farms = sortByRegionProximity(
    db.profiles.listFarms({ countryCode: country.code, verifiedOnly, perPage: 200 }).items,
    origin.id,
    distances,
  ).slice(0, 8);

  const businesses = sortByRegionProximity(
    db.profiles.listBusinesses({ countryCode: country.code, verifiedOnly, perPage: 200 }).items,
    origin.id,
    distances,
  ).slice(0, 8);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1">Near You</h1>
          <p className="mt-1 flex items-center gap-1.5 text-ink-600">
            <MapPin className="h-4 w-4" aria-hidden />
            Showing results closest to {origin.name}
          </p>
        </div>
        <a href="/near-you" className="text-sm font-medium text-brand-600 hover:underline">
          Change location
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface p-3">
        <form action="/near-you" method="get" className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="region" value={origin.slug} />
          <Select name="category" defaultValue={category?.slug ?? ''} aria-label="Category" className="w-auto">
            <option value="">All categories</option>
            {categories
              .filter((c) => c.level === 0)
              .map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
          </Select>
          <Checkbox label="Verified only" name="verified" value="true" defaultChecked={verifiedOnly} />
          <button type="submit" className="text-sm font-medium text-brand-600 hover:underline">
            Apply
          </button>
        </form>
      </div>

      <section className="mt-10">
        <SectionHeader eyebrow="Supply" title="Farmers near you" />
        {farms.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {farms.map((farm) => {
              const farmRegion = db.locations.region(farm.regionId);
              const community = farm.communityId ? db.locations.community(farm.communityId) : undefined;
              return (
                <FarmerCard
                  key={farm.id}
                  farm={farm}
                  regionName={farmRegion?.name ?? ''}
                  communityName={community?.name}
                  isPremium={db.premium.isPremium(farm.userId)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState title="No farmers found near this parish yet." />
        )}
      </section>

      <section className="mt-10">
        <SectionHeader eyebrow="Supply" title="Businesses near you" />
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {businesses.map((business) => {
              const bRegion = db.locations.region(business.regionId);
              return (
                <CardLink key={business.id} href={`/businesses/${business.slug}`} className="p-4">
                  <p className="font-semibold text-ink-900">{business.name}</p>
                  <p className="mt-0.5 text-sm text-ink-500">{humanise(business.type)}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-ink-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {bRegion?.name}
                  </div>
                  {business.isVerified ? (
                    <div className="mt-2">
                      <VerifiedBadge kind="Business" />
                    </div>
                  ) : null}
                </CardLink>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No businesses found near this parish yet." />
        )}
      </section>

      <section className="mt-10">
        <SectionHeader eyebrow="Products" title="Listings near you" />
        {listings.length > 0 ? (
          <ListingCardGrid listings={listings} signedIn={Boolean(user)} savedIds={savedListingIds} />
        ) : (
          <EmptyState
            title="No listings found near this parish yet."
            description="Try a different category, or turn off the verified filter."
          />
        )}
      </section>
    </div>
  );
}
