import { db } from '@/lib/db/repositories';
import { hashPassword, needsRehash, passwordProblem, verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { getCountry } from '@/lib/location';
import { checkRateLimit } from '@/lib/security/rate-limit';
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

export const authService = {
  async signUp(input: SignUpInput): Promise<ServiceResult<User>> {
    const limit = checkRateLimit('signUp', input.email);
    if (!limit.allowed) {
      return fail('rate_limited', 'Too many sign-up attempts. Try again in a few minutes.');
    }

    const problem = passwordProblem(input.password);
    if (problem) return fail('validation', problem, { password: problem });

    const country = getCountry(input.countryCode);
    if (!country) return fail('validation', 'Choose a country.', { countryCode: 'Choose a country.' });
    if (!country.isLive) {
      return fail(
        'validation',
        `AgriLoop has not launched in ${country.name} yet.`,
        { countryCode: `AgriLoop has not launched in ${country.name} yet.` },
      );
    }

    // A region must belong to the country it is claimed under.
    if (!db.locations.regionBelongsToCountry(input.regionId, country.code)) {
      return fail('validation', `Choose a ${country.regionLabel.toLowerCase()}.`, {
        regionId: `Choose a ${country.regionLabel.toLowerCase()}.`,
      });
    }

    if (db.users.byEmail(input.email)) {
      return fail('conflict', 'An account with that email already exists.', {
        email: 'An account with that email already exists.',
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

    const user = db.users.create({
      email: input.email,
      passwordHash: hashPassword(input.password),
      name: input.name,
      role: input.role,
      status: 'ACTIVE',
    });

    const communityId =
      input.communityId && db.locations.communityBelongsToRegion(input.communityId, input.regionId)
        ? input.communityId
        : undefined;

    switch (input.role) {
      case 'FARMER':
        db.profiles.createFarm({
          userId: user.id,
          name: input.farmName!,
          countryCode: country.code,
          regionId: input.regionId,
          communityId,
          methods: [],
          specialties: [],
          galleryUrls: [],
          acceptsPickup: true,
          acceptsDelivery: false,
        });
        break;

      case 'BUSINESS':
        db.profiles.createBusiness({
          userId: user.id,
          name: input.businessName!,
          type: input.businessType!,
          countryCode: country.code,
          regionId: input.regionId,
          communityId,
          servicesOffered: [],
        });
        break;

      case 'BUYER':
        db.profiles.createBuyer({
          userId: user.id,
          displayName: input.organisation?.trim() || input.name,
          type: input.buyerType ?? 'HOUSEHOLD',
          organisation: input.organisation,
          countryCode: country.code,
          regionId: input.regionId,
        });
        break;
    }

    await createSession(user.id);
    return ok(user);
  },

  async signIn(input: SignInInput): Promise<ServiceResult<User>> {
    const limit = checkRateLimit('signIn', input.email);
    if (!limit.allowed) {
      return fail('rate_limited', 'Too many sign-in attempts. Try again in a few minutes.');
    }

    const user = db.users.byEmail(input.email);
    if (!user) return fail('validation', GENERIC_CREDENTIALS_ERROR);

    if (!verifyPassword(input.password, user.passwordHash)) {
      return fail('validation', GENERIC_CREDENTIALS_ERROR);
    }

    if (user.status === 'SUSPENDED') {
      return fail('forbidden', 'This account has been suspended. Contact AgriLoop support.');
    }
    if (user.status === 'PENDING_DELETION') {
      return fail('forbidden', 'This account is scheduled for deletion.');
    }

    // Transparent upgrade when hashing parameters have been raised since signup.
    if (needsRehash(user.passwordHash)) {
      db.users.update(user.id, { passwordHash: hashPassword(input.password) });
    }

    await createSession(user.id);
    return ok(user);
  },

  /**
   * Password reset request. Always reports success so the response cannot be
   * used to discover whether an address is registered.
   */
  async requestPasswordReset(email: string): Promise<ServiceResult<null>> {
    const limit = checkRateLimit('passwordReset', email);
    if (!limit.allowed) {
      return fail('rate_limited', 'Too many requests. Try again later.');
    }
    // Delivery is wired up once EmailService has a provider — see
    // docs/MVP_ROADMAP.md. The token store (PasswordReset) already exists in
    // the schema; nothing is sent today and the UI says so.
    return ok(null);
  },
};
