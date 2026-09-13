'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { messagingService } from '@/lib/services/messaging';
import { fieldErrors, messageSchema } from '@/lib/validation';
import type { FormState } from '@/lib/forms';

export async function sendMessageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();

  const parsed = messageSchema.safeParse({
    conversationId: formData.get('conversationId'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Write a message.', fields: fieldErrors(parsed.error) };
  }

  const result = await messagingService.send(user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  revalidatePath(`/messages/${parsed.data.conversationId}`);
  return { status: 'idle' };
}
