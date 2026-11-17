-- Fastaqim: snooze for reminders. Paste into Supabase → SQL Editor → Run. Safe to run twice.
-- (Only needed if setup-4-reminders.sql was run before 17 Nov 2026; the newer setup-4 already has this.)

-- snooze and "repeat until done" (safe to run again)
alter table public.push_queue add column if not exists ref text not null default '';
alter table public.push_queue add column if not exists rep int not null default 0 check (rep between 0 and 720);
alter table public.push_queue add column if not exists left_n int not null default 0 check (left_n between 0 and 50);
alter table public.push_queue add column if not exists keep boolean not null default false;
create index if not exists push_queue_ref on public.push_queue (user_id, ref) where not sent;

select 'Snooze is set up ✓' as result;
