/**
 * The canonical absolute origin for this deployment — used anywhere a full
 * URL must be built server-side (metadata, sitemap, and Supabase Auth's
 * password-reset/email-confirmation redirect links).
 *
 * NEXT_PUBLIC_SITE_URL is authoritative when set (works for both Vercel and
 * any other host). VERCEL_URL is Vercel's own auto-injected fallback for
 * preview deployments that don't have it configured — never hardcode a
 * production URL, per docs/SECURITY.md.
 */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
