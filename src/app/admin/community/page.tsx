import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { EmptyState } from '@/components/ui/States';
import { formatDate } from '@/lib/utils';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { hideCommunityPostAction, resolveReportAction, restoreCommunityPostAction } from '../actions';

export const metadata: Metadata = { title: 'Community — Admin' };
export const dynamic = 'force-dynamic';

/** Hides the reported post, then marks the report actioned, in one step. */
async function hideAndResolveAction(postId: string, reportId: string): Promise<{ error?: string }> {
  'use server';
  const hidden = await hideCommunityPostAction(postId);
  if (hidden.error) return hidden;
  return resolveReportAction(reportId, 'ACTIONED', 'Post hidden');
}

export default async function AdminCommunityPage() {
  const reports = db.moderation.reports('OPEN').filter((r) => r.targetType === 'POST' || r.targetType === 'COMMENT');
  const recentPosts = db.community.posts({ perPage: 20 }, undefined);

  return (
    <div>
      <h1 className="text-h1 mb-6">Community moderation</h1>

      <section className="mb-10">
        <h2 className="text-h2 mb-4">Reported content ({reports.length})</h2>
        {reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-lg border border-line bg-surface p-4">
                <p className="text-sm text-ink-900">
                  <span className="font-medium">{report.reason}</span> — {report.targetType.toLowerCase()} reported {formatDate(report.createdAt)}
                </p>
                {report.details ? <p className="mt-1 text-sm text-ink-600">{report.details}</p> : null}
                <div className="mt-3 flex gap-2">
                  {report.targetType === 'POST' ? (
                    <AdminActionButton
                      label="Hide post"
                      variant="danger"
                      action={hideAndResolveAction}
                      args={[report.targetId, report.id]}
                    />
                  ) : null}
                  <AdminActionButton label="Dismiss" action={resolveReportAction} args={[report.id, 'DISMISSED']} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No open reports." />
        )}
      </section>

      <section>
        <h2 className="text-h2 mb-4">Recent posts</h2>
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {recentPosts.items.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{post.title}</p>
                <p className="text-xs text-ink-400">{post.category.name} · {post.authorLabel}</p>
              </div>
              {post.status === 'PUBLISHED' ? (
                <AdminActionButton label="Hide" variant="danger" action={hideCommunityPostAction} args={[post.id]} />
              ) : (
                <AdminActionButton label="Restore" action={restoreCommunityPostAction} args={[post.id]} />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
