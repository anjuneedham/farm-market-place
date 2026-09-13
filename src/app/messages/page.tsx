import type { Metadata } from 'next';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/session';
import { messagingService } from '@/lib/services/messaging';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/States';
import { ButtonLink } from '@/components/ui/Button';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

export default async function MessagesInboxPage() {
  const { user } = await requireSession('/messages');
  const conversations = messagingService.inbox(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <h1 className="text-h1 mb-6">Messages</h1>

      {conversations.length > 0 ? (
        <div className="divide-y divide-line rounded-lg border border-line bg-surface">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-brand-50/40"
            >
              <Avatar name={conversation.otherDisplayName} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium text-ink-900">{conversation.otherDisplayName}</p>
                  <span className="shrink-0 text-xs text-ink-400">{timeAgo(conversation.lastMessageAt)}</span>
                </div>
                {conversation.contextLabel ? (
                  <p className="truncate text-xs text-brand-600">{conversation.contextLabel}</p>
                ) : null}
                {conversation.lastMessagePreview ? (
                  <p className="truncate text-sm text-ink-500">{conversation.lastMessagePreview}</p>
                ) : null}
              </div>
              {conversation.unread > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-600 px-1.5 text-xs font-semibold text-white">
                  {conversation.unread}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No conversations yet. Find a farmer to get started."
          description="Messages from sellers, buyers and buyer-request responses appear here."
          action={<ButtonLink href="/market">Explore the Market</ButtonLink>}
        />
      )}
    </div>
  );
}
