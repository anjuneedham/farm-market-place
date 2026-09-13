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

      <Button type="submit" disabled={pending}>
        {pending ? 'Posting…' : 'Publish post'}
      </Button>
    </form>
  );
}
