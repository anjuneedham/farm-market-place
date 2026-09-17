import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Refreshes the Supabase Auth session cookie on every request (see
 * src/lib/supabase/middleware.ts), then applies the same defense-in-depth
 * for /admin as before: rejects requests with no signed-in user before any
 * React rendering happens. This does not replace requireRole('ADMIN') in
 * admin/layout.tsx — the proxy can only check that *someone* is signed in,
 * not that they're an admin (that requires a data lookup, which stays in the
 * layout). Both checks are required; neither alone is sufficient. See
 * docs/SECURITY.md §2.
 *
 * Named `proxy` per the Next.js 16 convention (renamed from `middleware`).
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);

  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets, so the Supabase session
     * cookie stays fresh everywhere, not only under /admin.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
