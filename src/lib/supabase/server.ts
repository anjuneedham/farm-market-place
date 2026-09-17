import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabasePublishableKey, supabaseUrl } from './env';

/**
 * Server Supabase client — for Server Components, Server Actions and Route
 * Handlers. Reads/writes the auth cookies Supabase manages itself (access +
 * refresh token pair), so `getUser()` on the returned client validates the
 * session against Supabase Auth on every call.
 *
 * `cookies().set(...)` throws when called from a Server Component (only
 * Server Actions/Route Handlers may set cookies) — that's expected and
 * harmless here: `proxy.ts` refreshes the session cookie on every request,
 * so a Server Component that can't persist a refreshed token still gets a
 * correctly-refreshed one from the proxy on the next request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — see doc comment above.
        }
      },
    },
  });
}
