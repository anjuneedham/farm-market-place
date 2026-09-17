import type { Metadata } from 'next';
import { Heart, ListChecks, Package, Sparkles } from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { getBuyerProfile } from '@/lib/supabase/account';
import { createClient } from '@/lib/supabase/server';
import { buyerStats } from '@/lib/services/stats';
import { premiumService } from '@/lib/services/premium';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { buyerNav } from '@/components/dashboard/BuyerNav';
import { Stat, StatGrid } from '@/components/ui/Stat';
import { EmptyState } from '@/components/ui/States';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { ButtonLink } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';

export const metadata: Metadata = { title: 'Buyer Dashboard' };
export const dynamic = 'force-dynamic';

export default async function BuyerDashboardPage() {
  const { user } = await requireRole('BUYER', '/dashboard/buyer');
  const stats = buyerStats(user.id);
  const isPremium = premiumService.isPremium(user.id);
  const supabase = await createClient();
  const buyer = await getBuyerProfile(supabase, user.id);
  const currency = buyer ? db.locations.country(buyer.countryCode)?.currency ?? 'JMD' : 'JMD';

  return (
    <DashboardShell
      title={`Welcome back, ${buyer?.displayName ?? user.name}`}
      subtitle="Your sourcing activity on AgriLoop."
      nav={buyerNav()}
      activeHref="/dashboard/buyer"
      action={<ButtonLink href="/requests/new">Post a Request</ButtonLink>}
    >
      <StatGrid>
        <Stat label="Orders" value={stats.orders} icon={<Package className="h-4 w-4" />} />
        <Stat label="Saved farms" value={stats.savedFarms} icon={<Heart className="h-4 w-4" />} />
        <Stat label="Shopping lists" value={stats.shoppingLists} icon={<ListChecks className="h-4 w-4" />} />
        <Stat label="Open requests" value={stats.openRequests} icon={<Sparkles className="h-4 w-4" />} />
      </StatGrid>

      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-h2 mb-3">Premium Savings</h2>
          {isPremium ? (
            stats.savings.lifetimeMinor > 0 ? (
              <div className="rounded-lg border border-sun-300 bg-sun-50 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-ink-500">This month</p>
                    <Money
                      minor={stats.savings.monthMinor}
                      currency={stats.savings.currency ?? currency}
                      className="mt-1 block text-xl font-bold"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Lifetime</p>
                    <Money
                      minor={stats.savings.lifetimeMinor}
                      currency={stats.savings.currency ?? currency}
                      className="mt-1 block text-xl font-bold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="No savings recorded yet." description="Savings appear here once you complete a purchase through AgriLoop." />
            )
          ) : (
            <UpgradePrompt
              title="Track your savings with Premium"
              description="Member pricing and bulk discounts show up here automatically once you subscribe."
            />
          )}
        </section>

        <section>
          <h2 className="text-h2 mb-3">Saved farms</h2>
          <FavoriteFarmsList buyerId={user.id} />
        </section>
      </div>
    </DashboardShell>
  );
}

async function FavoriteFarmsList({ buyerId }: { buyerId: string }) {
  const favorites = db.favorites.forUser(buyerId, 'FARM');
  if (favorites.length === 0) {
    return <EmptyState title="No saved farms yet." description="Save a farm profile to keep track of your favourite sellers." />;
  }

  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-surface">
      {favorites.slice(0, 5).map((favorite) => {
        const farm = db.profiles.farmById(favorite.targetId);
        if (!farm) return null;
        return (
          <a key={favorite.id} href={`/farmers/${farm.slug}`} className="block px-4 py-3 text-sm font-medium text-ink-900 hover:bg-brand-50/40">
            {farm.name}
          </a>
        );
      })}
    </div>
  );
}
