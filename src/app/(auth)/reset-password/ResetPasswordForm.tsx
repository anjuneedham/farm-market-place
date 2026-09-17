'use client';

import { useActionState } from 'react';
import { FormError } from '@/components/ui/Field';
import { PasswordField } from '@/components/ui/PasswordField';
import { Button } from '@/components/ui/Button';
import { updatePasswordAction } from '../actions';
import { initialFormState } from '@/lib/forms';

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        hint="At least 10 characters."
        required
        error={state.fields?.password}
      />

      <PasswordField
        label="Confirm new password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={state.fields?.confirmPassword}
      />

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Saving…' : 'Save new password'}
      </Button>
    </form>
  );
}
