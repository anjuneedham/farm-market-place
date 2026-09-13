import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Session token minting and verification. See docs/SECURITY.md §1.
 *
 * The cookie carries `<token>.<hmac>`. Only SHA-256(token) is persisted, so a
 * database leak does not yield usable sessions, and the HMAC means a forged
 * cookie is rejected before any database lookup happens.
 */

const DEV_FALLBACK_SECRET = 'agriloop-development-only-secret-do-not-use-in-production';

let warnedAboutSecret = false;

export function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'AUTH_SECRET is not set. Refusing to start in production without a session signing secret. See .env.example.',
    );
  }
  if (!warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn(
      '[agriloop] AUTH_SECRET is not set — using a development fallback. Set it in .env.local before deploying.',
    );
  }
  return DEV_FALLBACK_SECRET;
}

export function createToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function signToken(token: string): string {
  const mac = createHmac('sha256', authSecret()).update(token).digest('base64url');
  return `${token}.${mac}`;
}

/** Returns the raw token when the signature is valid, otherwise null. */
export function unsignToken(signed: string): string | null {
  const index = signed.lastIndexOf('.');
  if (index <= 0) return null;

  const token = signed.slice(0, index);
  const provided = signed.slice(index + 1);
  const expected = createHmac('sha256', authSecret()).update(token).digest('base64url');

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? token : null;
}

export const SESSION_COOKIE = 'agriloop_session';

export function sessionDurationDays(): number {
  const raw = Number(process.env.AUTH_SESSION_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
}
