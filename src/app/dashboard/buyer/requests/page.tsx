import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { buyerNav } from '@/components/dashboard/BuyerNav';
import { CardLink } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';
import { humanise, timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'My Requests' };
export const dynamic = 'force-dynamic';

export default async function BuyerRequestsPage() {
  const { user } = await requireRole('BUYER', '/dashboard/buyer/requests');
  const all = [
    ...db.buyerRequests.search({ buyerId: user.id, status: 'OPEN', perPage: 60 }).items,
    ...db.buyerRequests.search({ buyerId: user.id, status: 'CLOSED', perPage: 60 }).items,
    ...db.buyerRequests.search({ buyerId: user.id, status: 'FULFILLED', perPage: 60 }).items,
  ];

  return (
    <DashboardShell
      title="My Requests"
      nav={buyerNav()}
      activeHref="/dashboard/buyer/requests"
      action={<ButtonLink href="/requests/new">Post a Request</ButtonLink>}
    >
      {all.length > 0 ? (
        <div className="space-y-3">
          {all.map((request) => (
            <CardLink key={request.id} href={`/requests/${request.slug}`} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{request.title}</p>
                <p className="text-xs text-ink-400">
                  {humanise(request.frequency)} · Posted {timeAgo(request.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm text-ink-500">{request.responseCount} response{request.responseCount === 1 ? '' : 's'}</span>
                <Badge tone={request.status === 'OPEN' ? 'positive' : 'neutral'}>{humanise(request.status)}</Badge>
              </div>
            </CardLink>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You haven't posted any requests yet."
          description="Tell farmers what you need instead of waiting for the right listing."
          action={<ButtonLink href="/requests/new">Post a Request</ButtonLink>}
        />
      )}
    </DashboardShell>
  );
}
