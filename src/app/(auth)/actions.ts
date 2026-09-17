'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { destroySession, getCurrentUser } from '@/lib/auth/session';
import { dashboardPathFor } from '@/lib/auth/permissions';
import { authService } from '@/lib/services/auth';
import { createClient } from '@/lib/supabase/server';
import { passwordProblem } from '@/lib/auth/password';
import { fieldErrors, emailSchema, signInSchema, signUpSchema } from '@/lib/validation';
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

  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  if (password !== confirmPassword) {
    return {
      status: 'error',
      message: 'Passwords do not match.',
      fields: { confirmPassword: 'Passwords do not match.' },
    };
  }
  const strength = passwordProblem(password);
  if (strength) {
    return { status: 'error', message: strength, fields: { password: strength } };
  }

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: 'error', message: 'Check the highlighted fields.', fields: fieldErrors(parsed.error) };
  }

  const result = await authService.signUp(parsed.data);
  if (!result.ok) {
    return { status: 'error', message: result.error.message, fields: result.error.fields };
  }

  if (result.data.needsEmailConfirmation) {
    return {
      status: 'idle',
      message: 'confirm-email',
    };
  }

  redirect(dashboardPathFor(result.data.user));
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

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) {
    return { status: 'error', message: 'Enter a valid email address.', fields: { email: 'Enter a valid email address.' } };
  }

  const result = await authService.requestPasswordReset(parsed.data);
  if (!result.ok) {
    return { status: 'error', message: result.error.message };
  }

  return { status: 'idle', message: 'reset-email-sent' };
}

/**
 * Called from /reset-password, where the user already has a short-lived
 * "recovery" session established by following the emailed link — Supabase
 * accepts a plain updateUser({ password }) call in that state without
 * needing the old password.
 */
export async function updatePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    return { status: 'error', message: 'Passwords do not match.', fields: { confirmPassword: 'Passwords do not match.' } };
  }
  const strength = passwordProblem(password);
  if (strength) {
    return { status: 'error', message: strength, fields: { password: strength } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      status: 'error',
      message: 'That reset link has expired or was already used. Request a new one.',
    };
  }

  const user = await getCurrentUser();
  redirect(user ? dashboardPathFor(user) : '/signin');
}
