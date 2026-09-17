-- AgriLoop — Supabase migration 4: close PostgREST's default RPC exposure.
--
-- Postgres grants EXECUTE on a newly created function to the PUBLIC
-- pseudo-role by default, and every function in the `public` schema is
-- auto-exposed by PostgREST as /rest/v1/rpc/<fn> — meaning the trigger
-- functions from migration 02/03 were silently callable by anyone
-- (anon/authenticated) over the REST API, not just from their triggers.
-- None of them are meant to be invoked directly.

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_user_email_change() from anon, authenticated;
revoke execute on function public.protect_farm_admin_fields() from anon, authenticated;
revoke execute on function public.protect_business_admin_fields() from anon, authenticated;
revoke execute on function public.protect_buyer_admin_fields() from anon, authenticated;

-- Also flagged by the security advisor: missing an explicit search_path,
-- which makes the function's object resolution dependent on the caller's
-- search_path rather than a fixed one.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;
