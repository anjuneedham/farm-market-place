'use client';

import { useActionState } from 'react';
import { Field, FormError, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { initialFormState } from '@/lib/forms';
import { createPostAction } from '../actions';
import type { CommunityCategory } from '@/lib/types';

export function NewPostForm({
  categories,
  defaultCategory,
}: {
  categories: CommunityCategory[];
  defaultCategory?: string;
}) {
  const [state, formAction, pending] = useActionState(createPostAction, initialFormState);
  const defaultId = categories.find((c) => c.slug === defaultCategory)?.id ?? '';

  return (
    <form action={formAction} className="space-y-5">
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <Field label="Category" required error={state.fields?.categoryId}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} name="categoryId" required defaultValue={defaultId} aria-describedby={describedBy} invalid={invalid}>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Title" required error={state.fields?.title}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="title" required aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <Field label="Body" required error={state.fields?.body}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} name="body" required rows={8} aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <div className="space-y-2.5 rounded-lg border border-line bg-canvas p-4">
        <p className="text-sm font-medium text-ink-800">Link something on AgriLoop (optional)</p>
        <p className="text-xs text-ink-500">
          Talking about a specific product, farm, business or buyer request? Link it so people can
          find it — paste its URL slug (the part after the last /).
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[160px_1fr]">
          <Select name="relatedType" defaultValue="" aria-label="What to link">
            <option value="">Nothing</option>
            <option value="LISTING">A product listing</option>
            <option value="FARM">A farm</option>
            <option value="BUSINESS">A business</option>
            <option value="BUYER_REQUEST">A buyer request</option>
          </Select>
          <Input name="relatedSlug" placeholder="e.g. fresh-scotch-bonnet-pepper-green-valley-farm" />
        </div>
        {state.fields?.relatedSlug ? <p className="text-sm font-medium text-danger">{state.fields.relatedSlug}</p> : null}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Posting…' : 'Publish post'}
      </Button>
    </form>
  );
}
