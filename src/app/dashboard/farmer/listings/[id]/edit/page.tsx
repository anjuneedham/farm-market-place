import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { can } from '@/lib/auth/permissions';
import { ListingForm } from '@/components/dashboard/ListingForm';
import { updateListingAction } from '../../../actions';

export const metadata: Metadata = { title: 'Edit Listing' };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireRole(['FARMER', 'BUSINESS'], `/dashboard/farmer/listings/${id}/edit`);

  const listing = db.listings.byId(id);
  if (!listing || !can(user, 'listing:update', listing)) notFound();

  const country = db.locations.country(listing.countryCode);
  const boundAction = updateListingAction.bind(null, listing.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-h1">Edit listing</h1>
      <div className="mt-8">
        <ListingForm
          action={boundAction}
          categories={db.catalog.categories()}
          products={db.catalog.products()}
          regions={db.locations.regions(listing.countryCode)}
          defaultCountryLabel={`${country?.regionLabel ?? 'Parish'} in ${country?.name ?? 'Jamaica'}`}
          listing={listing}
          tiers={db.listings.viewById(listing.id)?.priceTiers ?? []}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
