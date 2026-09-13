'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { reviewService } from '@/lib/services/orders';
import { fieldErrors, reviewSchema } from '@/lib/validation';
import type { FormState } from '@/lib/forms';

export async function submitReviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();

  const parsed = reviewSchema.safeParse({
    orderId: formData.get('orderId'),
    rating: formData.get('rating'),
    body: formData.get('body') || undefined,
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Choose a rating.', fields: fieldErrors(parsed.error) };
  }

  const result = await reviewService.create(user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message };

  revalidatePath('/dashboard/buyer/orders');
  return { status: 'idle', message: 'reviewed' };
}
