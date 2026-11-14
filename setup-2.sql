-- Fastaqim setup 2: paste ALL of this into Supabase > SQL Editor > New query, then tap Run.
-- Fastaqim owner page: user count + "request to view" (the user must allow it)
create table if not exists public.site_admins (email text primary key);
alter table public.site_admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from site_admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

create table if not exists public.view_requests (
  user_id uuid primary key references auth.users on delete cascade,
  status text not null default 'pending' check (status in ('pending','allowed','declined')),
  guardian boolean not null default false,
  requested_at timestamptz default now(),
  decided_at timestamptz
);
alter table public.view_requests enable row level security;
drop policy if exists "user sees own request" on public.view_requests;
create policy "user sees own request" on public.view_requests
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "user answers own request" on public.view_requests;
create policy "user answers own request" on public.view_requests
  for update using (auth.uid() = user_id and not (guardian and status = 'allowed'))
  with check (auth.uid() = user_id and status in ('allowed','declined'));
-- guardian links (under 18): once allowed, only the owner can remove them

create or replace function public.request_view(p_user uuid, p_guardian boolean default false) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  insert into view_requests (user_id, status, guardian, requested_at, decided_at) values (p_user, 'pending', p_guardian, now(), null)
  on conflict (user_id) do update set status = 'pending', guardian = p_guardian, requested_at = now(), decided_at = null;
end $$;

create or replace function public.remove_view(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  delete from view_requests where user_id = p_user;
end $$;

drop function if exists public.admin_users();
create or replace function public.admin_users()
returns table (user_id uuid, email text, name text, avatar text, joined timestamptz, last_active timestamptz, request text, guardian boolean)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query
    select u.id, u.email::text, s.state ->> 'name', s.state ->> 'avatar', u.created_at, s.updated_at, r.status, coalesce(r.guardian, false)
    from auth.users u
    left join public.fastaqim_state s on s.user_id = u.id
    left join public.view_requests r on r.user_id = u.id
    order by u.created_at desc;
end $$;

drop policy if exists "owner reads only when allowed" on public.fastaqim_state;
create policy "owner reads only when allowed" on public.fastaqim_state
  for select using (public.is_admin() and exists (
    select 1 from public.view_requests r where r.user_id = fastaqim_state.user_id and r.status = 'allowed'));

drop policy if exists "owner edits only when allowed" on public.fastaqim_state;
create policy "owner edits only when allowed" on public.fastaqim_state
  for update using (public.is_admin() and exists (
    select 1 from public.view_requests r where r.user_id = fastaqim_state.user_id and r.status = 'allowed'));

revoke execute on function public.request_view(uuid, boolean) from anon, public;
revoke execute on function public.remove_view(uuid) from anon, public;
grant execute on function public.remove_view(uuid) to authenticated;
revoke execute on function public.admin_users() from anon, public;
grant execute on function public.request_view(uuid, boolean) to authenticated;
grant execute on function public.admin_users() to authenticated;

-- Blocked words (owner adds extra words on the owner page)
create table if not exists public.fastaqim_blocklist (word text primary key);
alter table public.fastaqim_blocklist enable row level security;
drop policy if exists "everyone signed in reads blocked words" on public.fastaqim_blocklist;
create policy "everyone signed in reads blocked words" on public.fastaqim_blocklist for select to authenticated using (true);
drop policy if exists "owner edits blocked words" on public.fastaqim_blocklist;
create policy "owner edits blocked words" on public.fastaqim_blocklist for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Feedback (users send, only the owner reads)
create table if not exists public.fastaqim_feedback (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  email text, name text, kind text, body text not null check (char_length(body) <= 2000), lang text,
  seen boolean not null default false, created_at timestamptz not null default now());
alter table public.fastaqim_feedback enable row level security;
drop policy if exists "users send feedback" on public.fastaqim_feedback;
create policy "users send feedback" on public.fastaqim_feedback for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "owner reads feedback" on public.fastaqim_feedback;
create policy "owner reads feedback" on public.fastaqim_feedback for select to authenticated using (public.is_admin());
drop policy if exists "owner marks feedback" on public.fastaqim_feedback;
create policy "owner marks feedback" on public.fastaqim_feedback for update to authenticated using (public.is_admin());

-- Delete account: users mark it in the app; after 30 days it is removed for good (runs daily, free)
create extension if not exists pg_cron;
create or replace function public.purge_deleted_accounts() returns void
language plpgsql security definer set search_path = public, auth as $$
declare r record;
begin
  for r in select user_id from public.fastaqim_state
           where (state->>'deletedAt') is not null
             and to_timestamp((state->>'deletedAt')::bigint / 1000) < now() - interval '30 days' loop
    delete from public.fastaqim_state where user_id = r.user_id;
    delete from public.view_requests where user_id = r.user_id;
    delete from auth.users where id = r.user_id;
  end loop;
end $$;
revoke execute on function public.purge_deleted_accounts() from anon, authenticated, public;
select cron.schedule('fastaqim-purge-deleted', '0 3 * * *', 'select public.purge_deleted_accounts()');

-- Put the email YOU sign in with between the quotes:
insert into public.site_admins (email) values ('YOUR-EMAIL-HERE') on conflict do nothing;
