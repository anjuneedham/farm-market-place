'use client';

import { useActionState, useRef } from 'react';
import { Field, FormError, FormSuccess, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { initialFormState } from '@/lib/forms';
import { changePasswordAction } from './actions';

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="max-w-sm space-y-4"
    >
      <FormError message={state.status === 'error' ? state.message : undefined} />
      {state.status === 'idle' && state.message === 'password-changed' ? (
        <FormSuccess message="Password changed." />
      ) : null}

      <Field label="Current password" required>
        {({ id }) => <Input id={id} name="currentPassword" type="password" autoComplete="current-password" required />}
      </Field>
      <Field label="New password" required hint="At least 10 characters.">
        {({ id }) => <Input id={id} name="newPassword" type="password" autoComplete="new-password" required />}
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? 'Updating…' : 'Change password'}
      </Button>
    </form>
  );
}
