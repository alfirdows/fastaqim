create table public.family_links (
  guardian_id uuid references auth.users on delete cascade,
  member_id uuid references auth.users on delete cascade,
  guardian_name text, member_name text,
  created_at timestamptz default now(),
  primary key (guardian_id, member_id)
);
alter table public.family_links enable row level security;
create policy "see my links" on public.family_links
  for select using (auth.uid() = guardian_id or auth.uid() = member_id);
create policy "guardian can unlink" on public.family_links
  for delete using (auth.uid() = guardian_id);

create table public.family_codes (
  code text primary key,
  guardian_id uuid references auth.users on delete cascade,
  guardian_name text,
  created_at timestamptz default now()
);
alter table public.family_codes enable row level security;
create policy "my codes" on public.family_codes
  for all using (auth.uid() = guardian_id) with check (auth.uid() = guardian_id);

create or replace function public.join_family(p_code text, p_name text)
returns text language plpgsql security definer set search_path = public as $$
declare g uuid; gn text;
begin
  select guardian_id, guardian_name into g, gn from family_codes
   where code = upper(p_code) and created_at > now() - interval '7 days';
  if g is null then raise exception 'Code not found or expired'; end if;
  if g = auth.uid() then raise exception 'That is your own code'; end if;
  insert into family_links (guardian_id, member_id, guardian_name, member_name)
   values (g, auth.uid(), gn, p_name) on conflict do nothing;
  return gn;
end $$;
revoke execute on function public.join_family(text, text) from anon, public;
grant execute on function public.join_family(text, text) to authenticated;

create policy "guardian can see member" on public.fastaqim_state
  for select using (exists (select 1 from public.family_links f
    where f.member_id = fastaqim_state.user_id and f.guardian_id = auth.uid()));

create table public.site_admins (email text primary key);
alter table public.site_admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from site_admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

create or replace function public.admin_users()
returns table (user_id uuid, email text, joined timestamptz, last_sign_in timestamptz, updated_at timestamptz, state jsonb)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at, s.updated_at, s.state
    from auth.users u left join public.fastaqim_state s on s.user_id = u.id
    order by coalesce(s.updated_at, u.created_at) desc;
end $$;
revoke execute on function public.admin_users() from anon, public;
grant execute on function public.admin_users() to authenticated;

-- Put the email YOU sign in with between the quotes:
insert into public.site_admins (email) values ('YOUR-EMAIL-HERE');
