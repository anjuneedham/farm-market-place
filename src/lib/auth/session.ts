import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRow } from '@/lib/supabase/account';
import type { User, UserRole } from '@/lib/types';

export type Session = { user: User };

/**
 * Next.js signals redirect(), notFound(), and "this route needs dynamic
 * rendering" by throwing a special object carrying a `digest` string — not
 * a real error. A generic catch here must let those through unmodified;
 * swallowing them breaks Next's own static-generation detection (it did,
 * during a build, before this check was added).
 */
function isNextInternalSignal(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'digest' in error;
}

/**
 * Reads the Supabase Auth session from cookies (refreshed on every request
 * by proxy.ts) and joins it to the matching public."User" row. `auth.getUser()`
 * — not `getSession()` — is used deliberately: it revalidates the JWT against
 * Supabase's server on every call rather than trusting a cookie payload the
 * client could have tampered with. See docs/SECURITY.md §2.
 *
 * getCurrentUser() is called from the root layout's Header on every single
 * page, so a Supabase misconfiguration or outage here must degrade to
 * "nobody's signed in" rather than crashing every page on the site — it's
 * caught and logged instead of thrown. This never loosens security: every
 * real gate (requireSession, requireRole, RLS) treats a null session as
 * unauthenticated and denies by default.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    const user = await getUserRow(supabase, authUser.id);
    if (!user) return null;

    // A suspended account loses access immediately, not at next sign-in.
    if (user.status !== 'ACTIVE') {
      await supabase.auth.signOut();
      return null;
    }

    return { user };
  } catch (error) {
    if (isNextInternalSignal(error)) throw error;
    console.error('[session] getSession() failed — treating as signed out:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  return (await getSession())?.user ?? null;
}

/**
 * A no-op today: supabase.auth.signInWithPassword()/signUp() already set the
 * session cookies themselves (via the server client's cookie adapter) at the
 * moment they succeed, in src/lib/services/auth.ts. Kept as an exported,
 * awaitable function so call sites don't need to change if that ever stops
 * being true.
 */
export async function createSession(): Promise<void> {}

export async function destroySession(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/** Redirects to sign-in, preserving where the user was going. */
export async function requireSession(next?: string): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect(next ? `/signin?next=${encodeURIComponent(next)}` : '/signin');
  }
  return session;
}

export async function requireRole(role: UserRole | UserRole[], next?: string): Promise<Session> {
  const session = await requireSession(next);
  const allowed = Array.isArray(role) ? role : [role];

  if (!allowed.includes(session.user.role)) {
    // Admin surface area is not advertised: the wrong role gets a 404, not a
    // 403 that confirms the route exists. See docs/SECURITY.md §2.
    if (allowed.includes('ADMIN')) {
      const { notFound } = await import('next/navigation');
      notFound();
    }
    redirect('/');
  }

  return session;
}
