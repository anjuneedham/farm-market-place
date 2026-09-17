'use client';

import { useActionState } from 'react';
import { Field, FormError, FormSuccess, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { forgotPasswordAction } from '../actions';
import { initialFormState } from '@/lib/forms';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialFormState);

  if (state.status === 'idle' && state.message === 'reset-email-sent') {
    return (
      <FormSuccess message="If an account exists for that email, we've sent a link to reset the password." />
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <Field label="Email address" required error={state.fields?.email}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}
