import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = { title: 'Set a new password' };

/**
 * Arrived at from the email link resetPasswordForEmail() sends
 * (src/lib/services/auth.ts), carrying a one-time PKCE `code`. Exchanging it
 * here establishes the short-lived "recovery" session updatePasswordAction
 * needs — deliberately not gated behind requireGuest(), since a signed-in
 * visitor following an old reset link should still be able to complete it.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  let linkIsValid = false;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    linkIsValid = !error;
  }

  if (!linkIsValid) {
    return (
      <div>
        <h1 className="text-h1 text-center">That link has expired</h1>
        <p className="mt-2 text-center text-ink-600">
          Password reset links only work once and expire after a while. Request a new one.
        </p>
        <p className="mt-6 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-h1 text-center">Set a new password</h1>
      <p className="mt-2 text-center text-ink-600">Choose a new password for your AgriLoop account.</p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
