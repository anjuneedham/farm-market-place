import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Sprout } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { ListingCardGrid } from '@/components/marketplace/ListingCard';
import { PremiumBadge, VerifiedBadge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { ProduceSwatch } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/Button';
import { SaveButton } from '@/components/marketplace/SaveButton';
import { ReviewList } from '@/components/marketplace/ReviewList';
import { EmptyState } from '@/components/ui/States';
import { humanise } from '@/lib/utils';

export const revalidate = 60;

async function getFarm(slug: string) {
  return db.profiles.farmBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const farm = await getFarm(slug);
  if (!farm) return {};
  return {
    title: farm.name,
    description: farm.tagline ?? `${farm.name} on AgriLoop.`,
  };
}

export default async function FarmerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const farm = await getFarm(slug);
  if (!farm) notFound();

  const user = await getCurrentUser();
  const region = db.locations.region(farm.regionId);
  const community = farm.communityId ? db.locations.community(farm.communityId) : undefined;
  const listings = db.listings.search({ sellerId: farm.userId, perPage: 12 }).items;
  const reviews = db.reviews.forSubject(farm.userId, { perPage: 10 });
  const isPremium = db.premium.isPremium(farm.userId);
  const savedInitially = user ? db.favorites.has(user.id, 'FARM', farm.id) : false;
  const isOwner = user?.id === farm.userId;

  return (
    <div>
      <div className="relative h-40 bg-brand-800 sm:h-56">
        {farm.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={farm.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ProduceSwatch seed={farm.name} className="h-full w-full opacity-60" />
        )}
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-4 border-surface bg-brand-100 sm:h-24 sm:w-24">
              <Sprout className="h-8 w-8 text-brand-600" aria-hidden />
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-h1">{farm.name}</h1>
                {isPremium ? <PremiumBadge /> : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                <MapPin className="h-4 w-4" aria-hidden />
                {community ? `${community.name}, ` : ''}
                {region?.name}, Jamaica
              </div>
            </div>
          </div>

          <div className="flex gap-2 pb-1">
            {!isOwner ? (
              <>
                <SaveButton listingId={farm.id} kind="FARM" initiallySaved={savedInitially} signedIn={Boolean(user)} />
                <ButtonLink href={`/messages/new?recipient=${farm.userId}`}>Contact Farmer</ButtonLink>
              </>
            ) : (
              <ButtonLink href="/dashboard/farmer" variant="secondary">
                Manage your farm
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {farm.isVerified ? <VerifiedBadge kind="Farmer" /> : null}
          {reviews.total > 0 ? <Rating average={farm.ratingAverage} count={farm.ratingCount} /> : null}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {farm.story ? (
              <section>
                <h2 className="text-h2 mb-3">Our story</h2>
                <p className="whitespace-pre-wrap text-ink-700">{farm.story}</p>
              </section>
            ) : null}

            <section>
              <h2 className="text-h2 mb-4">Products ({listings.length})</h2>
              {listings.length > 0 ? (
                <ListingCardGrid listings={listings} />
              ) : (
                <EmptyState title="No active listings right now." description="Check back soon, or message the farm directly." />
              )}
            </section>

            <section>
              <h2 className="text-h2 mb-4">Reviews</h2>
              <ReviewList reviews={reviews.items} total={reviews.total} />
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-lg border border-line bg-surface p-5">
              <h3 className="text-micro mb-3 text-ink-500">Farm details</h3>
              <dl className="space-y-2.5 text-sm">
                {farm.yearsFarming !== undefined ? (
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Years farming</dt>
                    <dd className="font-medium">{farm.yearsFarming}</dd>
                  </div>
                ) : null}
                {farm.farmSizeAcres !== undefined ? (
                  <div className="flex justify-between">
                    <dt className="text-ink-500">Farm size</dt>
                    <dd className="font-medium">{farm.farmSizeAcres} acres</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-ink-500">Pickup</dt>
                  <dd className="font-medium">{farm.acceptsPickup ? 'Available' : 'Not available'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Delivery</dt>
                  <dd className="font-medium">{farm.acceptsDelivery ? 'Available' : 'Not available'}</dd>
                </div>
              </dl>
            </div>

            {farm.methods.length > 0 ? (
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="text-micro mb-3 text-ink-500">Farming methods</h3>
                <div className="flex flex-wrap gap-1.5">
                  {farm.methods.map((method) => (
                    <span key={method} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                      {humanise(method)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {farm.specialties.length > 0 ? (
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="text-micro mb-3 text-ink-500">Specialties</h3>
                <div className="flex flex-wrap gap-1.5">
                  {farm.specialties.map((specialty) => (
                    <span key={specialty} className="rounded-full border border-line-strong px-2.5 py-1 text-xs text-ink-600">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
