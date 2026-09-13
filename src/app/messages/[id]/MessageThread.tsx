'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/ui/Field';
import { initialFormState } from '@/lib/forms';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { sendMessageAction } from '../actions';
import type { Message } from '@/lib/types';

export function MessageThread({
  conversationId,
  messages,
  currentUserId,
}: {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm',
                  mine ? 'bg-brand-600 text-white' : 'bg-canvas text-ink-800',
                )}
                title={formatDate(message.createdAt)}
              >
                <p className="whitespace-pre-wrap">{message.body}</p>
                <p className={cn('mt-1 text-[10px]', mine ? 'text-brand-100' : 'text-ink-400')}>
                  {timeAgo(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
        }}
        className="border-t border-line py-3"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <FormError message={state.status === 'error' ? state.message : undefined} />
        <div className="mt-2 flex items-end gap-2">
          <textarea
            name="body"
            required
            rows={1}
            placeholder="Write a message…"
            aria-label="Message"
            className="h-11 flex-1 resize-none rounded-[10px] border border-line-strong px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none"
          />
          <Button type="submit" size="md" disabled={pending} aria-label="Send message">
            <Send className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </form>
    </>
  );
}
