-- Fastaqim: reminders that arrive when the site is closed (free tier only).
-- Paste all of this into Supabase → SQL Editor → Run. Safe to run twice.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- each phone or browser that said "yes" to notifications
create table if not exists public.push_subs (
  endpoint text primary key,
  user_id uuid not null references auth.users on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "own push subs" on public.push_subs;
create policy "own push subs" on public.push_subs for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- the next two weeks of reminders, written by the site, sent by the server
create table if not exists public.push_queue (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  at timestamptz not null,
  title text not null,
  body text not null default '',
  tag text not null default '',
  url text not null default './',
  sent boolean not null default false
);
create index if not exists push_queue_due on public.push_queue (at) where not sent;
alter table public.push_queue enable row level security;
drop policy if exists "own push queue" on public.push_queue;
create policy "own push queue" on public.push_queue for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- server-only settings (no policies: the site can never read this table)
create table if not exists public.push_cfg (k text primary key, v text not null);
alter table public.push_cfg enable row level security;
insert into public.push_cfg (k, v)
  values ('cron', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
  on conflict (k) do nothing;

-- every minute: ask the "push" function to send what is due
select cron.unschedule('fastaqim-push') where exists (select 1 from cron.job where jobname = 'fastaqim-push');
select cron.schedule('fastaqim-push', '* * * * *', $$
  select net.http_post(
    url := 'https://xnxqibdjjrgjqpszvdbe.supabase.co/functions/v1/push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron', (select v from public.push_cfg where k = 'cron')),
    body := '{}'::jsonb
  );
$$);

-- keep the request log small
select cron.unschedule('fastaqim-push-tidy') where exists (select 1 from cron.job where jobname = 'fastaqim-push-tidy');
select cron.schedule('fastaqim-push-tidy', '7 3 * * *', $$ delete from net._http_response where created < now() - interval '1 day'; $$);

select 'Reminders are set up ✓' as result;
