import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireSession } from '@/lib/auth/session';
import { messagingService } from '@/lib/services/messaging';
import { MessageThread } from './MessageThread';

export const metadata: Metadata = { title: 'Conversation' };
export const dynamic = 'force-dynamic';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireSession(`/messages/${id}`);

  const thread = messagingService.thread(id, user.id);
  if (!thread) notFound();

  messagingService.markRead(id, user.id);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 sm:px-6">
      <div className="flex items-center gap-3 border-b border-line py-4">
        <Link href="/messages" className="text-ink-500 hover:text-brand-600" aria-label="Back to messages">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="font-semibold text-ink-900">{thread.conversation.otherDisplayName}</p>
          {thread.conversation.contextLabel ? (
            <Link href={thread.conversation.contextHref ?? '#'} className="text-xs text-brand-600 hover:underline">
              {thread.conversation.contextLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <MessageThread
        conversationId={id}
        messages={thread.messages}
        currentUserId={user.id}
      />
    </div>
  );
}
