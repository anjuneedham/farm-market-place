import { can } from '@/lib/auth/permissions';
import { db } from '@/lib/db/repositories';
import { notificationService } from '@/lib/integrations';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import { checkRateLimit } from '@/lib/security/rate-limit';
import type { Conversation, ConversationView, Message, User } from '@/lib/types';
import type { z } from 'zod';
import type { messageSchema, startConversationSchema } from '@/lib/validation';

type MessageInput = z.infer<typeof messageSchema>;
type StartInput = z.infer<typeof startConversationSchema>;

/** Quick actions in the composer — the shortest path from interest to contact. */
export const QUICK_MESSAGES = [
  { key: 'availability', label: 'Ask about availability', body: 'Is this still available?' },
  { key: 'price', label: 'Ask about price', body: 'What is your best price at this quantity?' },
  {
    key: 'wholesale',
    label: 'Request wholesale quote',
    body: 'I am interested in a wholesale quantity. What would the price be, and what quantity can you supply?',
  },
  { key: 'interested', label: "I'm interested", body: "I'm interested in this. Can we talk?" },
] as const;

export const messagingService = {
  inbox(userId: string): ConversationView[] {
    return db.conversations.forUser(userId);
  },

  thread(conversationId: string, viewerId: string): { conversation: ConversationView; messages: Message[] } | null {
    const conversation = db.conversations.byId(conversationId);
    if (!conversation) return null;

    // Participation is the authorization check for a thread.
    if (conversation.participantAId !== viewerId && conversation.participantBId !== viewerId) {
      return null;
    }

    const view = db.conversations.toView(conversation, viewerId);
    if (!view) return null;

    return { conversation: view, messages: db.conversations.messages(conversationId) };
  },

  markRead(conversationId: string, viewerId: string): void {
    const conversation = db.conversations.byId(conversationId);
    if (!conversation) return;
    if (conversation.participantAId !== viewerId && conversation.participantBId !== viewerId) return;
    db.conversations.markRead(conversationId, viewerId);
  },

  unreadCount(userId: string): number {
    return db.conversations.unreadCount(userId);
  },

  async start(user: User, input: StartInput): Promise<ServiceResult<Conversation>> {
    if (!can(user, 'message:send')) return fail('forbidden', 'Sign in to send a message.');
    if (input.recipientId === user.id) {
      return fail('validation', 'You cannot message yourself.');
    }

    const recipient = db.users.byId(input.recipientId);
    if (!recipient || recipient.status !== 'ACTIVE') {
      return fail('not_found', 'We could not find that member.');
    }
    if (db.moderation.isBlockedEitherWay(user.id, recipient.id)) {
      return fail('forbidden', 'You cannot message this member.');
    }

    const limit = checkRateLimit('sendMessage', user.id);
    if (!limit.allowed) return fail('rate_limited', 'You have sent a lot of messages. Try again shortly.');

    const conversation = db.conversations.findOrCreate(user.id, recipient.id, {
      listingId: input.listingId,
      buyerRequestId: input.buyerRequestId,
    });
    db.conversations.send(conversation.id, user.id, input.body);

    await notificationService.notify({
      userId: recipient.id,
      type: 'MESSAGE',
      title: `New message from ${db.profiles.displayFor(user.id).label}`,
      body: input.body.slice(0, 120),
      href: `/messages/${conversation.id}`,
    });

    return ok(conversation);
  },

  async send(user: User, input: MessageInput): Promise<ServiceResult<Message>> {
    const conversation = db.conversations.byId(input.conversationId);
    if (!conversation) return fail('not_found', 'We could not find that conversation.');

    if (conversation.participantAId !== user.id && conversation.participantBId !== user.id) {
      return fail('forbidden', 'You are not part of this conversation.');
    }

    const otherId =
      conversation.participantAId === user.id
        ? conversation.participantBId
        : conversation.participantAId;
    if (db.moderation.isBlockedEitherWay(user.id, otherId)) {
      return fail('forbidden', 'You cannot message this member.');
    }

    const limit = checkRateLimit('sendMessage', user.id);
    if (!limit.allowed) return fail('rate_limited', 'You have sent a lot of messages. Try again shortly.');

    const message = db.conversations.send(conversation.id, user.id, input.body);

    await notificationService.notify({
      userId: otherId,
      type: 'MESSAGE',
      title: `New message from ${db.profiles.displayFor(user.id).label}`,
      body: input.body.slice(0, 120),
      href: `/messages/${conversation.id}`,
    });

    return ok(message);
  },
};
