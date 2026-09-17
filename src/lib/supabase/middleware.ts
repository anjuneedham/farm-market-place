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
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

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
}
