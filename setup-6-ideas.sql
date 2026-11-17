-- Fastaqim: owner Ideas inbox. Paste into Supabase → SQL Editor → Run. Safe to run twice.
-- 1) a status for each idea: New / Planned / Done
alter table public.fastaqim_feedback add column if not exists status text not null default 'new' check (status in ('new','planned','done'));

-- 2) a phone notification to the owner for every new idea (run setup-4 and setup-5 first)
create or replace function public.fastaqim_feedback_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.push_queue (user_id, at, title, body, tag, url, keep)
  select u.id, now(), case when new.kind = 'problem' then '🛠️ New problem report' else '💡 New idea' end,
         left(coalesce(nullif(new.name, ''), 'Guest') || ': ' || new.body, 200), 'fb-' || new.id, './#inbox', true
  from auth.users u join public.site_admins a on lower(a.email) = lower(u.email);
  return new;
exception when others then
  return new; -- an idea is always saved, even if the notification cannot be queued
end $$;
drop trigger if exists fastaqim_feedback_notify on public.fastaqim_feedback;
create trigger fastaqim_feedback_notify after insert on public.fastaqim_feedback
  for each row execute function public.fastaqim_feedback_notify();

select 'Ideas inbox is set up ✓' as result;
