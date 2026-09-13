import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Password hashing — scrypt via node:crypto. See docs/SECURITY.md §1.
 *
 * The stored format embeds the algorithm and its parameters:
 *   scrypt$N$r$p$<salt-hex>$<hash-hex>
 * so parameters can be raised later and old hashes transparently upgraded on
 * the next successful sign-in.
 */

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 200;

/**
 * A very small list of passwords that would otherwise pass the length check.
 * Composition rules are deliberately not used — they push people towards
 * "Password1!" — so this catches the obvious cases instead.
 */
const OBVIOUS_PASSWORDS = new Set([
  'password12',
  'password123',
  'password1234',
  '1234567890',
  '12345678901',
  'qwertyuiop',
  'agriloop12',
  'agriloop123',
  'letmein123',
  'iloveyou12',
  'welcome123',
  'adminadmin',
]);

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const derived = scryptSync(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P });
  return ['scrypt', N, R, P, salt.toString('hex'), derived.toString('hex')].join('$');
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const saltHex = parts[4];
  const hashHex = parts[5];
  if (!saltHex || !hashHex || !Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  try {
    const expected = Buffer.from(hashHex, 'hex');
    const derived = scryptSync(password.normalize('NFKC'), Buffer.from(saltHex, 'hex'), expected.length, {
      N: n,
      r,
      p,
    });
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** True when a hash was made with weaker parameters and should be upgraded. */
export function needsRehash(stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return true;
  return Number(parts[1]) < N || Number(parts[2]) < R || Number(parts[3]) < P;
}

export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Use at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  if (OBVIOUS_PASSWORDS.has(password.toLowerCase())) {
    return 'That password is too easy to guess. Try something less common.';
  }
  return null;
}
