// Shared, validated env access for both the browser and server Supabase
// clients. Centralised so a missing variable fails loudly with a clear
// message instead of `createClient` throwing an opaque error deep inside
// @supabase/ssr.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to ` +
        `.env.local and fill in your Supabase project's URL and publishable key ` +
        `(Project Settings → API in the Supabase dashboard).`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required('NEXT_PUBLIC_SUPABASE_URL');
}

export function supabasePublishableKey(): string {
  return required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
}
