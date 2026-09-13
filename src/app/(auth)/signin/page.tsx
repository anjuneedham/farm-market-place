import type { Metadata } from 'next';
import Link from 'next/link';
import { requireGuest } from '../actions';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await requireGuest();
  const { next } = await searchParams;

  return (
    <div>
      <h1 className="text-h1 text-center">Welcome back</h1>
      <p className="mt-2 text-center text-ink-600">Sign in to your AgriLoop account.</p>
      <div className="mt-8">
        <SignInForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-ink-600">
        New to AgriLoop?{' '}
        <Link href="/signup" className="font-medium text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
