import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { getFarmProfile } from '@/lib/supabase/account';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/repositories';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { farmerNav } from '@/components/dashboard/FarmerNav';
import { FarmProfileForm } from './FarmProfileForm';

export const metadata: Metadata = { title: 'My Farm' };
export const dynamic = 'force-dynamic';

export default async function FarmProfilePage() {
  const { user } = await requireRole('FARMER', '/dashboard/farmer/profile');
  const supabase = await createClient();
  const farm = await getFarmProfile(supabase, user.id);
  const regions = db.locations.regions('JM');
  const communities = farm?.regionId ? db.locations.communities(farm.regionId) : [];

  return (
    <DashboardShell
      title="My Farm"
      subtitle={
        farm
          ? 'Buyers see this on your public farm profile.'
          : "Add your farm's details so buyers know who they're dealing with."
      }
      nav={farmerNav()}
      activeHref="/dashboard/farmer/profile"
    >
      <div className="max-w-2xl">
        <FarmProfileForm farm={farm} user={user} regions={regions} communities={communities} />
      </div>
    </DashboardShell>
  );
}
