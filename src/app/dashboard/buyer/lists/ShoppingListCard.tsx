'use client';

import { useActionState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { initialFormState } from '@/lib/forms';
import { addShoppingListItemAction, removeShoppingListAction, removeShoppingListItemAction } from './actions';
import type { ShoppingListView } from '@/lib/types';

export function ShoppingListCard({ list }: { list: ShoppingListView }) {
  const router = useRouter();
  const [, formAction, pending] = useActionState(addShoppingListItemAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink-900">{list.name}</h3>
        <button
          type="button"
          onClick={() => {
            void removeShoppingListAction(list.id);
            router.refresh();
          }}
          className="text-ink-400 hover:text-danger"
          aria-label={`Delete ${list.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {list.items.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {list.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span className="text-ink-700">
                {item.quantity ? `${item.quantity} ${item.unit ?? ''} ` : ''}
                {item.label}
              </span>
              <button
                type="button"
                onClick={() => {
                  void removeShoppingListItemAction(item.id);
                  router.refresh();
                }}
                className="text-xs text-ink-400 hover:text-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink-400">No items yet.</p>
      )}

      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
          router.refresh();
        }}
        className="mt-3 flex gap-2"
      >
        <input type="hidden" name="listId" value={list.id} />
        <Input name="label" placeholder="Add item…" required className="h-9 flex-1 text-sm" />
        <Input name="quantity" type="number" min={0} step="any" placeholder="Qty" className="h-9 w-16 text-sm" />
        <Input name="unit" placeholder="Unit" className="h-9 w-16 text-sm" />
        <Button type="submit" size="sm" disabled={pending}>
          Add
        </Button>
      </form>
    </div>
  );
}
