-- AgriLoop — Supabase migration 3/3: Row Level Security.
--
-- Reference geography (Country/Region/Community) is public configuration
-- data with no owner column — public read, no write policy at all (writes
-- are an admin/migration-only operation, done via the service role or a
-- future admin tool, never through the client).

alter table public."Country" enable row level security;
alter table public."Region" enable row level security;
alter table public."Community" enable row level security;
alter table public."User" enable row level security;
alter table public."FarmProfile" enable row level security;
alter table public."BusinessProfile" enable row level security;
alter table public."BuyerProfile" enable row level security;

create policy "Reference geography is publicly readable"
  on public."Country" for select using (true);
create policy "Reference geography is publicly readable"
  on public."Region" for select using (true);
create policy "Reference geography is publicly readable"
  on public."Community" for select using (true);

-- SECURITY DEFINER helper so admin checks inside other policies don't hit
-- RLS-recursion edge cases and don't need to be repeated inline everywhere.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public."User" where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- ── User — holds PII (email/phone/whatsapp), so unlike the profile tables
-- below this is NOT publicly readable. Marketplace-facing "who is this
-- seller" display already comes from FarmProfile.name / BusinessProfile.name
-- / BuyerProfile.displayName, which deliberately live in the public tables
-- instead (same pattern the existing in-memory toPublicUser() helper uses).

create policy "Users can read their own row"
  on public."User" for select
  using (auth.uid() = id or public.is_admin());

-- INSERT has no policy at all: the only writer is handle_new_user(), which
-- runs SECURITY DEFINER and therefore bypasses RLS. A client can never
-- insert a User row directly through PostgREST.

create policy "Users can update their own row, never their own role"
  on public."User" for update
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (auth.uid() = id and role = (select role from public."User" where id = auth.uid()))
  );

-- No DELETE policy: account removal is a status change (status =
-- 'PENDING_DELETION'), matching the existing soft-delete convention — not a
-- row deletion a client can trigger.

-- ── Farmer / business / buyer profiles — the public storefront data.
-- Phase 11 of the brief: browsing farmer profiles is a PUBLIC action, not
-- one that requires auth, so SELECT is unrestricted here.

create policy "Farm profiles are publicly readable"
  on public."FarmProfile" for select using (true);
create policy "Business profiles are publicly readable"
  on public."BusinessProfile" for select using (true);
create policy "Buyer profiles are publicly readable"
  on public."BuyerProfile" for select using (true);

create policy "Farmers can create their own farm profile"
  on public."FarmProfile" for insert
  with check (
    auth.uid() = "userId"
    and exists (select 1 from public."User" u where u.id = auth.uid() and u.role = 'FARMER')
  );

create policy "Farmers can update their own farm profile"
  on public."FarmProfile" for update
  using (auth.uid() = "userId" or public.is_admin())
  with check (auth.uid() = "userId" or public.is_admin());

create policy "Businesses can create their own business profile"
  on public."BusinessProfile" for insert
  with check (
    auth.uid() = "userId"
    and exists (select 1 from public."User" u where u.id = auth.uid() and u.role = 'BUSINESS')
  );

create policy "Businesses can update their own business profile"
  on public."BusinessProfile" for update
  using (auth.uid() = "userId" or public.is_admin())
  with check (auth.uid() = "userId" or public.is_admin());

create policy "Buyers can create their own buyer profile"
  on public."BuyerProfile" for insert
  with check (
    auth.uid() = "userId"
    and exists (select 1 from public."User" u where u.id = auth.uid() and u.role = 'BUYER')
  );

create policy "Buyers can update their own buyer profile"
  on public."BuyerProfile" for update
  using (auth.uid() = "userId" or public.is_admin())
  with check (auth.uid() = "userId" or public.is_admin());

-- Verification and rating aggregates are admin/system-decided, not
-- owner-editable — a farmer must not be able to mark their own profile
-- Verified or inflate their own rating by including those fields in an
-- otherwise-legitimate profile-edit request. RLS policies can't compare
-- old vs. new column values on their own, so this is enforced with
-- triggers that silently pin the protected columns back to their prior
-- value unless the actor is an admin.

create or replace function public.protect_farm_admin_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new."isVerified" := old."isVerified";
    new."verifiedAt" := old."verifiedAt";
    new."ratingAverage" := old."ratingAverage";
    new."ratingCount" := old."ratingCount";
    new."followerCount" := old."followerCount";
  end if;
  return new;
end;
$$;
create trigger "FarmProfile_protect_admin_fields" before update on public."FarmProfile"
  for each row execute function public.protect_farm_admin_fields();

create or replace function public.protect_business_admin_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new."isVerified" := old."isVerified";
    new."verifiedAt" := old."verifiedAt";
    new."ratingAverage" := old."ratingAverage";
    new."ratingCount" := old."ratingCount";
  end if;
  return new;
end;
$$;
create trigger "BusinessProfile_protect_admin_fields" before update on public."BusinessProfile"
  for each row execute function public.protect_business_admin_fields();

create or replace function public.protect_buyer_admin_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new."isVerified" := old."isVerified";
    new."verifiedAt" := old."verifiedAt";
    new."ratingAverage" := old."ratingAverage";
    new."ratingCount" := old."ratingCount";
  end if;
  return new;
end;
$$;
create trigger "BuyerProfile_protect_admin_fields" before update on public."BuyerProfile"
  for each row execute function public.protect_buyer_admin_fields();
