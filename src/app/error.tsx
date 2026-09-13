'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';

/**
 * The technical error is logged server-side only; the user sees a plain
 * sentence and a retry, per docs/SECURITY.md — stack traces never render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[agriloop] unhandled error', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-micro text-danger">Something went wrong</p>
      <h1 className="text-h1 mt-2">We hit a snag.</h1>
      <p className="mt-3 text-ink-600">
        Please try again. If the problem continues, come back in a few minutes.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
