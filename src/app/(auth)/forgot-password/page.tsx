import type { Metadata } from 'next';
import Link from 'next/link';
import { requireGuest } from '../actions';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = { title: 'Reset your password' };

export default async function ForgotPasswordPage() {
  await requireGuest();

  return (
    <div>
      <h1 className="text-h1 text-center">Reset your password</h1>
      <p className="mt-2 text-center text-ink-600">
        Enter the email on your account and we&apos;ll send you a link to reset it.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-ink-600">
        <Link href="/signin" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
