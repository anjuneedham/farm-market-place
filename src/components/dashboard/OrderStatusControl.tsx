'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Select } from '@/components/ui/Field';
import { canTransition } from '@/lib/order-transitions';
import { humanise } from '@/lib/utils';
import { updateOrderStatusAction } from '@/app/dashboard/orders-actions';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/types';

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const options = ORDER_STATUSES.filter((next) => next === status || canTransition(status, next));

  if (options.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Update order status"
        value={status}
        disabled={pending}
        className="h-9 w-40 text-sm"
        onChange={(e) =>
          startTransition(async () => {
            const result = await updateOrderStatusAction(orderId, e.target.value as OrderStatus);
            if (result.error) setError(result.error);
            else router.refresh();
          })
        }
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {humanise(option)}
          </option>
        ))}
      </Select>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}
