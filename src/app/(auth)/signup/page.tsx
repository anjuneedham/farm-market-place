import type { Metadata } from 'next';
import Link from 'next/link';
import { requireGuest } from '../actions';
import { SignUpForm } from './SignUpForm';

export const metadata: Metadata = { title: 'Join AgriLoop' };

export default async function SignUpPage() {
  await requireGuest();

  return (
    <div>
      <h1 className="text-h1 text-center">Join AgriLoop</h1>
      <p className="mt-2 text-center text-ink-600">Connect. Grow. Trade. Free to join.</p>
      <div className="mt-8">
        <SignUpForm />
      </div>
      <p className="mt-6 text-center text-sm text-ink-600">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
