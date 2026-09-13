import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { getDefaultCountry } from '@/lib/location';
import { marketplaceService } from '@/lib/services/marketplace';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { CategoryRail } from '@/components/marketplace/CategoryRail';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { ButtonLink } from '@/components/ui/Button';
import type { ListingFilters } from '@/lib/db/repositories';

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse fresh produce, livestock, farm products, supplies, equipment and services from farmers and businesses across Jamaica.',
};

export const revalidate = 60;

type SearchParams = Record<string, string | undefined>;

export default async function MarketPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const country = getDefaultCountry();

  const category = params.category ? db.catalog.bySlug(params.category) : undefined;
  const region = params.region ? db.locations.regionBySlug(country.code, params.region) : undefined;

  const filters: ListingFilters = {
    countryCode: country.code,
    categoryId: category?.id,
    regionId: region?.id,
    search: params.q,
    wholesaleOnly: params.wholesale === 'true',
    verifiedOnly: params.verified === 'true',
    sort: (params.sort as ListingFilters['sort']) ?? 'recent',
    page: params.page ? Number(params.page) : 1,
  };

  const results = marketplaceService.search(filters);
  marketplaceService.logSearch(params.q ?? '', results, country.code);

  const categories = db.catalog.categories();
  const regions = db.locations.regions(country.code);
  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-h1">Marketplace</h1>
        <p className="mt-1 text-ink-600">
          {results.total} listing{results.total === 1 ? '' : 's'}
          {category ? ` in ${category.name}` : ''}
          {region ? ` · ${region.name}` : ''}
        </p>
      </div>

      <CategoryRail categories={categories} activeSlug={category?.slug} />

      <div className="mt-4">
        <FilterBar categories={categories} regions={regions} basePath="/market" />
      </div>

      <div className="mt-6">
        {results.items.length > 0 ? (
          <ListingCardGrid listings={results.items} />
        ) : (
          <EmptyState
            title="Be one of the first farmers in this category."
            description="No listings match yet. Try a different filter, or be the one who fills this space."
            action={<ButtonLink href="/signup?role=FARMER">List Your Product</ButtonLink>}
          />
        )}
      </div>

      <Pagination page={results.page} totalPages={totalPages} basePath="/market" params={params} />
    </div>
  );
}
