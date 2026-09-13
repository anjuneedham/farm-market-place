import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { ListingForm } from '@/components/dashboard/ListingForm';
import { createListingAction } from '../../actions';

export const metadata: Metadata = { title: 'Add Listing' };

export default async function NewListingPage() {
  const { user } = await requireRole(['FARMER', 'BUSINESS'], '/dashboard/farmer/listings/new');
  const profile = db.profiles.farmByUserId(user.id) ?? db.profiles.businessByUserId(user.id);
  const country = profile ? db.locations.country(profile.countryCode) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-h1">Add a listing</h1>
      <p className="mt-2 text-ink-600">
        Your price and quantity will be shown in {country?.currency ?? 'JMD'}, and your listing
        publishes immediately to the marketplace.
      </p>
      <div className="mt-8">
        <ListingForm
          action={createListingAction}
          categories={db.catalog.categories()}
          products={db.catalog.products()}
          regions={db.locations.regions(country?.code ?? 'JM')}
          defaultCountryLabel={`${country?.regionLabel ?? 'Parish'} in ${country?.name ?? 'Jamaica'}`}
          submitLabel="Publish Listing"
        />
      </div>
    </div>
  );
}
