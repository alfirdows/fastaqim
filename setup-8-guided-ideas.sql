-- Fastaqim: guided ideas box (which part of the app + a 1–5 rating). Paste into Supabase → SQL Editor → Run. Safe to run twice.
alter table public.fastaqim_feedback add column if not exists area text check (area is null or char_length(area) <= 20);
alter table public.fastaqim_feedback add column if not exists rating smallint check (rating is null or rating between 1 and 5);
select 'Guided ideas box is set up ✓' as result;
