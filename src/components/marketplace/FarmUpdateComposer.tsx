'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormError, FormSuccess, Select, Textarea } from '@/components/ui/Field';
import { postFarmUpdateAction } from '@/app/farmers/actions';
import { initialFormState } from '@/lib/forms';

export function FarmUpdateComposer({ listings }: { listings: Array<{ id: string; title: string }> }) {
  const [state, formAction, pending] = useActionState(postFarmUpdateAction, initialFormState);

  if (state.status === 'idle' && state.message === 'posted') {
    return <FormSuccess message="Posted — refresh to see it on your profile." />;
  }

  return (
    <form action={formAction} className="space-y-2.5 rounded-lg border border-line bg-surface p-4">
      <FormError message={state.status === 'error' ? state.message : undefined} />
      <Textarea
        name="body"
        placeholder="Share a quick update — a harvest, a restock, anything buyers should know…"
        rows={3}
        required
        maxLength={500}
        aria-label="Farm update"
      />
      {listings.length > 0 ? (
        <Select name="listingId" defaultValue="" aria-label="Link a listing (optional)">
          <option value="">Not linked to a listing</option>
          {listings.map((listing) => (
            <option key={listing.id} value={listing.id}>
              {listing.title}
            </option>
          ))}
        </Select>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Posting…' : 'Post Update'}
      </Button>
    </form>
  );
}
