'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/session';
import {
  createBuyerProfile,
  getBuyerProfile,
  updateBuyerProfile,
  updateUserRow,
} from '@/lib/supabase/account';
import { createClient } from '@/lib/supabase/server';
import { passwordProblem } from '@/lib/auth/password';
import { db } from '@/lib/db/repositories';
import { buyerProfileSchema, fieldErrors } from '@/lib/validation';
import { getDefaultCountry } from '@/lib/location';
import { z } from 'zod';
import type { FormState } from '@/lib/forms';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80),
  phone: z.string().trim().max(24).optional(),
  whatsapp: z.string().trim().max(24).optional(),
});

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || undefined,
    whatsapp: formData.get('whatsapp') || undefined,
  });
  if (!parsed.success) {
    return { status: 'error', message: 'Enter a valid name.' };
  }

  const supabase = await createClient();
  await updateUserRow(supabase, user.id, parsed.data);
  revalidatePath('/account');
  return { status: 'idle', message: 'saved' };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();

  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');

  const supabase = await createClient();

  // Re-verifying via a live sign-in (rather than trusting the current
  // session alone) confirms the person at the keyboard still knows the
  // current password before Supabase Auth will accept a new one.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return { status: 'error', message: 'Current password is incorrect.' };
  }

  const problem = passwordProblem(newPassword);
  if (problem) return { status: 'error', message: problem };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { status: 'error', message: 'Could not update your password. Try again.' };
  }

  return { status: 'idle', message: 'password-changed' };
}

export async function updateBuyerProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();
  if (user.role !== 'BUYER') return { status: 'error', message: 'Not available for this account type.' };

  const parsed = buyerProfileSchema.safeParse({
    displayName: formData.get('displayName'),
    type: formData.get('type'),
    organisation: formData.get('organisation') || undefined,
    description: formData.get('description') || undefined,
    regionId: formData.get('regionId'),
  });
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }

  if (!db.locations.regionBelongsToCountry(parsed.data.regionId, getDefaultCountry().code)) {
    return { status: 'error', message: 'Choose a valid parish.', fields: { regionId: 'Choose a valid parish.' } };
  }

  const supabase = await createClient();
  const existing = await getBuyerProfile(supabase, user.id);

  if (existing) {
    await updateBuyerProfile(supabase, user.id, parsed.data);
  } else {
    await createBuyerProfile(supabase, {
      userId: user.id,
      displayName: parsed.data.displayName,
      countryCode: getDefaultCountry().code,
      regionId: parsed.data.regionId,
      type: parsed.data.type,
      organisation: parsed.data.organisation,
    });
    if (parsed.data.description) {
      await updateBuyerProfile(supabase, user.id, { description: parsed.data.description });
    }
  }

  revalidatePath('/account');
  return { status: 'idle', message: 'saved' };
}
