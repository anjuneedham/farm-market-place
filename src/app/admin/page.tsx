import type { Metadata } from 'next';
import { Users, Package, MessageSquare, GraduationCap, ShoppingCart, Star, Flag, ShieldAlert } from 'lucide-react';
import { platformStats } from '@/lib/services/stats';
import { getDefaultCountry } from '@/lib/location';
import { Stat, StatGrid } from '@/components/ui/Stat';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const country = getDefaultCountry();
  const stats = platformStats(country.code);

  return (
    <div>
      <h1 className="text-h1 mb-1">Platform Dashboard</h1>
      <p className="mb-6 text-ink-600">Real counts from the current dataset. Nothing here is estimated.</p>

      <StatGrid>
        <Stat label="Farmers" value={stats.farmers} icon={<Users className="h-4 w-4" />} />
        <Stat label="Buyers" value={stats.buyers} icon={<Users className="h-4 w-4" />} />
        <Stat label="Businesses" value={stats.businesses} icon={<Users className="h-4 w-4" />} />
        <Stat label="Active listings" value={stats.activeListings} icon={<Package className="h-4 w-4" />} />
        <Stat label="Open buyer requests" value={stats.openRequests} icon={<ShoppingCart className="h-4 w-4" />} />
        <Stat label="Community posts" value={stats.communityPosts} icon={<MessageSquare className="h-4 w-4" />} />
        <Stat label="Academy lessons" value={stats.academyLessons} icon={<GraduationCap className="h-4 w-4" />} />
        <Stat label="Orders recorded" value={stats.orders} icon={<ShoppingCart className="h-4 w-4" />} />
        <Stat label="Premium subscribers" value={stats.premiumSubscribers} icon={<Star className="h-4 w-4" />} tone="premium" />
        <Stat label="Parishes with listings" value={stats.parishesCovered} icon={<Package className="h-4 w-4" />} />
      </StatGrid>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.pendingVerifications > 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-sun-300 bg-sun-50 p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-sun-700" />
              <p className="text-sm font-medium text-ink-900">
                {stats.pendingVerifications} verification request{stats.pendingVerifications === 1 ? '' : 's'} pending
              </p>
            </div>
            <ButtonLink href="/admin/verification" size="sm" variant="premium">
              Review
            </ButtonLink>
          </div>
        ) : null}

        {stats.openReports > 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger-soft p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-danger" />
              <p className="text-sm font-medium text-ink-900">
                {stats.openReports} open report{stats.openReports === 1 ? '' : 's'}
              </p>
            </div>
            <ButtonLink href="/admin/reports" size="sm" variant="danger">
              Review
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}
