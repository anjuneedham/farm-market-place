'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { premiumService } from '@/lib/services/premium';
import { fieldErrors, shoppingListItemSchema, shoppingListSchema } from '@/lib/validation';
import type { FormState } from '@/lib/forms';

export async function createShoppingListAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireRole('BUYER');

  if (!premiumService.canCreateShoppingList(user)) {
    return {
      status: 'error',
      message: 'Free accounts get one shopping list. Upgrade to Premium for unlimited lists.',
    };
  }

  const parsed = shoppingListSchema.safeParse({
    name: formData.get('name'),
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) {
    return { status: 'error', message: 'Name your list.', fields: fieldErrors(parsed.error) };
  }

  db.shoppingLists.create(user.id, parsed.data.name, parsed.data.notes);
  revalidatePath('/dashboard/buyer/lists');
  return { status: 'idle' };
}

export async function addShoppingListItemAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireRole('BUYER');

  const parsed = shoppingListItemSchema.safeParse({
    listId: formData.get('listId'),
    label: formData.get('label'),
    quantity: formData.get('quantity') || undefined,
    unit: formData.get('unit') || undefined,
  });
  if (!parsed.success) {
    return { status: 'error', message: 'Add an item.', fields: fieldErrors(parsed.error) };
  }

  const list = db.shoppingLists.byId(parsed.data.listId);
  if (!list || list.ownerId !== user.id) {
    return { status: 'error', message: 'We could not find that list.' };
  }

  db.shoppingLists.addItem(parsed.data.listId, {
    label: parsed.data.label,
    quantity: parsed.data.quantity,
    unit: parsed.data.unit,
  });
  revalidatePath('/dashboard/buyer/lists');
  return { status: 'idle' };
}

export async function removeShoppingListItemAction(itemId: string): Promise<void> {
  await requireRole('BUYER');
  db.shoppingLists.removeItem(itemId);
  revalidatePath('/dashboard/buyer/lists');
}

export async function removeShoppingListAction(listId: string): Promise<void> {
  const { user } = await requireRole('BUYER');
  const list = db.shoppingLists.byId(listId);
  if (list && list.ownerId === user.id) {
    db.shoppingLists.remove(listId);
    revalidatePath('/dashboard/buyer/lists');
  }
}
