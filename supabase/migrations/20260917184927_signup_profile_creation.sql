-- AgriLoop — Supabase migration 6: create the role-specific profile at
-- signup time, from auth.users trigger metadata, instead of relying on a
-- follow-up authenticated client insert.
--
-- Why: if the Supabase project requires email confirmation before issuing a
-- session, a client-side "insert my FarmProfile now" call right after
-- signUp() would have no JWT to satisfy RLS. Doing it here, in the same
-- SECURITY DEFINER trigger that already creates public."User", makes
-- profile creation unconditional on whether a session exists yet.

create or replace function public.unique_profile_slug(profile_table text, base_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base text;
  candidate text;
  suffix int := 1;
  taken boolean;
begin
  base := regexp_replace(lower(trim(base_name)), '[^a-z0-9]+', '-', 'g');
  base := trim(both '-' from base);
  if base = '' then
    base := 'profile';
  end if;

  candidate := base;
  loop
    execute format('select exists(select 1 from public.%I where slug = $1)', profile_table)
      into taken using candidate;
    exit when not taken;
    suffix := suffix + 1;
    candidate := base || '-' || suffix;
  end loop;

  return candidate;
end;
$$;

revoke execute on function public.unique_profile_slug(text, text) from public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  requested_role text;
  safe_role public.user_role;
  full_name text;
  country_code text;
  region_id text;
  community_id text;
begin
  meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested_role := meta ->> 'role';
  full_name := coalesce(nullif(meta ->> 'full_name', ''), split_part(new.email, '@', 1));
  country_code := coalesce(nullif(meta ->> 'countryCode', ''), 'JM');
  region_id := nullif(meta ->> 'regionId', '');
  community_id := nullif(meta ->> 'communityId', '');

  safe_role := case
    when requested_role in ('FARMER', 'BUSINESS') then requested_role::public.user_role
    else 'BUYER'::public.user_role
  end;

  insert into public."User" (id, email, name, role, status, "isDemoData")
  values (new.id, new.email, full_name, safe_role, 'ACTIVE', false);

  -- Only created when the client actually supplied the fields a profile
  -- needs (region is required by every profile table's NOT NULL FK) — a
  -- signup missing them just gets a bare User row; nothing here forces a
  -- profile to exist before the "complete your profile" flow can create one.
  if safe_role = 'FARMER' and region_id is not null and nullif(meta ->> 'farmName', '') is not null then
    insert into public."FarmProfile" (id, "userId", name, slug, "countryCode", "regionId", "communityId")
    values (
      extensions.gen_random_uuid()::text,
      new.id,
      meta ->> 'farmName',
      public.unique_profile_slug('FarmProfile', meta ->> 'farmName'),
      country_code,
      region_id,
      community_id
    );
  elsif safe_role = 'BUSINESS'
    and region_id is not null
    and nullif(meta ->> 'businessName', '') is not null
    and nullif(meta ->> 'businessType', '') is not null
  then
    insert into public."BusinessProfile" (id, "userId", name, slug, type, "countryCode", "regionId", "communityId")
    values (
      extensions.gen_random_uuid()::text,
      new.id,
      meta ->> 'businessName',
      public.unique_profile_slug('BusinessProfile', meta ->> 'businessName'),
      (meta ->> 'businessType')::public.business_type,
      country_code,
      region_id,
      community_id
    );
  elsif safe_role = 'BUYER' and region_id is not null then
    insert into public."BuyerProfile" (id, "userId", "displayName", slug, type, organisation, "countryCode", "regionId")
    values (
      extensions.gen_random_uuid()::text,
      new.id,
      coalesce(nullif(meta ->> 'organisation', ''), full_name),
      public.unique_profile_slug('BuyerProfile', coalesce(nullif(meta ->> 'organisation', ''), full_name)),
      coalesce(nullif(meta ->> 'buyerType', ''), 'HOUSEHOLD')::public.buyer_type,
      nullif(meta ->> 'organisation', ''),
      country_code,
      region_id
    );
  end if;

  return new;
end;
$$;
