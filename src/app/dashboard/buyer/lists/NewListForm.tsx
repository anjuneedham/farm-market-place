'use client';

import { useActionState } from 'react';
import { Field, FormError, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { initialFormState } from '@/lib/forms';
import { createShoppingListAction } from './actions';

export function NewListForm() {
  const [state, formAction, pending] = useActionState(createShoppingListAction, initialFormState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink-900">New shopping list</h3>
      <FormError message={state.status === 'error' ? state.message : undefined} />
      <Field label="List name" required>
        {({ id }) => <Input id={id} name="name" required placeholder="Weekly Restaurant Supply" />}
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? 'Creating…' : 'Create list'}
      </Button>
    </form>
  );
}
