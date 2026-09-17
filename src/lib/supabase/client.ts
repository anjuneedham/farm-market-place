'use client';

// Browser Supabase client — for Client Components only. Uses the
// publishable (anon) key, safe to expose: every query it makes is subject to
// the RLS policies in supabase/migrations, enforced by Postgres itself, not
// by this key. Never import this from a Server Component/Action; use
// src/lib/supabase/server.ts there instead.

import { createBrowserClient } from '@supabase/ssr';
import { supabasePublishableKey, supabaseUrl } from './env';

export function createClient() {
  return createBrowserClient(supabaseUrl(), supabasePublishableKey());
}
