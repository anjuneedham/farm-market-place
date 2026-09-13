'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { orderService } from '@/lib/services/orders';
import type { OrderStatus } from '@/lib/types';

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<{ error?: string }> {
  const { user } = await requireSession();
  const result = await orderService.setStatus(user, orderId, status);
  if (!result.ok) return { error: result.error.message };

  revalidatePath('/dashboard/farmer/orders');
  revalidatePath('/dashboard/buyer/orders');
  return {};
}
