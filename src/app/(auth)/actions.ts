'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { destroySession, getCurrentUser } from '@/lib/auth/session';
import { dashboardPathFor } from '@/lib/auth/permissions';
import { authService } from '@/lib/services/auth';
import { fieldErrors, signInSchema, signUpSchema } from '@/lib/validation';
import { getDefaultCountry } from '@/lib/location';
import type { FormState } from '@/lib/forms';

function toObject(formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'methods' || key === 'specialties' || key === 'tags' || key === 'imageUrls') {
      const list = (object[key] as string[] | undefined) ?? [];
      if (typeof value === 'string' && value) list.push(value);
      object[key] = list;
      continue;
    }
    object[key] = value;
  }
  return object;
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(toObject(formData));
  if (!parsed.success) {
    return { status: 'error', message: 'Enter a valid email and password.', fields: fieldErrors(parsed.error) };
  }

  const result = await authService.signIn(parsed.data);
  if (!result.ok) {
    return { status: 'error', message: result.error.message, fields: result.error.fields };
  }

  const next = formData.get('next');
  redirect(typeof next === 'string' && next.startsWith('/') ? next : dashboardPathFor(result.data));
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = toObject(formData);
  if (!raw.countryCode) raw.countryCode = getDefaultCountry().code;

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }

  const result = await authService.signUp(parsed.data);
  if (!result.ok) {
    return { status: 'error', message: result.error.message, fields: result.error.fields };
  }

  redirect(dashboardPathFor(result.data));
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  revalidatePath('/');
  redirect('/');
}

export async function requireGuest(): Promise<void> {
  const user = await getCurrentUser();
  if (user) redirect(dashboardPathFor(user));
}
