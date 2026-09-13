'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { fromMinor, toMinor } from '@/lib/money';
import { updatePlanPriceAction } from '../actions';

export function PlanPriceEditor({
  planId,
  currentMinor,
  currency,
}: {
  planId: string;
  currentMinor: number;
  currency: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(fromMinor(currentMinor, currency)));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-28 text-sm"
        aria-label="Plan price"
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await updatePlanPriceAction(planId, toMinor(Number(value), currency));
            if (result.error) setError(result.error);
            else {
              setError(undefined);
              router.refresh();
            }
          })
        }
      >
        {pending ? 'Saving…' : 'Update price'}
      </Button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
