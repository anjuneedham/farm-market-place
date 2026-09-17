import type { SupabaseClient } from '@supabase/supabase-js';
import type { BusinessProfile, BuyerProfile, FarmProfile, User } from '@/lib/types';

/**
 * The real, authoritative account vertical: the signed-in user's own row and
 * their own Farm/Business/BuyerProfile, read and written straight from
 * Supabase Postgres with RLS enforced per-request via the caller's JWT.
 *
 * Column names in these tables were designed to match these TS types
 * field-for-field (see supabase/migrations), so PostgREST's JSON response
 * casts directly — no field-by-field mapping needed.
 *
 * This is deliberately separate from src/lib/db/repositories/users.ts, which
 * is the in-memory demo/seed copy still used by marketplace display pages —
 * see that file's header comment for why the two aren't merged yet.
 */

export async function getUserRow(supabase: SupabaseClient, userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('User').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as User | null;
}

export async function updateUserRow(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<Pick<User, 'name' | 'phone' | 'whatsapp' | 'avatarUrl'>>,
): Promise<User> {
  const { data, error } = await supabase
    .from('User')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as User;
}

export async function getFarmProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<FarmProfile | null> {
  const { data, error } = await supabase
    .from('FarmProfile')
    .select('*')
    .eq('userId', userId)
    .maybeSingle();
  if (error) throw error;
  return data as FarmProfile | null;
}

export async function getBusinessProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<BusinessProfile | null> {
  const { data, error } = await supabase
    .from('BusinessProfile')
    .select('*')
    .eq('userId', userId)
    .maybeSingle();
  if (error) throw error;
  return data as BusinessProfile | null;
}

export async function getBuyerProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<BuyerProfile | null> {
  const { data, error } = await supabase
    .from('BuyerProfile')
    .select('*')
    .eq('userId', userId)
    .maybeSingle();
  if (error) throw error;
  return data as BuyerProfile | null;
}

/**
 * Inserts a row whose slug column has a UNIQUE constraint, retrying once
 * with a random suffix if the base slug is already taken (Postgres error
 * 23505) rather than failing the whole signup over a name collision.
 */
async function insertWithUniqueSlug<T>(
  supabase: SupabaseClient,
  table: string,
  base: Record<string, unknown>,
  nameForSlug: string,
): Promise<T> {
  const attempt = async (slug: string) =>
    supabase.from(table).insert({ ...base, slug }).select('*').single();

  let { data, error } = await attempt(slugify(nameForSlug));
  if (error?.code === '23505') {
    ({ data, error } = await attempt(`${slugify(nameForSlug)}-${randomSuffix()}`));
  }
  if (error) throw error;
  return data as T;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

type NewFarmProfile = Pick<FarmProfile, 'userId' | 'name' | 'countryCode' | 'regionId'> &
  Partial<Pick<FarmProfile, 'communityId'>>;

export async function createFarmProfile(
  supabase: SupabaseClient,
  input: NewFarmProfile,
): Promise<FarmProfile> {
  return insertWithUniqueSlug<FarmProfile>(supabase, 'FarmProfile', input, input.name);
}

export type FarmProfileEdit = Partial<
  Pick<
    FarmProfile,
    | 'name'
    | 'tagline'
    | 'story'
    | 'regionId'
    | 'communityId'
    | 'yearsFarming'
    | 'farmSizeAcres'
    | 'methods'
    | 'specialties'
    | 'acceptsPickup'
    | 'acceptsDelivery'
    | 'deliveryNotes'
    | 'coverImageUrl'
    | 'logoUrl'
  >
>;

export async function updateFarmProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: FarmProfileEdit,
): Promise<FarmProfile> {
  const { data, error } = await supabase
    .from('FarmProfile')
    .update(patch)
    .eq('userId', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as FarmProfile;
}

type NewBusinessProfile = Pick<
  BusinessProfile,
  'userId' | 'name' | 'type' | 'countryCode' | 'regionId'
> &
  Partial<Pick<BusinessProfile, 'communityId'>>;

export async function createBusinessProfile(
  supabase: SupabaseClient,
  input: NewBusinessProfile,
): Promise<BusinessProfile> {
  return insertWithUniqueSlug<BusinessProfile>(supabase, 'BusinessProfile', input, input.name);
}

export type BusinessProfileEdit = Partial<
  Pick<
    BusinessProfile,
    | 'name'
    | 'tagline'
    | 'description'
    | 'regionId'
    | 'communityId'
    | 'website'
    | 'servicesOffered'
    | 'coverImageUrl'
    | 'logoUrl'
  >
>;

export async function updateBusinessProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: BusinessProfileEdit,
): Promise<BusinessProfile> {
  const { data, error } = await supabase
    .from('BusinessProfile')
    .update(patch)
    .eq('userId', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as BusinessProfile;
}

type NewBuyerProfile = Pick<BuyerProfile, 'userId' | 'displayName' | 'countryCode' | 'regionId'> &
  Partial<Pick<BuyerProfile, 'type' | 'organisation'>>;

export async function createBuyerProfile(
  supabase: SupabaseClient,
  input: NewBuyerProfile,
): Promise<BuyerProfile> {
  return insertWithUniqueSlug<BuyerProfile>(supabase, 'BuyerProfile', input, input.displayName);
}

export type BuyerProfileEdit = Partial<
  Pick<BuyerProfile, 'displayName' | 'type' | 'organisation' | 'description' | 'regionId' | 'logoUrl'>
>;

export async function updateBuyerProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: BuyerProfileEdit,
): Promise<BuyerProfile> {
  const { data, error } = await supabase
    .from('BuyerProfile')
    .update(patch)
    .eq('userId', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as BuyerProfile;
}

/**
 * A UNIQUE constraint on FarmProfile/BusinessProfile.slug and
 * BuyerProfile.slug means a collision throws a 23505 from Postgres rather
 * than silently overwriting someone else's profile — acceptable for the
 * initial create-at-signup case (a real, human-entered farm/business/display
 * name colliding with an existing one is rare), unlike the in-memory
 * uniqueSlug() helper this deliberately doesn't reuse.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}
