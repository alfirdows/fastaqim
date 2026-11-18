-- Fastaqim setup 11 (18 Nov 2026): owner approvals. One row per item the owner approved or asked to change.
-- Only the owner (site_admins, via is_admin()) can read or write. Admins and users never see it.
create table if not exists public.fastaqim_decisions (
  id text primary key,
  answer text not null check (answer in ('approve','change','later')),
  note text,
  at timestamptz not null default now()
);
alter table public.fastaqim_decisions enable row level security;
drop policy if exists "owner reads decisions" on public.fastaqim_decisions;
create policy "owner reads decisions" on public.fastaqim_decisions for select to authenticated using (public.is_admin());
drop policy if exists "owner writes decisions" on public.fastaqim_decisions;
create policy "owner writes decisions" on public.fastaqim_decisions for insert to authenticated with check (public.is_admin());
drop policy if exists "owner updates decisions" on public.fastaqim_decisions;
create policy "owner updates decisions" on public.fastaqim_decisions for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "owner deletes decisions" on public.fastaqim_decisions;
create policy "owner deletes decisions" on public.fastaqim_decisions for delete to authenticated using (public.is_admin());
