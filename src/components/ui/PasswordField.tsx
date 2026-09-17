'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A password input with a show/hide toggle. Used anywhere a person types a
 * password (signup, signin, reset) so they can check what they typed before
 * submitting — mistyped passwords are one of the most common signup/signin
 * failures.
 */
export function PasswordField({
  label,
  name,
  autoComplete,
  hint,
  error,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  autoComplete: 'new-password' | 'current-password';
  hint?: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-800">
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-400">
          {hint}
        </p>
      ) : null}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          defaultValue={defaultValue}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-[10px] border bg-surface px-3 pr-11 text-ink-900 placeholder:text-ink-300',
            'transition-colors focus:border-brand-600 focus:outline-none',
            error ? 'border-danger' : 'border-line-strong',
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-400 hover:text-ink-700 focus:outline-none focus-visible:text-brand-600"
        >
          {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
