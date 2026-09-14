'use client';

import { useState, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { decideResponseAction } from '../actions';
import type { RequestResponseStatus } from '@/lib/types';

export function ResponseActions({
  responseId,
  initialStatus,
}: {
  responseId: string;
  initialStatus: RequestResponseStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function decide(next: 'ACCEPTED' | 'REJECTED') {
    startTransition(async () => {
      const result = await decideResponseAction(responseId, next);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus(next);
      setError(undefined);
    });
  }

  if (status === 'ACCEPTED') return <Badge tone="positive">Accepted</Badge>;
  if (status === 'REJECTED') return <Badge tone="danger">Declined</Badge>;

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => decide('REJECTED')}>
        <X className="h-3.5 w-3.5" aria-hidden />
        Decline
      </Button>
      <Button size="sm" disabled={pending} onClick={() => decide('ACCEPTED')}>
        <Check className="h-3.5 w-3.5" aria-hidden />
        Accept
      </Button>
    </div>
  );
}
