'use client';

import { useActionState } from 'react';
import { Field, FormError, FormSuccess, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { initialFormState } from '@/lib/forms';
import { updateProfileAction } from './actions';
import type { User } from '@/lib/types';

export function ProfileForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialFormState);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <FormError message={state.status === 'error' ? state.message : undefined} />
      {state.status === 'idle' && state.message === 'saved' ? <FormSuccess message="Saved." /> : null}

      <Field label="Full name" required>
        {({ id }) => <Input id={id} name="name" defaultValue={user.name} required />}
      </Field>
      <Field label="Email">
        {({ id }) => <Input id={id} value={user.email} disabled className="bg-canvas text-ink-400" />}
      </Field>
      <Field label="Phone" hint="Used for contact only, never shown publicly.">
        {({ id }) => <Input id={id} name="phone" defaultValue={user.phone} />}
      </Field>
      <Field label="WhatsApp" hint="Optional — lets buyers reach you directly.">
        {({ id }) => <Input id={id} name="whatsapp" defaultValue={user.whatsapp} />}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
