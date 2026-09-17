-- AgriLoop — Supabase migration 7: indexes + RLS initplan fix flagged by the
-- performance advisor after migrations 01-06.

-- Covering indexes for FKs the profile tables' own composite indexes don't
-- already cover.
create index if not exists "FarmProfile_regionId_idx" on public."FarmProfile" ("regionId");
create index if not exists "FarmProfile_communityId_idx" on public."FarmProfile" ("communityId");
create index if not exists "BusinessProfile_regionId_idx" on public."BusinessProfile" ("regionId");
create index if not exists "BusinessProfile_communityId_idx" on public."BusinessProfile" ("communityId");
create index if not exists "BuyerProfile_regionId_idx" on public."BuyerProfile" ("regionId");

-- Wrap auth.<fn>() calls in a scalar subquery so Postgres evaluates them once
-- per statement instead of once per row (Supabase RLS performance guidance:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select).
drop policy "Users can read their own row" on public."User";
create policy "Users can read their own row"
  on public."User" for select
  using ((select auth.uid()) = id or public.is_admin());

drop policy "Users can update their own row, never their own role" on public."User";
create policy "Users can update their own row, never their own role"
  on public."User" for update
  using ((select auth.uid()) = id or public.is_admin())
  with check (
    public.is_admin()
    or ((select auth.uid()) = id and role = (select role from public."User" where id = (select auth.uid())))
  );

drop policy "Farmers can create their own farm profile" on public."FarmProfile";
create policy "Farmers can create their own farm profile"
  on public."FarmProfile" for insert
  with check (
    (select auth.uid()) = "userId"
    and exists (select 1 from public."User" u where u.id = (select auth.uid()) and u.role = 'FARMER')
  );

drop policy "Farmers can update their own farm profile" on public."FarmProfile";
create policy "Farmers can update their own farm profile"
  on public."FarmProfile" for update
  using ((select auth.uid()) = "userId" or public.is_admin())
  with check ((select auth.uid()) = "userId" or public.is_admin());

drop policy "Businesses can create their own business profile" on public."BusinessProfile";
create policy "Businesses can create their own business profile"
  on public."BusinessProfile" for insert
  with check (
    (select auth.uid()) = "userId"
    and exists (select 1 from public."User" u where u.id = (select auth.uid()) and u.role = 'BUSINESS')
  );

drop policy "Businesses can update their own business profile" on public."BusinessProfile";
create policy "Businesses can update their own business profile"
  on public."BusinessProfile" for update
  using ((select auth.uid()) = "userId" or public.is_admin())
  with check ((select auth.uid()) = "userId" or public.is_admin());

drop policy "Buyers can create their own buyer profile" on public."BuyerProfile";
create policy "Buyers can create their own buyer profile"
  on public."BuyerProfile" for insert
  with check (
    (select auth.uid()) = "userId"
    and exists (select 1 from public."User" u where u.id = (select auth.uid()) and u.role = 'BUYER')
  );

drop policy "Buyers can update their own buyer profile" on public."BuyerProfile";
create policy "Buyers can update their own buyer profile"
  on public."BuyerProfile" for update
  using ((select auth.uid()) = "userId" or public.is_admin())
  with check ((select auth.uid()) = "userId" or public.is_admin());
