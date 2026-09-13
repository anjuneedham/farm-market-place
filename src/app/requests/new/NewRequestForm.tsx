'use client';

import { useActionState } from 'react';
import { Field, FormError, Input, Select, Textarea } from '@/components/ui/Field';
import { Button, ButtonLink } from '@/components/ui/Button';
import { REQUEST_FREQUENCIES } from '@/lib/types';
import { humanise } from '@/lib/utils';
import { initialFormState } from '@/lib/forms';
import { createRequestAction } from '../actions';
import type { Category, Region } from '@/lib/types';

export function NewRequestForm({
  categories,
  regions,
  canPost,
}: {
  categories: Category[];
  regions: Region[];
  canPost: boolean;
}) {
  const [state, formAction, pending] = useActionState(createRequestAction, initialFormState);

  if (!canPost) {
    return (
      <div className="rounded-lg border border-sun-300 bg-sun-50 p-5">
        <p className="font-semibold text-ink-900">You've reached the free plan's open request limit.</p>
        <p className="mt-1.5 text-sm text-ink-600">
          Close an existing request, or upgrade to Premium for unlimited advanced buyer requests.
        </p>
        <ButtonLink href="/premium" variant="premium" className="mt-4">
          See Premium plans
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <Field label="What do you need?" required error={state.fields?.title}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="title" required placeholder="e.g. 200 lbs tomato every week" aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <Field label="Details" required error={state.fields?.description}>
        {({ id, describedBy, invalid }) => (
          <Textarea
            id={id}
            name="description"
            required
            rows={4}
            placeholder="Describe quality, delivery expectations, and anything farmers should know."
            aria-describedby={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Quantity">
          {({ id }) => <Input id={id} name="quantity" type="number" min={0} step="any" />}
        </Field>
        <Field label="Unit">
          {({ id }) => <Input id={id} name="unit" placeholder="lb, dozen, crate…" />}
        </Field>
      </div>

      <Field label="Category">
        {({ id }) => (
          <Select id={id} name="categoryId" defaultValue="">
            <option value="">Any category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Frequency" required>
        {({ id }) => (
          <Select id={id} name="frequency" required defaultValue="ONE_TIME">
            {REQUEST_FREQUENCIES.map((frequency) => (
              <option key={frequency} value={frequency}>
                {humanise(frequency)}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Budget (optional)" hint="In whole dollars, e.g. 5000 for $5,000.">
          {({ id }) => <Input id={id} name="budgetMinor" type="number" min={0} step={1} />}
        </Field>
        <div className="flex items-end pb-2.5 text-sm text-ink-500">Leave blank if negotiable.</div>
      </div>

      <Field label="Parish" required error={state.fields?.regionId}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="regionId" required defaultValue="" aria-describedby={describedBy} invalid={invalid}>
            <option value="" disabled>
              Choose a parish
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Posting…' : 'Post Request'}
      </Button>
    </form>
  );
}
