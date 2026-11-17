-- Fastaqim: screenshots on ideas + "My ideas" for each user + a notice when the status changes.
-- Paste into Supabase → SQL Editor → Run. Safe to run twice. (Run setup-6 first.)

-- 1) one screenshot of the site per idea (a small JPEG made in the browser, max ~450 KB)
alter table public.fastaqim_feedback add column if not exists shot text
  check (shot is null or (char_length(shot) <= 600000 and shot like 'data:image/jpeg;base64,%'));
alter table public.fastaqim_feedback add column if not exists status_at timestamptz;
alter table public.fastaqim_feedback add column if not exists has_shot boolean generated always as (shot is not null) stored;

-- 2) each signed-in user can read only their own ideas (to see New / Planned / Done)
drop policy if exists "users read own feedback" on public.fastaqim_feedback;
create policy "users read own feedback" on public.fastaqim_feedback for select to authenticated
  using (user_id = auth.uid());

-- 3) a "Denied" status, owner can delete, sender can hide their own idea (owner still sees it)
alter table public.fastaqim_feedback drop constraint if exists fastaqim_feedback_status_check;
alter table public.fastaqim_feedback add constraint fastaqim_feedback_status_check check (status in ('new','planned','done','denied'));
alter table public.fastaqim_feedback add column if not exists hidden_by_sender boolean not null default false;
drop policy if exists "owner deletes feedback" on public.fastaqim_feedback;
create policy "owner deletes feedback" on public.fastaqim_feedback for delete to authenticated using (public.is_admin());
create or replace function public.fastaqim_feedback_hide(fid bigint) returns void
language sql security definer set search_path = public as $$
  update public.fastaqim_feedback set hidden_by_sender = true where id = fid and user_id = auth.uid();
$$;
revoke execute on function public.fastaqim_feedback_hide(bigint) from public, anon;
grant execute on function public.fastaqim_feedback_hide(bigint) to authenticated;

-- 4) when the owner changes the status, the sender gets a phone notice (if they turned reminders on)
create or replace function public.fastaqim_feedback_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare t text; b text;
begin
  if new.user_id is null or new.status is not distinct from old.status or new.status in ('new','denied') or new.hidden_by_sender then
    return new;
  end if;
  new.status_at := now();
  t := case coalesce(new.lang, 'en')
         when 'ar' then case new.status when 'done' then '✅ تمّ تنفيذ فكرتك' else '🗓️ فكرتك في الخطة' end
         when 'om' then case new.status when 'done' then '✅ Yaadni kee hojii irra oole' else '🗓️ Yaadni kee karoora keessa jira' end
         when 'so' then case new.status when 'done' then '✅ Fikraddaada waa la sameeyay' else '🗓️ Fikraddaada waa qorshaha ku jirtaa' end
         else case new.status when 'done' then '✅ Your idea is done' else '🗓️ Your idea is planned' end end;
  b := left(new.body, 160);
  insert into public.push_queue (user_id, at, title, body, tag, url, keep)
  values (new.user_id, now(), t, b, 'fbs-' || new.id, './#myideas', true);
  return new;
exception when others then
  return new; -- the status always saves, even if the notice cannot be queued
end $$;
drop trigger if exists fastaqim_feedback_status on public.fastaqim_feedback;
create trigger fastaqim_feedback_status before update on public.fastaqim_feedback
  for each row execute function public.fastaqim_feedback_status();
revoke execute on function public.fastaqim_feedback_status() from public, anon, authenticated;

select 'My ideas is set up ✓' as result;
