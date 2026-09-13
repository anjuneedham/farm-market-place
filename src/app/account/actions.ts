'use server';

import { revalidatePath } from 'next/cache';
import { createSession, requireSession } from '@/lib/auth/session';
import { db } from '@/lib/db/repositories';
import { hashPassword, passwordProblem, verifyPassword } from '@/lib/auth/password';
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

  db.users.update(user.id, parsed.data);
  revalidatePath('/account');
  return { status: 'idle', message: 'saved' };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();

  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return { status: 'error', message: 'Current password is incorrect.' };
  }

  const problem = passwordProblem(newPassword);
  if (problem) return { status: 'error', message: problem };

  db.users.update(user.id, { passwordHash: hashPassword(newPassword) });
  // Every session is invalidated, including this one, then a fresh session is
  // issued for the current device so the user isn't logged out by their own
  // password change.
  db.sessions.destroyAllForUser(user.id);
  await createSession(user.id);

  return { status: 'idle', message: 'password-changed' };
}
