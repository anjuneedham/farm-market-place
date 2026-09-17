-- AgriLoop — Supabase migration 5: migration 04 revoked EXECUTE from the
-- anon/authenticated roles directly, which does nothing on its own — every
-- role implicitly inherits whatever is granted to the PUBLIC pseudo-role,
-- so the real fix is revoking from PUBLIC itself. Verified via
-- has_function_privilege('anon'/'authenticated', ..., 'EXECUTE') before and
-- after; migration 04's revoke left all five functions still executable by
-- both roles.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_user_email_change() from public;
revoke execute on function public.protect_farm_admin_fields() from public;
revoke execute on function public.protect_business_admin_fields() from public;
revoke execute on function public.protect_buyer_admin_fields() from public;

-- handle_new_user()/handle_user_email_change() are auth-trigger-only — never
-- called directly by any client, so no role needs EXECUTE.
--
-- protect_*_admin_fields() run as BEFORE UPDATE triggers on a client-driven
-- UPDATE (a farmer/business/buyer saving their own profile), so the
-- `authenticated` role does need to be able to invoke them — anon never can
-- regardless, since anon has no UPDATE policy on these tables.
grant execute on function public.protect_farm_admin_fields() to authenticated;
grant execute on function public.protect_business_admin_fields() to authenticated;
grant execute on function public.protect_buyer_admin_fields() to authenticated;
