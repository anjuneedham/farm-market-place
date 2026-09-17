import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { getBuyerProfile } from '@/lib/supabase/account';
import { createClient } from '@/lib/supabase/server';
import { dashboardPathFor } from '@/lib/auth/permissions';
import { humanise } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { ProfileForm } from './ProfileForm';
import { PasswordForm } from './PasswordForm';
import { BuyerProfileForm } from './BuyerProfileForm';

export const metadata: Metadata = { title: 'Account Settings' };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { user } = await requireSession('/account');
  const verification = db.verification.forUser(user.id);
  const supabase = await createClient();
  const buyer = user.role === 'BUYER' ? await getBuyerProfile(supabase, user.id) : null;
  const regions = user.role === 'BUYER' ? db.locations.regions('JM') : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-h1">Account Settings</h1>
      <div className="mt-2 flex items-center gap-2">
        <Badge tone="brand">{humanise(user.role)}</Badge>
        {verification ? (
          <Badge tone={verification.status === 'APPROVED' ? 'positive' : 'warning'}>
            Verification: {humanise(verification.status)}
          </Badge>
        ) : null}
      </div>

      <div className="mt-8 space-y-10">
        <section>
          <h2 className="text-h2 mb-4">Profile</h2>
          <ProfileForm user={user} />
        </section>

        {user.role === 'BUYER' ? (
          <section>
            <h2 className="text-h2 mb-4">Buyer profile</h2>
            <BuyerProfileForm buyer={buyer} regions={regions} />
          </section>
        ) : null}

        <section>
          <h2 className="text-h2 mb-4">Password</h2>
          <PasswordForm />
        </section>

        <section>
          <h2 className="text-h2 mb-4">Quick links</h2>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={dashboardPathFor(user)} variant="secondary" size="sm">
              Dashboard
            </ButtonLink>
            <ButtonLink href="/premium" variant="secondary" size="sm">
              Premium
            </ButtonLink>
            <ButtonLink href="/messages" variant="secondary" size="sm">
              Messages
            </ButtonLink>
          </div>
        </section>
      </div>
    </div>
  );
}
