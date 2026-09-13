import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { getDefaultCountry } from '@/lib/location';
import { FarmerCard } from '@/components/marketplace/FarmerCard';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Farmers',
  description: 'Discover verified farmers across Jamaica by parish, specialty and rating.',
};

export const revalidate = 60;

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; region?: string; q?: string }>;
}) {
  const params = await searchParams;
  const country = getDefaultCountry();
  const region = params.region ? db.locations.regionBySlug(country.code, params.region) : undefined;

  const results = db.profiles.listFarms({
    countryCode: country.code,
    regionId: region?.id,
    search: params.q,
    page: params.page ? Number(params.page) : 1,
  });

  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <h1 className="text-h1">Farmers</h1>
      <p className="mt-1 text-ink-600">{results.total} farm profiles across Jamaica.</p>

      <div className="mt-6">
        {results.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.items.map((farm) => {
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
          <EmptyState
            title="No farmer profiles yet."
            description="Be one of the first farms discoverable on AgriLoop."
            action={<ButtonLink href="/signup?role=FARMER">Create Your Farm Profile</ButtonLink>}
          />
        )}
      </div>

      <Pagination page={results.page} totalPages={totalPages} basePath="/farmers" params={params} />
    </div>
  );
}
