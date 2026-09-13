'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser, requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { messagingService, QUICK_MESSAGES } from '@/lib/services/messaging';
import { communityService } from '@/lib/services/community';
import { fieldErrors, reportSchema, startConversationSchema } from '@/lib/validation';
import type { FavoriteKind } from '@/lib/types';
import type { FormState } from '@/lib/forms';

export async function toggleFavoriteAction(
  kind: FavoriteKind,
  targetId: string,
): Promise<{ saved: boolean } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Sign in to save listings.' };

  const saved = db.favorites.toggle(user.id, kind, targetId);
  revalidatePath('/');
  return { saved };
}

export async function contactSellerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();

  const parsed = startConversationSchema.safeParse({
    recipientId: formData.get('recipientId'),
    listingId: formData.get('listingId') || undefined,
    buyerRequestId: formData.get('buyerRequestId') || undefined,
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Write a message before sending.', fields: fieldErrors(parsed.error) };
  }

  const result = await messagingService.start(session.user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  revalidatePath('/messages');
  return { status: 'idle', message: 'sent' };
}

export { QUICK_MESSAGES };

export async function reportContentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();

  const parsed = reportSchema.safeParse({
    targetType: formData.get('targetType'),
    targetId: formData.get('targetId'),
    reason: formData.get('reason'),
    details: formData.get('details') || undefined,
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Choose a reason for the report.', fields: fieldErrors(parsed.error) };
  }

  const result = await communityService.report(session.user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  return { status: 'idle', message: 'reported' };
}
