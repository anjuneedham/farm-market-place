import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { getDefaultCountry } from '@/lib/location';
import { CardLink } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { ProduceSwatch } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { ButtonLink } from '@/components/ui/Button';
import { humanise } from '@/lib/utils';
import { BUSINESS_TYPES } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Agricultural Businesses',
  description: 'Find suppliers, equipment dealers and agricultural service providers across Jamaica.',
};

export const revalidate = 60;

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const params = await searchParams;
  const country = getDefaultCountry();
  const type = params.type && (BUSINESS_TYPES as readonly string[]).includes(params.type)
    ? (params.type as (typeof BUSINESS_TYPES)[number])
    : undefined;

  const results = db.profiles.listBusinesses({
    countryCode: country.code,
    type,
    page: params.page ? Number(params.page) : 1,
  });
  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <h1 className="text-h1">Agricultural Businesses</h1>
      <p className="mt-1 text-ink-600">Seeds, fertilizer, equipment, feed, tools, transport and services.</p>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        <ButtonLink href="/businesses" variant={!type ? 'primary' : 'secondary'} size="sm">
          All
        </ButtonLink>
        {BUSINESS_TYPES.map((businessType) => (
          <ButtonLink
            key={businessType}
            href={`/businesses?type=${businessType}`}
            variant={type === businessType ? 'primary' : 'secondary'}
            size="sm"
          >
            {humanise(businessType)}
          </ButtonLink>
        ))}
      </div>

      <div className="mt-6">
        {results.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((business) => (
              <CardLink key={business.id} href={`/businesses/${business.slug}`} className="overflow-hidden">
                <div className="aspect-[16/9] bg-accent-100">
                  <ProduceSwatch seed={business.name} className="h-full w-full" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-ink-900">{business.name}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{humanise(business.type)}</p>
                  {business.tagline ? <p className="mt-2 line-clamp-2 text-sm text-ink-600">{business.tagline}</p> : null}
                  <div className="mt-3 flex items-center gap-2">
                    {business.isVerified ? <VerifiedBadge kind="Business" /> : null}
                  </div>
                  {business.ratingCount > 0 ? (
                    <div className="mt-2">
                      <Rating average={business.ratingAverage} count={business.ratingCount} size="sm" />
                    </div>
                  ) : null}
                </div>
              </CardLink>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No businesses in this category yet."
            description="Be one of the first agricultural businesses discoverable on AgriLoop."
            action={<ButtonLink href="/signup?role=BUSINESS">List Your Business</ButtonLink>}
          />
        )}
      </div>

      <Pagination page={results.page} totalPages={totalPages} basePath="/businesses" params={params} />
    </div>
  );
}
