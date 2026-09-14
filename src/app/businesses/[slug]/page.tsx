import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Building2 } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { communityService } from '@/lib/services/community';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { VerifiedBadge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { ButtonLink } from '@/components/ui/Button';
import { ReportButton } from '@/components/marketplace/ReportButton';
import { BlockButton } from '@/components/marketplace/BlockButton';
import { ReviewList } from '@/components/marketplace/ReviewList';
import { EmptyState } from '@/components/ui/States';
import { humanise } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = db.profiles.businessBySlug(slug);
  if (!business) return {};
  return { title: business.name, description: business.tagline ?? `${business.name} on AgriLoop.` };
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = db.profiles.businessBySlug(slug);
  if (!business) notFound();

  const user = await getCurrentUser();
  const region = db.locations.region(business.regionId);
  const community = business.communityId ? db.locations.community(business.communityId) : undefined;
  const listings = db.listings.search({ sellerId: business.userId, perPage: 12 }).items;
  const reviews = db.reviews.forSubject(business.userId, { perPage: 10 });
  const savedListingIds = user
    ? new Set(db.favorites.forUser(user.id, 'LISTING').map((f) => f.targetId))
    : undefined;
  const isOwner = user?.id === business.userId;
  const isBlocked = user ? communityService.isBlockedByViewer(user, business.userId) : false;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent-100">
            <Building2 className="h-7 w-7 text-accent-700" aria-hidden />
          </div>
          <div>
            <h1 className="text-h1">{business.name}</h1>
            <p className="mt-0.5 text-sm text-ink-500">{humanise(business.type)}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <MapPin className="h-4 w-4" aria-hidden />
              {community ? `${community.name}, ` : ''}
              {region?.name}, Jamaica
            </div>
          </div>
        </div>
        {!isOwner ? (
          <ButtonLink href={`/messages/new?recipient=${business.userId}`}>Contact Business</ButtonLink>
        ) : (
          <ButtonLink href="/dashboard/farmer" variant="secondary">
            Manage listings
          </ButtonLink>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {business.isVerified ? <VerifiedBadge kind="Business" /> : null}
        {reviews.total > 0 ? <Rating average={business.ratingAverage} count={business.ratingCount} /> : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          {business.description ? (
            <section>
              <h2 className="text-h2 mb-3">About</h2>
              <p className="whitespace-pre-wrap text-ink-700">{business.description}</p>
            </section>
          ) : null}

          <section>
            <h2 className="text-h2 mb-4">Products &amp; services ({listings.length})</h2>
            {listings.length > 0 ? (
              <ListingCardGrid listings={listings} signedIn={Boolean(user)} savedIds={savedListingIds} />
            ) : (
              <EmptyState title="No active listings right now." />
            )}
          </section>

          <section>
            <h2 className="text-h2 mb-4">Reviews</h2>
            <ReviewList reviews={reviews.items} total={reviews.total} />
          </section>
        </div>

        <aside className="space-y-5">
          {business.servicesOffered.length > 0 ? (
            <div className="rounded-lg border border-line bg-surface p-5">
              <h3 className="text-micro mb-3 text-ink-500">Services offered</h3>
              <ul className="space-y-1.5 text-sm text-ink-700">
                {business.servicesOffered.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {!isOwner ? (
            <div className="flex items-center justify-end gap-4">
              <ReportButton targetType="USER" targetId={business.userId} signedIn={Boolean(user)} />
              <BlockButton targetUserId={business.userId} initiallyBlocked={isBlocked} signedIn={Boolean(user)} />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
