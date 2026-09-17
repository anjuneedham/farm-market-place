import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabasePublishableKey, supabaseUrl } from './env';

/**
 * Refreshes the Supabase session cookie on every request that passes
 * through proxy.ts, and returns the (possibly refreshed) user alongside the
 * response that carries the updated cookies. This is the official
 * @supabase/ssr pattern for the Next.js middleware layer — without it,
 * access tokens expire mid-session and every server-side `getUser()` call
 * would intermittently fail even though the user never logged out.
 *
 * Runs on nearly every route (see proxy.ts's matcher), so it fails OPEN: a
 * missing/misconfigured Supabase env var or a transient network error here
 * must never take down the entire site. It's caught and logged instead —
 * the request proceeds unauthenticated, which only tightens (not loosens)
 * anything downstream, since every real auth check (requireSession,
 * requireRole, RLS) still runs independently and denies by default when
 * there's no valid session.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { response, user };
  } catch (error) {
    console.error('[proxy] Supabase session refresh failed — serving unauthenticated:', error);
    return { response: NextResponse.next({ request }), user: null };
  }
}
