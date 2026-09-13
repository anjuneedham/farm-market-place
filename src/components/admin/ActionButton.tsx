'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, type ButtonVariant } from '@/components/ui/Button';

/**
 * A confirm-then-run action button shared across every admin table.
 *
 * `action` must be a real Server Action reference (imported directly from a
 * "use server" module) — Next.js only recognizes such references across the
 * client/server boundary, not an arbitrary closure created in a Server
 * Component. Extra arguments are supplied at click time via `args`.
 */
export function AdminActionButton<Args extends unknown[]>({
  label,
  pendingLabel,
  variant = 'secondary',
  confirmMessage,
  action,
  args,
}: {
  label: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  confirmMessage?: string;
  action: (...args: Args) => Promise<{ error?: string }>;
  args: Args;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        variant={variant}
        disabled={pending}
        onClick={() => {
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          startTransition(async () => {
            const result = await action(...args);
            if (result.error) setError(result.error);
            else {
              setError(undefined);
              router.refresh();
            }
          });
        }}
      >
        {pending ? (pendingLabel ?? 'Working…') : label}
      </Button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
