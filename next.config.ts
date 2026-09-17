import type { NextConfig } from 'next';

/**
 * Security headers are documented in docs/SECURITY.md §7.
 * The CSP intentionally omits 'unsafe-eval'. Next.js needs 'unsafe-inline'
 * for its bootstrap script in this configuration; moving to a nonce-based
 * policy is tracked as post-MVP hardening.
 *
 * connect-src includes the Supabase project host so the browser Supabase
 * client (src/lib/supabase/client.ts) can reach Auth + PostgREST directly —
 * falls back to the wildcard only if the env var isn't set at build time.
 */
const supabaseConnectSrc = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://*.supabase.co';
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseConnectSrc}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 256, 384],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
