import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getDefaultCountry } from '@/lib/location';
import { CardLink } from '@/components/ui/Card';
import { Money } from '@/components/ui/Money';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { ButtonLink } from '@/components/ui/Button';
import { humanise, timeAgo } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Buyer Requests',
  description: 'Restaurants, hotels, supermarkets and buyers across Jamaica posting what they need. Respond directly.',
};

export const revalidate = 60;

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; region?: string }>;
}) {
  const params = await searchParams;
  const country = getDefaultCountry();
  const region = params.region ? db.locations.regionBySlug(country.code, params.region) : undefined;

  const results = db.buyerRequests.search({
    countryCode: country.code,
    regionId: region?.id,
    page: params.page ? Number(params.page) : 1,
  });
  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">Buyer Requests</h1>
          <p className="mt-1 text-ink-600">{results.total} open requests — demand-driven, not supply-and-hope.</p>
        </div>
        <ButtonLink href="/requests/new">Post a Request</ButtonLink>
      </div>

      <div className="mt-6">
        {results.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((request) => (
              <CardLink key={request.id} href={`/requests/${request.slug}`} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-micro text-accent-600">{humanise(request.frequency)}</p>
                  {request.responseCount > 0 ? (
                    <span className="text-xs text-ink-400">{request.responseCount} response{request.responseCount === 1 ? '' : 's'}</span>
                  ) : null}
                </div>
                <h3 className="mt-1.5 line-clamp-2 font-semibold text-ink-900">{request.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{request.description}</p>
                <div className="mt-3 flex items-center gap-1 text-sm text-ink-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {request.community ? `${request.community.name}, ` : ''}
                  {request.region.name}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-800">
                    {request.budgetMinor ? <Money minor={request.budgetMinor} currency={request.currency} /> : 'Negotiable'}
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

      <Pagination page={results.page} totalPages={totalPages} basePath="/requests" params={params} />

      <p className="mt-8 text-center text-sm text-ink-400">
        Selling? <Link href="/market" className="text-brand-600 hover:underline">Browse the marketplace</Link> instead.
      </p>
    </div>
  );
}
