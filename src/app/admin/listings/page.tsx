import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { AvailabilityBadge } from '@/components/ui/Badge';
import { ListingPrice } from '@/components/ui/Money';
import { Pagination } from '@/components/ui/Pagination';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { featureListingAction, removeListingAction, restoreListingAction, unfeatureListingAction } from '../actions';

export const metadata: Metadata = { title: 'Listings — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const results = db.listings.search({ status: 'ACTIVE', page: params.page ? Number(params.page) : 1, perPage: 20 });
  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div>
      <h1 className="text-h1 mb-6">Listings ({results.total} active)</h1>

      <div className="divide-y divide-line rounded-lg border border-line bg-surface">
        {results.items.map((listing) => (
          <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink-900">{listing.title}</p>
              <p className="text-xs text-ink-400">{listing.sellerName} · {listing.region.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <AvailabilityBadge availability={listing.availability} />
                <ListingPrice pricingMode={listing.pricingMode} priceMinor={listing.priceMinor} currency={listing.currency} unit={listing.unit} className="text-sm" />
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {listing.isFeatured ? (
                <AdminActionButton label="Unfeature" action={unfeatureListingAction} args={[listing.id]} />
              ) : (
                <AdminActionButton label="Feature 14d" action={featureListingAction} args={[listing.id, 14]} />
              )}
              <AdminActionButton
                label="Remove"
                variant="danger"
                confirmMessage={`Remove "${listing.title}" from the marketplace?`}
                action={removeListingAction}
                args={[listing.id]}
              />
            </div>
          </div>
        ))}
      </div>

      <Pagination page={results.page} totalPages={totalPages} basePath="/admin/listings" />

      <RemovedListingsSection />
    </div>
  );
}

async function RemovedListingsSection() {
  const removed = db.listings.search({ status: 'REMOVED_BY_ADMIN', perPage: 20 });
  if (removed.items.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-h2 mb-4">Removed listings</h2>
      <div className="divide-y divide-line rounded-lg border border-line bg-surface">
        {removed.items.map((listing) => (
          <div key={listing.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="truncate text-sm text-ink-700">{listing.title}</p>
            <AdminActionButton label="Restore" action={restoreListingAction} args={[listing.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}
