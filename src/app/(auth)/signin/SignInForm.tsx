'use client';

import { useActionState } from 'react';
import { Field, FormError, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { signInAction } from '../actions';
import { initialFormState } from '@/lib/forms';

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormError message={state.status === 'error' ? state.message : undefined} />

      <Field label="Email address" required error={state.fields?.email}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>

      <Field label="Password" required error={state.fields?.password}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-describedby={describedBy}
            invalid={invalid}
          />
        )}
      </Field>

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
