import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { farmerNav } from '@/components/dashboard/FarmerNav';
import { Rating } from '@/components/ui/Rating';
import { ReviewList } from '@/components/marketplace/ReviewList';

export const metadata: Metadata = { title: 'Reviews' };
export const dynamic = 'force-dynamic';

export default async function FarmerReviewsPage() {
  const { user } = await requireRole(['FARMER', 'BUSINESS'], '/dashboard/farmer/reviews');
  const farm = db.profiles.farmByUserId(user.id);
  const business = farm ? undefined : db.profiles.businessByUserId(user.id);
  const reviews = db.reviews.forSubject(user.id, { perPage: 60 });
  const average = farm?.ratingAverage ?? business?.ratingAverage ?? 0;
  const count = farm?.ratingCount ?? business?.ratingCount ?? 0;

  return (
    <DashboardShell title="Reviews" nav={farmerNav()} activeHref="/dashboard/farmer/reviews">
      <div className="mb-6">
        <Rating average={average} count={count} />
      </div>
      <ReviewList reviews={reviews.items} total={reviews.total} />
    </DashboardShell>
  );
}
