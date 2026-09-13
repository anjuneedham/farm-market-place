'use client';

import { useActionState } from 'react';
import { Field, FormError, FormSuccess, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { initialFormState } from '@/lib/forms';
import { respondToRequestAction } from '../actions';
import type { RequestResponse } from '@/lib/types';

export function RespondForm({ requestId, existing }: { requestId: string; existing?: RequestResponse }) {
  const [state, formAction, pending] = useActionState(respondToRequestAction, initialFormState);

  if (state.status === 'idle' && state.message === 'responded') {
    return <FormSuccess message="Your response was sent. The buyer has been notified and a conversation has started." />;
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-line bg-surface p-5">
      <input type="hidden" name="buyerRequestId" value={requestId} />
      <FormError message={state.status === 'error' ? state.message : undefined} />

      {existing ? (
        <p className="text-sm text-ink-500">You already responded to this request. Submitting again updates your response.</p>
      ) : null}

      <Field label="Your message" required error={state.fields?.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="message"
            required
            rows={4}
            defaultValue={existing?.message}
            placeholder="What can you supply, and when?"
            aria-describedby={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Quoted price (optional)">
          {({ id }) => (
            <Input id={id} name="quotedPriceMinor" type="number" min={0} step={1} placeholder="Minor units, e.g. 42000 = $420" defaultValue={existing?.quotedPriceMinor} />
          )}
        </Field>
        <Field label="Quantity (optional)">
          {({ id }) => (
            <Input id={id} name="quotedQuantity" type="number" min={0} step="any" defaultValue={existing?.quotedQuantity} />
          )}
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Sending…' : existing ? 'Update response' : 'Submit Quote'}
      </Button>
    </form>
  );
}
