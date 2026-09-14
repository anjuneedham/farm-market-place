'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';

export async function markAllNotificationsReadAction(): Promise<void> {
  const { user } = await requireSession();
  db.notifications.markAllRead(user.id);
  revalidatePath('/notifications');
}
