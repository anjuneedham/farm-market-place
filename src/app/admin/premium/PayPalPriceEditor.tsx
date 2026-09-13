'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { fromMinor, toMinor } from '@/lib/money';
import { updatePlanPaypalPriceAction } from '../actions';

// PayPal's supported currency list — kept in sync with
// src/lib/integrations/paypal.ts SUPPORTED_CURRENCIES.
const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'CZK', 'DKK', 'HKD', 'ILS',
  'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'SEK', 'SGD', 'THB',
];

export function PayPalPriceEditor({
  planId,
  currentMinor,
  currentCurrency,
}: {
  planId: string;
  currentMinor?: number;
  currentCurrency?: string;
}) {
  const router = useRouter();
  const currency0 = currentCurrency ?? 'USD';
  const [currency, setCurrency] = useState(currency0);
  const [value, setValue] = useState(currentMinor ? String(fromMinor(currentMinor, currency0)) : '');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex items-center gap-2">
      <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-9 w-20 text-sm" aria-label="PayPal currency">
        {CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </Select>
      <Input
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Not set"
        className="h-9 w-24 text-sm"
        aria-label="PayPal price"
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending || !value}
        onClick={() =>
          startTransition(async () => {
            const result = await updatePlanPaypalPriceAction(planId, toMinor(Number(value), currency), currency);
            if (result.error) setError(result.error);
            else {
              setError(undefined);
              router.refresh();
            }
          })
        }
      >
        {pending ? 'Saving…' : 'Set PayPal price'}
      </Button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
