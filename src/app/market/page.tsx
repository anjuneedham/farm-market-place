import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ArrowRight, Clock, MapPin, Megaphone } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { getDefaultCountry } from '@/lib/location';
import { marketplaceService } from '@/lib/services/marketplace';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { FarmerCard } from '@/components/marketplace/FarmerCard';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { CategoryRail } from '@/components/marketplace/CategoryRail';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { ButtonLink } from '@/components/ui/Button';
import { CardLink, SectionHeader } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { humanise, timeAgo } from '@/lib/utils';
import type { ListingFilters } from '@/lib/db/repositories';

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse fresh produce, livestock, farm products, supplies, equipment and services from farmers and businesses across Jamaica.',
};

export const revalidate = 60;

type SearchParams = Record<string, string | undefined>;

const FILTER_KEYS = ['q', 'category', 'region', 'wholesale', 'verified', 'sort', 'page'] as const;

function MarketSection({
  eyebrow,
  title,
  description,
  viewAllHref,
  viewAllLabel = 'View all',
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          viewAllHref ? (
            <ButtonLink href={viewAllHref} variant="secondary" size="sm">
              {viewAllLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          ) : undefined
        }
      />
      {children}
    </section>
  );
}

export default async function MarketPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const country = getDefaultCountry();
  const user = await getCurrentUser();

  const category = params.category ? db.catalog.bySlug(params.category) : undefined;
  const region = params.region ? db.locations.regionBySlug(country.code, params.region) : undefined;
  const categories = db.catalog.categories();
  const regions = db.locations.regions(country.code);

  const hasActiveFilter = FILTER_KEYS.some((key) => Boolean(params[key]));

  const savedListingIds = user
    ? new Set(db.favorites.forUser(user.id, 'LISTING').map((f) => f.targetId))
    : undefined;

  if (hasActiveFilter) {
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
            <ListingCardGrid listings={results.items} signedIn={Boolean(user)} savedIds={savedListingIds} />
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

  // ── The marketplace homepage: curated sections, built from the same
  // repository queries as the filtered view above. Every section is real
  // data — none of it is fabricated to make the page feel fuller than it is.
  const totalActive = db.listings.totalActive(country.code);

  const freshProduce = db.catalog.bySlug('fresh-produce');
  const freshToday = freshProduce
    ? db.listings.search({ countryCode: country.code, categoryId: freshProduce.id, sort: 'recent', perPage: 8 }).items
    : [];

  const popularProducts = db.listings.search({ countryCode: country.code, sort: 'popular', perPage: 8 }).items;
  const wholesaleOpportunities = db.listings.search({
    countryCode: country.code,
    wholesaleOnly: true,
    sort: 'recent',
    perPage: 8,
  }).items;

  const featuredFarmers = db.profiles.listFarms({ countryCode: country.code, perPage: 4 }).items;

  const viewerRegionId = user
    ? (db.profiles.farmByUserId(user.id) ?? db.profiles.businessByUserId(user.id) ?? db.profiles.buyerByUserId(user.id))
        ?.regionId
    : undefined;
  const nearYou = viewerRegionId
    ? db.listings
        .search({ countryCode: country.code, regionId: viewerRegionId, sort: 'recent', perPage: 8 })
        .items.filter((l) => l.sellerId !== user?.id)
    : [];
  const nearYouRegionName = viewerRegionId ? db.locations.region(viewerRegionId)?.name : undefined;

  const buyerRequests = db.buyerRequests.search({ countryCode: country.code, perPage: 3 }).items;
  const recentlyAdded = db.listings.search({ countryCode: country.code, sort: 'recent', perPage: 8 }).items;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-h1">Marketplace</h1>
        <p className="mt-1 text-ink-600">
          {totalActive} active listing{totalActive === 1 ? '' : 's'} from farmers and businesses across{' '}
          {country.name}.
        </p>
      </div>

      <CategoryRail categories={categories} activeSlug={category?.slug} />

      <div className="mt-4">
        <FilterBar categories={categories} regions={regions} basePath="/market" />
      </div>

      {freshToday.length > 0 ? (
        <MarketSection
          eyebrow="Just listed"
          title="Fresh today"
          description="The newest produce listings — vegetables, fruit, ground provisions, herbs and spices."
          viewAllHref="/market?category=fresh-produce"
        >
          <ListingCardGrid listings={freshToday} signedIn={Boolean(user)} savedIds={savedListingIds} />
        </MarketSection>
      ) : null}

      {popularProducts.length > 0 ? (
        <MarketSection
          eyebrow="Getting attention"
          title="Popular products"
          description="What buyers are viewing most right now."
          viewAllHref="/market?sort=popular"
        >
          <ListingCardGrid listings={popularProducts} signedIn={Boolean(user)} savedIds={savedListingIds} />
        </MarketSection>
      ) : null}

      {wholesaleOpportunities.length > 0 ? (
        <MarketSection
          eyebrow="Buying in bulk"
          title="Wholesale opportunities"
          description="Listings with wholesale pricing for restaurants, retailers and institutional buyers."
          viewAllHref="/market?wholesale=true"
        >
          <ListingCardGrid listings={wholesaleOpportunities} signedIn={Boolean(user)} savedIds={savedListingIds} />
        </MarketSection>
      ) : null}

      {featuredFarmers.length > 0 ? (
        <MarketSection
          eyebrow="Meet the growers"
          title="Featured farmers"
          description="Verified and highly rated farms selling directly on AgriLoop."
          viewAllHref="/farmers"
          viewAllLabel="Browse all farmers"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredFarmers.map((farm) => {
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
        </MarketSection>
      ) : null}

      <MarketSection
        eyebrow="Close to home"
        title="Products near you"
        description={nearYouRegionName ? `Recently listed in ${nearYouRegionName}.` : undefined}
      >
        {nearYou.length > 0 ? (
          <ListingCardGrid listings={nearYou} signedIn={Boolean(user)} savedIds={savedListingIds} />
        ) : (
          <EmptyState
            title={user ? 'Nothing new in your parish yet.' : 'Sign in to see what’s growing near you.'}
            description={
              user
                ? 'Check back soon, or browse other parishes from the filters above.'
                : 'AgriLoop personalises this section from your farm, business or buyer profile location.'
            }
            action={
              user ? (
                <ButtonLink href="/market" variant="secondary">Browse all parishes</ButtonLink>
              ) : (
                <ButtonLink href="/signin?next=/market">Sign In</ButtonLink>
              )
            }
          />
        )}
      </MarketSection>

      <section className="mt-12">
        <div className="flex flex-col items-start gap-4 rounded-lg border border-brand-200 bg-brand-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Megaphone className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" aria-hidden />
            <div>
              <h2 className="text-h3 font-semibold text-ink-900">Can&apos;t find what you need?</h2>
              <p className="mt-1 text-sm text-ink-600">
                Post a buyer request and let farmers and businesses come to you.
              </p>
            </div>
          </div>
          <ButtonLink href="/requests/new" size="lg" className="shrink-0">
            Post a Buyer Request
          </ButtonLink>
        </div>

        <div className="mt-6">
          <SectionHeader
            eyebrow="Demand, not just supply"
            title="Buyer requests"
            action={
              <ButtonLink href="/requests" variant="secondary" size="sm">
                View all requests
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            }
          />
          {buyerRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buyerRequests.map((request) => (
                <CardLink key={request.id} href={`/requests/${request.slug}`} className="p-5">
                  <p className="text-micro text-accent-600">{humanise(request.frequency)}</p>
                  <h3 className="mt-1.5 line-clamp-2 font-semibold text-ink-900">{request.title}</h3>
                  <div className="mt-3 flex items-center gap-1 text-sm text-ink-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {request.region.name}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink-800">
                      {request.budgetMinor ? (
                        <Money minor={request.budgetMinor} currency={request.currency} />
                      ) : (
                        'Negotiable'
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-ink-400">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {timeAgo(request.createdAt)}
                    </span>
                  </div>
                </CardLink>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No requests yet. Check back soon."
              description="When a buyer posts what they need, it shows up here for farmers to answer."
              action={<ButtonLink href="/requests/new">Post a Request</ButtonLink>}
            />
          )}
        </div>
      </section>

      <MarketSection
        eyebrow="Keep exploring"
        title="Recently added"
        description="The latest listings across every category."
        viewAllHref="/market?sort=recent"
      >
        <ListingCardGrid listings={recentlyAdded} signedIn={Boolean(user)} savedIds={savedListingIds} />
      </MarketSection>
    </div>
  );
}
