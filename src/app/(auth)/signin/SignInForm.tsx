'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Field, FormError, Input } from '@/components/ui/Field';
import { PasswordField } from '@/components/ui/PasswordField';
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

      <div className="space-y-1.5">
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          error={state.fields?.password}
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
