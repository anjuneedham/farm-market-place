-- AgriLoop — Supabase migration 1/3: reference geography + identity tables.
-- Mirrors prisma/schema.prisma exactly for these models (see that file for
-- the authoritative field-by-field documentation). Table/column names are
-- kept PascalCase/camelCase to match Prisma's default mapping so a future
-- `prisma db pull` / `prisma migrate resolve` reconciles cleanly.

create type public.user_role as enum ('FARMER', 'BUYER', 'BUSINESS', 'ADMIN');
create type public.user_status as enum ('ACTIVE', 'SUSPENDED', 'PENDING_DELETION');
create type public.farming_method as enum ('CONVENTIONAL','ORGANIC_PRACTICES','GREENHOUSE','HYDROPONIC','MIXED','PASTURE_RAISED');
create type public.business_type as enum ('INPUT_SUPPLIER','EQUIPMENT','SERVICES','TRANSPORT','CONSULTING','TECHNOLOGY','PROCESSING','OTHER');
create type public.buyer_type as enum ('HOUSEHOLD','RESTAURANT','HOTEL','SUPERMARKET','WHOLESALER','CATERER','FOOD_MANUFACTURER','INSTITUTION','EXPORTER','OTHER');

-- ── Geography (pure reference/configuration data — see docs/PRODUCT_ARCHITECTURE.md §5) ──

create table public."Country" (
  code text primary key,
  name text not null,
  currency text not null,
  locale text not null default 'en-JM',
  "dialCode" text not null,
  "flagEmoji" text not null,
  "regionLabel" text not null default 'Region',
  "communityLabel" text not null default 'Community',
  "isLive" boolean not null default false,
  "sortOrder" integer not null default 0,
  "createdAt" timestamptz not null default now()
);
create index "Country_isLive_sortOrder_idx" on public."Country" ("isLive", "sortOrder");

create table public."Region" (
  id text primary key,
  "countryCode" text not null references public."Country"(code) on delete cascade,
  name text not null,
  slug text not null,
  latitude double precision,
  longitude double precision,
  "sortOrder" integer not null default 0,
  "isActive" boolean not null default true,
  unique ("countryCode", slug)
);
create index "Region_countryCode_sortOrder_idx" on public."Region" ("countryCode", "sortOrder");

create table public."Community" (
  id text primary key,
  "regionId" text not null references public."Region"(id) on delete cascade,
  name text not null,
  slug text not null,
  "isActive" boolean not null default true,
  unique ("regionId", slug)
);
create index "Community_regionId_name_idx" on public."Community" ("regionId", name);

-- ── Identity — User.id IS the Supabase Auth user id, not a separate app id ──
-- Credentials, sessions and password reset are entirely owned by Supabase
-- Auth (auth.users / auth.sessions / GoTrue's recovery flow) — there is no
-- passwordHash column here and no app-level Session/PasswordReset table.

create table public."User" (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role public.user_role not null,
  status public.user_status not null default 'ACTIVE',
  "avatarUrl" text,
  phone text,
  whatsapp text,
  "emailVerified" timestamptz,
  "lastSeenAt" timestamptz,
  "isDemoData" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table public."FarmProfile" (
  id text primary key default (extensions.gen_random_uuid()::text),
  "userId" uuid not null unique references public."User"(id) on delete cascade,
  name text not null,
  slug text not null unique,
  tagline text,
  story text,
  "countryCode" text not null references public."Country"(code),
  "regionId" text not null references public."Region"(id),
  "communityId" text references public."Community"(id),
  latitude double precision,
  longitude double precision,
  "yearsFarming" integer,
  "farmSizeAcres" double precision,
  methods public.farming_method[] not null default '{}',
  specialties text[] not null default '{}',
  "coverImageUrl" text,
  "logoUrl" text,
  "galleryUrls" text[] not null default '{}',
  "acceptsPickup" boolean not null default true,
  "acceptsDelivery" boolean not null default false,
  "deliveryNotes" text,
  "isVerified" boolean not null default false,
  "verifiedAt" timestamptz,
  "ratingAverage" double precision not null default 0,
  "ratingCount" integer not null default 0,
  "followerCount" integer not null default 0,
  "isDemoData" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index "FarmProfile_countryCode_regionId_isVerified_idx" on public."FarmProfile" ("countryCode", "regionId", "isVerified");
create index "FarmProfile_countryCode_ratingAverage_idx" on public."FarmProfile" ("countryCode", "ratingAverage" desc);

create table public."BusinessProfile" (
  id text primary key default (extensions.gen_random_uuid()::text),
  "userId" uuid not null unique references public."User"(id) on delete cascade,
  name text not null,
  slug text not null unique,
  type public.business_type not null,
  tagline text,
  description text,
  "countryCode" text not null references public."Country"(code),
  "regionId" text not null references public."Region"(id),
  "communityId" text references public."Community"(id),
  latitude double precision,
  longitude double precision,
  website text,
  "servicesOffered" text[] not null default '{}',
  "coverImageUrl" text,
  "logoUrl" text,
  "isVerified" boolean not null default false,
  "verifiedAt" timestamptz,
  "ratingAverage" double precision not null default 0,
  "ratingCount" integer not null default 0,
  "isDemoData" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index "BusinessProfile_countryCode_type_isVerified_idx" on public."BusinessProfile" ("countryCode", type, "isVerified");

create table public."BuyerProfile" (
  id text primary key default (extensions.gen_random_uuid()::text),
  "userId" uuid not null unique references public."User"(id) on delete cascade,
  "displayName" text not null,
  slug text not null unique,
  type public.buyer_type not null default 'HOUSEHOLD',
  organisation text,
  description text,
  "countryCode" text not null references public."Country"(code),
  "regionId" text not null references public."Region"(id),
  "logoUrl" text,
  "isVerified" boolean not null default false,
  "verifiedAt" timestamptz,
  "ratingAverage" double precision not null default 0,
  "ratingCount" integer not null default 0,
  "isDemoData" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index "BuyerProfile_countryCode_type_idx" on public."BuyerProfile" ("countryCode", type);

-- Keep updatedAt correct regardless of write path (PostgREST/supabase-js
-- today, Prisma Client later once DATABASE_URL exists) rather than relying
-- on any one client library to set it.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

create trigger "User_set_updated_at" before update on public."User"
  for each row execute function public.set_updated_at();
create trigger "FarmProfile_set_updated_at" before update on public."FarmProfile"
  for each row execute function public.set_updated_at();
create trigger "BusinessProfile_set_updated_at" before update on public."BusinessProfile"
  for each row execute function public.set_updated_at();
create trigger "BuyerProfile_set_updated_at" before update on public."BuyerProfile"
  for each row execute function public.set_updated_at();
