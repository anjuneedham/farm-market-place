import type { Metadata } from 'next';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import { markAllNotificationsReadAction } from './actions';

export const metadata: Metadata = { title: 'Notifications' };
export const dynamic = 'force-dynamic';

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { user } = await requireSession('/notifications');
  const { page } = await searchParams;

  const results = db.notifications.forUser(user.id, { page: page ? Number(page) : 1 });
  const unreadCount = db.notifications.unreadCount(user.id);
  const totalPages = Math.max(1, Math.ceil(results.total / results.perPage));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h1">Notifications</h1>
        {unreadCount > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <button type="submit" className="text-sm font-medium text-brand-600 hover:underline">
              Mark all read
            </button>
          </form>
        ) : null}
      </div>

      {results.items.length > 0 ? (
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {results.items.map((notification) => {
            const content = (
              <div className={cn('flex items-start gap-3 px-4 py-3.5', !notification.readAt && 'bg-brand-50/40')}>
                <span
                  className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                    notification.readAt ? 'bg-canvas text-ink-400' : 'bg-brand-100 text-brand-700',
                  )}
                >
                  <Bell className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900">{notification.title}</p>
                  {notification.body ? (
                    <p className="mt-0.5 truncate text-sm text-ink-500">{notification.body}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-ink-400">{timeAgo(notification.createdAt)}</p>
                </div>
                {!notification.readAt ? (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-600" aria-hidden />
                ) : null}
              </div>
            );

            return notification.href ? (
              <Link key={notification.id} href={notification.href} className="block hover:bg-brand-50/60">
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No notifications yet."
          description="Messages, buyer request replies and updates about your listings show up here."
        />
      )}

      <Pagination page={results.page} totalPages={totalPages} basePath="/notifications" params={{}} />
    </div>
  );
}
