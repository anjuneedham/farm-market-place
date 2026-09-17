-- AgriLoop — Supabase migration 2/3: auth.users -> public."User" provisioning.
--
-- Runs as SECURITY DEFINER so it can write to public."User" regardless of the
-- inserting session's RLS grants (there is no session yet at signup time
-- anyway). The role is read from auth.users.raw_user_meta_data, which the
-- client sets via supabase.auth.signUp({ options: { data: { full_name, role } } })
-- — but 'ADMIN' is never honoured from that source, whatever the client
-- sends. Admin accounts are provisioned out-of-band (Supabase dashboard /
-- service-role script), never through public signup, per the brief.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  safe_role public.user_role;
begin
  requested_role := new.raw_user_meta_data ->> 'role';

  safe_role := case
    when requested_role in ('FARMER', 'BUSINESS') then requested_role::public.user_role
    else 'BUYER'::public.user_role
  end;

  insert into public."User" (id, email, name, role, status, "isDemoData")
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    safe_role,
    'ACTIVE',
    false
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep public."User".email in sync if it's ever changed through Supabase
-- Auth (email change flow) rather than only at signup.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public."User" set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();
