'use client';

import { type ComponentProps, type ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Every input has a real label, and errors are announced via aria-describedby
 * plus role="alert" (docs/DESIGN_SYSTEM.md §10).
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
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
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL =
  'w-full rounded-[10px] border bg-surface px-3 text-ink-900 placeholder:text-ink-300 ' +
  'transition-colors focus:border-brand-600 focus:outline-none';

export function Input({
  invalid,
  className,
  ...props
}: { invalid?: boolean } & ComponentProps<'input'>) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, 'h-11', invalid ? 'border-danger' : 'border-line-strong', className)}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: { invalid?: boolean } & ComponentProps<'textarea'>) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        'min-h-28 py-2.5 leading-relaxed',
        invalid ? 'border-danger' : 'border-line-strong',
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...props
}: { invalid?: boolean } & ComponentProps<'select'>) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        'h-11 appearance-none bg-[length:16px] pr-9',
        invalid ? 'border-danger' : 'border-line-strong',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%2347554e' stroke-width='1.5'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 12px center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }: { label: string } & ComponentProps<'input'>) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 py-1 text-sm', className)}>
      <input
        type="checkbox"
        className="h-5 w-5 shrink-0 rounded border-line-strong text-brand-600 accent-brand-600"
        {...props}
      />
      <span className="text-ink-800">{label}</span>
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-[10px] border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger"
    >
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-[10px] border border-positive/20 bg-positive-soft px-3 py-2.5 text-sm font-medium text-positive"
    >
      {message}
    </div>
  );
}
