import { db } from '@/lib/db/repositories';
import { getUserRow } from '@/lib/supabase/account';
import { createClient } from '@/lib/supabase/server';
import { getCountry } from '@/lib/location';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { siteUrl } from '@/lib/site-url';
import { fail, ok, type ServiceResult } from '@/lib/integrations/types';
import type { User } from '@/lib/types';
import type { z } from 'zod';
import type { signInSchema, signUpSchema } from '@/lib/validation';

type SignUpInput = z.infer<typeof signUpSchema>;
type SignInInput = z.infer<typeof signInSchema>;

/**
 * Sign-in and sign-up responses are deliberately non-enumerating: the same
 * message is returned whether or not an account exists (docs/SECURITY.md §1).
 */
const GENERIC_CREDENTIALS_ERROR = 'Email or password is incorrect.';

/**
 * True once a Supabase account exists but hasn't confirmed its email yet —
 * the caller has no session and no readable User row (RLS requires
 * auth.uid(), which is null pre-confirmation), only the fact that signUp()
 * itself succeeded.
 */
export type SignUpOutcome = { user: User; needsEmailConfirmation: false } | { user: null; needsEmailConfirmation: true };

/**
 * Translates a Supabase Auth error into copy a user should see. Branches on
 * `error.code` — a stable identifier GoTrue sets on every AuthError (e.g.
 * 'email_not_confirmed', 'user_already_exists') — rather than matching
 * `error.message` text, which is human-readable copy Supabase can reword at
 * any time without notice and isn't a documented, stable contract.
 */
function humaniseAuthError(error: { code?: string; message: string }): string {
  switch (error.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with that email already exists.';
    case 'weak_password':
      return 'Choose a stronger password (at least 10 characters).';
    case 'validation_failed':
    case 'email_address_invalid':
      return 'Enter a valid email address.';
    case 'email_not_confirmed':
      return 'Confirm your email before signing in — check your inbox for the link we sent.';
    case 'invalid_credentials':
      return GENERIC_CREDENTIALS_ERROR;
    default:
      return 'Something went wrong creating your account. Try again in a moment.';
  }
}

export const authService = {
  async signUp(input: SignUpInput): Promise<ServiceResult<SignUpOutcome>> {
    const limit = checkRateLimit('signUp', input.email);
    if (!limit.allowed) {
      return fail('rate_limited', 'Too many sign-up attempts. Try again in a few minutes.');
    }

    const country = getCountry(input.countryCode);
    if (!country) return fail('validation', 'Choose a country.', { countryCode: 'Choose a country.' });
    if (!country.isLive) {
      return fail('validation', `AgriLoop has not launched in ${country.name} yet.`, {
        countryCode: `AgriLoop has not launched in ${country.name} yet.`,
      });
    }

    // A region must belong to the country it is claimed under.
    if (!db.locations.regionBelongsToCountry(input.regionId, country.code)) {
      return fail('validation', `Choose a ${country.regionLabel.toLowerCase()}.`, {
        regionId: `Choose a ${country.regionLabel.toLowerCase()}.`,
      });
    }

    if (input.role === 'FARMER' && !input.farmName) {
      return fail('validation', 'Enter your farm name.', { farmName: 'Enter your farm name.' });
    }
    if (input.role === 'BUSINESS' && (!input.businessName || !input.businessType)) {
      return fail('validation', 'Enter your business details.', {
        businessName: 'Enter your business name.',
      });
    }

    const communityId =
      input.communityId && db.locations.communityBelongsToRegion(input.communityId, input.regionId)
        ? input.communityId
        : undefined;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${siteUrl()}/account`,
        // Read by the handle_new_user()/unique_profile_slug() trigger in
        // Postgres, which creates the User row and (when enough fields are
        // present) the role-specific profile row atomically with the
        // account itself — see supabase/migrations. 'ADMIN' is never
        // honoured from client-supplied metadata.
        data: {
          full_name: input.name,
          role: input.role,
          countryCode: country.code,
          regionId: input.regionId,
          communityId,
          farmName: input.farmName,
          businessName: input.businessName,
          businessType: input.businessType,
          buyerType: input.buyerType,
          organisation: input.organisation,
        },
      },
    });

    if (error) {
      if (error.status === 429) return fail('rate_limited', 'Too many sign-up attempts. Try again in a few minutes.');
      const message = humaniseAuthError(error);
      return fail('conflict', message, { email: message });
    }
    if (!data.user) {
      return fail('validation', 'Could not create your account. Try again.');
    }

    if (!data.session) {
      return ok({ user: null, needsEmailConfirmation: true });
    }

    const user = await getUserRow(supabase, data.user.id);
    if (!user) {
      return fail('validation', 'Your account was created but could not be loaded. Try signing in.');
    }
    return ok({ user, needsEmailConfirmation: false });
  },

  async signIn(input: SignInInput): Promise<ServiceResult<User>> {
    const limit = checkRateLimit('signIn', input.email);
    if (!limit.allowed) {
      return fail('rate_limited', 'Too many sign-in attempts. Try again in a few minutes.');
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      if (error.status === 429) return fail('rate_limited', 'Too many sign-in attempts. Try again in a few minutes.');
      if (error.code === 'email_not_confirmed') {
        return fail('forbidden', humaniseAuthError(error));
      }
      return fail('validation', GENERIC_CREDENTIALS_ERROR);
    }
    if (!data.user) return fail('validation', GENERIC_CREDENTIALS_ERROR);

    const user = await getUserRow(supabase, data.user.id);
    if (!user) return fail('validation', GENERIC_CREDENTIALS_ERROR);

    if (user.status === 'SUSPENDED') {
      await supabase.auth.signOut();
      return fail('forbidden', 'This account has been suspended. Contact AgriLoop support.');
    }
    if (user.status === 'PENDING_DELETION') {
      await supabase.auth.signOut();
      return fail('forbidden', 'This account is scheduled for deletion.');
    }

    return ok(user);
  },

  /**
   * Password reset request. Always reports success so the response cannot be
   * used to discover whether an address is registered — Supabase's own API
   * already behaves this way (it never reveals whether the email exists).
   */
  async requestPasswordReset(email: string): Promise<ServiceResult<null>> {
    const limit = checkRateLimit('passwordReset', email);
    if (!limit.allowed) {
      return fail('rate_limited', 'Too many requests. Try again later.');
    }

    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl()}/reset-password`,
    });
    return ok(null);
  },
};
