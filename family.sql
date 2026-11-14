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
