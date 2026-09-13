import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { EmptyState } from '@/components/ui/States';
import { formatDate, humanise } from '@/lib/utils';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { decideVerificationAction } from '../actions';

export const metadata: Metadata = { title: 'Verification — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminVerificationPage() {
  const pending = db.verification.pending();

  return (
    <div>
      <h1 className="text-h1 mb-6">Verification queue ({pending.length})</h1>

      {pending.length > 0 ? (
        <div className="space-y-3">
          {pending.map((request) => {
            const display = db.profiles.displayFor(request.subjectId);
            return (
              <div key={request.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink-900">
                      {display.label} <span className="text-ink-400">· {humanise(request.kind)}</span>
                    </p>
                    <p className="text-xs text-ink-400">Requested {formatDate(request.requestedAt)}</p>
                    {request.note ? <p className="mt-1 text-sm text-ink-600">{request.note}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <AdminActionButton label="Approve" action={decideVerificationAction} args={[request.id, 'APPROVED']} />
                    <AdminActionButton label="Reject" variant="danger" action={decideVerificationAction} args={[request.id, 'REJECTED']} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No pending verification requests." />
      )}
    </div>
  );
}
