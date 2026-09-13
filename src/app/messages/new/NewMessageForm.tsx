'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormError, Textarea } from '@/components/ui/Field';
import { QUICK_MESSAGES, contactSellerAction } from '@/app/market/actions';
import { initialFormState } from '@/lib/forms';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NewMessageForm({
  recipientId,
  recipientLabel,
  listingId,
}: {
  recipientId: string;
  recipientLabel: string;
  listingId?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(contactSellerAction, initialFormState);
  const [body, setBody] = useState('');

  useEffect(() => {
    if (state.status === 'idle' && state.message === 'sent') {
      router.push('/messages');
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="recipientId" value={recipientId} />
      {listingId ? <input type="hidden" name="listingId" value={listingId} /> : null}
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <div className="flex flex-wrap gap-1.5">
        {QUICK_MESSAGES.map((quick) => (
          <button
            key={quick.key}
            type="button"
            onClick={() => setBody(quick.body)}
            className="rounded-full border border-line-strong px-3 py-1 text-xs font-medium text-ink-600 hover:border-brand-300 hover:bg-brand-50"
          >
            {quick.label}
          </button>
        ))}
      </div>

      <Textarea
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Write to ${recipientLabel}…`}
        rows={4}
        required
      />

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
