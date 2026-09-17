/**
 * Password strength checks only — Supabase Auth owns hashing, storage and
 * verification (see docs/SECURITY.md §1). This file exists so the signup
 * form and validation schema can reject weak passwords before ever calling
 * supabase.auth.signUp().
 */

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
