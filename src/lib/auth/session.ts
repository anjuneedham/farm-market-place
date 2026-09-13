import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/repositories';
import type { User, UserRole } from '@/lib/types';
import { SESSION_COOKIE, createToken, hashToken, sessionDurationDays, signToken, unsignToken } from './tokens';

export type Session = { user: User };

/**
 * Reads the session cookie, verifies its signature, then looks the session up
 * by token hash. A forged cookie is rejected before any data access happens.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const signed = store.get(SESSION_COOKIE)?.value;
  if (!signed) return null;

  const token = unsignToken(signed);
  if (!token) return null;

  const record = db.sessions.byTokenHash(hashToken(token));
  if (!record) return null;

  if (Date.parse(record.expiresAt) <= Date.now()) {
    db.sessions.destroy(record.tokenHash);
    return null;
  }

  const user = db.users.byId(record.userId);
  if (!user) return null;

  // A suspended account loses access immediately, not at next sign-in.
  if (user.status !== 'ACTIVE') {
    db.sessions.destroyAllForUser(user.id);
    return null;
  }

  return { user };
}

export async function getCurrentUser(): Promise<User | null> {
  return (await getSession())?.user ?? null;
}

export async function createSession(userId: string): Promise<void> {
  const token = createToken();
  const expiresAt = new Date(Date.now() + sessionDurationDays() * 24 * 60 * 60 * 1000);

  // Only the hash is persisted, so a database leak yields no usable session.
  db.sessions.create(userId, hashToken(token), expiresAt.toISOString());
  db.users.touch(userId);

  const store = await cookies();
  store.set(SESSION_COOKIE, signToken(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const signed = store.get(SESSION_COOKIE)?.value;

  if (signed) {
    const token = unsignToken(signed);
    if (token) db.sessions.destroy(hashToken(token));
  }

  store.delete(SESSION_COOKIE);
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
