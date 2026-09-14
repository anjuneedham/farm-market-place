'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { farmUpdateService } from '@/lib/services/farmUpdates';
import { fieldErrors } from '@/lib/validation';
import { z } from 'zod';
import type { FormState } from '@/lib/forms';

const farmUpdateSchema = z.object({
  body: z.string().trim().min(1, 'Write something before posting.').max(500),
  listingId: z.string().optional(),
});

export async function postFarmUpdateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();

  const parsed = farmUpdateSchema.safeParse({
    body: formData.get('body'),
    listingId: formData.get('listingId') || undefined,
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Write something before posting.', fields: fieldErrors(parsed.error) };
  }

  const result = await farmUpdateService.create(user, parsed.data);
  if (!result.ok) return { status: 'error', message: result.error.message, fields: result.error.fields };

  const farm = db.profiles.farmByUserId(user.id);
  if (farm) revalidatePath(`/farmers/${farm.slug}`);

  return { status: 'idle', message: 'posted' };
}
