'use client';

import { useActionState } from 'react';
import { Field, FormError, FormSuccess, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { BUYER_TYPES, type BuyerProfile, type Region } from '@/lib/types';
import { humanise } from '@/lib/utils';
import { updateBuyerProfileAction } from './actions';
import { initialFormState } from '@/lib/forms';

export function BuyerProfileForm({ buyer, regions }: { buyer: BuyerProfile | null; regions: Region[] }) {
  const [state, formAction, pending] = useActionState(updateBuyerProfileAction, initialFormState);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <FormError message={state.status === 'error' ? state.message : undefined} />
      {state.status === 'idle' && state.message === 'saved' ? <FormSuccess message="Saved." /> : null}

      <Field label="Display name" required error={state.fields?.displayName}>
        {({ id }) => <Input id={id} name="displayName" defaultValue={buyer?.displayName} required />}
      </Field>

      <Field label="Buyer type" required>
        {({ id }) => (
          <Select id={id} name="type" defaultValue={buyer?.type ?? 'HOUSEHOLD'}>
            {BUYER_TYPES.map((type) => (
              <option key={type} value={type}>
                {humanise(type)}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Organisation" hint="Optional — restaurant, hotel or business name.">
        {({ id }) => <Input id={id} name="organisation" defaultValue={buyer?.organisation} />}
      </Field>

      <Field label="Parish" required error={state.fields?.regionId}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="regionId" required defaultValue={buyer?.regionId ?? ''} aria-describedby={describedBy} invalid={invalid}>
            <option value="" disabled>
              Choose your parish
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="About" hint="Optional — what you buy and how often.">
        {({ id }) => <Textarea id={id} name="description" defaultValue={buyer?.description} rows={3} />}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
