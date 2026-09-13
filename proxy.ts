import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, unsignToken } from '@/lib/auth/tokens';

/**
 * Defense-in-depth for /admin: rejects requests with no plausibly-valid
 * session cookie before any React rendering happens. This does not replace
 * requireRole('ADMIN') in admin/layout.tsx — the proxy can only check that
 * the cookie is present and correctly signed, not that the user is an admin
 * (that requires a data lookup, which stays in the layout). Both checks are
 * required; neither alone is sufficient. See docs/SECURITY.md §2.
 *
 * Named `proxy` per the Next.js 16 convention (renamed from `middleware`).
 */
export function proxy(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const signed = request.cookies.get(SESSION_COOKIE)?.value;
    const token = signed ? unsignToken(signed) : null;

    if (!token) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
