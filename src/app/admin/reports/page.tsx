import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { EmptyState } from '@/components/ui/States';
import { formatDate, humanise } from '@/lib/utils';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { resolveReportAction } from '../actions';

export const metadata: Metadata = { title: 'Reports — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const reports = db.moderation.reports('OPEN');

  return (
    <div>
      <h1 className="text-h1 mb-6">Reports ({reports.length})</h1>

      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((report) => {
            const reporter = db.profiles.displayFor(report.reporterId);
            return (
              <div key={report.id} className="rounded-lg border border-line bg-surface p-4">
                <p className="text-sm text-ink-900">
                  <span className="font-medium">{humanise(report.targetType)}</span> reported for{' '}
                  <span className="font-medium">{report.reason}</span>
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  By {reporter.label} · {formatDate(report.createdAt)}
                </p>
                {report.details ? <p className="mt-2 text-sm text-ink-600">{report.details}</p> : null}
                <div className="mt-3 flex gap-2">
                  <AdminActionButton label="Mark actioned" action={resolveReportAction} args={[report.id, 'ACTIONED']} />
                  <AdminActionButton label="Dismiss" variant="ghost" action={resolveReportAction} args={[report.id, 'DISMISSED']} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No open reports." description="Reports across listings, posts, reviews and users will appear here." />
      )}
    </div>
  );
}
