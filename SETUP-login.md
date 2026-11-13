# Turn on logins for Fastaqim (about 5 minutes, free)

1. Go to **supabase.com** and sign up (free plan). Click **New project**, name it `fastaqim`, pick a region near you, and set any database password (save it somewhere).
2. When the project is ready, open **SQL Editor** in the left menu, paste everything below, and press **Run**:

```sql
create table public.fastaqim_state (
  user_id uuid primary key references auth.users on delete cascade,
  state jsonb not null,
  updated_at timestamptz default now()
);
alter table public.fastaqim_state enable row level security;
create policy "own row only" on public.fastaqim_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

3. Open **Authentication → URL Configuration**. Set **Site URL** to `https://alfirdows.github.io/fastaqim/`.
4. Open **Project Settings → API** (or **Data API**). Copy two things and send them to Claude:
   - **Project URL** (looks like `https://abcd.supabase.co`)
   - **anon / publishable key** (a long text)

These two are safe to share: they're meant to be public. **Never** send the `service_role` or secret key, or your database password.

Also, if you haven't already: GitHub repo → **Settings → Pages** → Deploy from a branch → `main` / root → Save.
