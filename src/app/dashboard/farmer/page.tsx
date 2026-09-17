import type { Metadata } from 'next';
import { Eye, Heart, MessageCircle, Package, TrendingUp } from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { getFarmProfile } from '@/lib/supabase/account';
import { createClient } from '@/lib/supabase/server';
import { sellerStats } from '@/lib/services/stats';
import { premiumService } from '@/lib/services/premium';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { farmerNav } from '@/components/dashboard/FarmerNav';
import { Stat, StatGrid } from '@/components/ui/Stat';
import { EmptyState } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { AvailabilityBadge } from '@/components/ui/Badge';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';

export const metadata: Metadata = { title: 'Farmer Dashboard' };
export const dynamic = 'force-dynamic';

export default async function FarmerDashboardPage() {
  const { user } = await requireRole(['FARMER', 'BUSINESS'], '/dashboard/farmer');
  const stats = sellerStats(user.id);
  const isPremium = premiumService.isPremium(user.id);
  const supabase = await createClient();
  const farm = await getFarmProfile(supabase, user.id);
  const currency = farm ? db.locations.country(farm.countryCode)?.currency ?? 'JMD' : 'JMD';

  return (
    <DashboardShell
      title={`Welcome back, ${farm?.name ?? user.name}`}
      subtitle="Here's how your farm is doing on AgriLoop."
      nav={farmerNav()}
      activeHref="/dashboard/farmer"
      action={<ButtonLink href="/dashboard/farmer/listings/new">Add Listing</ButtonLink>}
    >
      <StatGrid>
        <Stat label="Active listings" value={stats.activeListings} icon={<Package className="h-4 w-4" />} />
        <Stat label="Product views" value={stats.views} icon={<Eye className="h-4 w-4" />} />
        <Stat label="Buyer requests answered" value={stats.requestResponses} icon={<MessageCircle className="h-4 w-4" />} />
        <Stat label="Orders" value={stats.orders} icon={<TrendingUp className="h-4 w-4" />} />
        <Stat
          label="Revenue"
          value={stats.revenueMinor > 0 ? '' : '—'}
          hint={stats.revenueMinor > 0 ? undefined : 'From completed orders'}
          icon={<Heart className="h-4 w-4" />}
        />
      </StatGrid>

      {stats.revenueMinor > 0 ? (
        <p className="-mt-3 mb-6 text-sm text-ink-500">
          Total revenue: <Money minor={stats.revenueMinor} currency={currency} className="font-semibold text-ink-900" />
        </p>
      ) : null}

      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="text-h2 mb-3">Your top listings</h2>
          {stats.topListings.length > 0 ? (
            <div className="divide-y divide-line rounded-lg border border-line bg-surface">
              {stats.topListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{listing.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <AvailabilityBadge availability={listing.availability} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p className="font-semibold tabular">{listing.viewCount} views</p>
                    <ButtonLink href={`/dashboard/farmer/listings/${listing.id}/edit`} size="sm" variant="ghost">
                      Edit
                    </ButtonLink>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your farm isn't listed yet. Add your first product."
              description="Listings you publish will appear here with real view counts."
              action={<ButtonLink href="/dashboard/farmer/listings/new">Add Listing</ButtonLink>}
            />
          )}
        </section>

        <section>
          <h2 className="text-h2 mb-3">Advanced analytics</h2>
          {isPremium ? (
            <div className="rounded-lg border border-line bg-surface p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">Listing saves</dt>
                  <dd className="font-semibold tabular">{stats.saves}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Open conversations</dt>
                  <dd className="font-semibold tabular">{stats.conversations}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Completed orders</dt>
                  <dd className="font-semibold tabular">{stats.completedOrders}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <UpgradePrompt
              title="Advanced analytics is a Premium feature"
              description="See favourites, message trends, buyer interest and demand for your products."
            />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
