import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { premiumService } from '@/lib/services/premium';
import { NewRequestForm } from './NewRequestForm';

export const metadata: Metadata = { title: 'Post a Buyer Request' };

export default async function NewRequestPage() {
  const { user } = await requireSession('/requests/new');
  const categories = db.catalog.categories().filter((c) => c.level === 0);
  const regions = db.locations.regions('JM');
  const canPost = premiumService.canCreateRequest(user);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-h1">Post a Buyer Request</h1>
      <p className="mt-2 text-ink-600">
        Tell farmers what you need. This is the fastest way to reach supply that matches your
        requirements, without waiting for the right listing to appear.
      </p>
      <div className="mt-8">
        <NewRequestForm categories={categories} regions={regions} canPost={canPost} />
      </div>
    </div>
  );
}
