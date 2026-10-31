-- ==============================================================================
-- Supabase Schema for Vaishnav's Journal (Web & Mobile Real-time Sync)
-- ==============================================================================

-- 1. Create table for journal entries
create table if not exists public.journal_entries (
    id text primary key,
    title text not null,
    subtitle text,
    content text not null,
    date text not null,
    mood text,
    category text,
    collection text,
    sort_order integer,
    tags text[] default '{}',
    created_at bigint not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security (RLS)
alter table public.journal_entries enable row level security;

-- 3. Drop existing policies if any
drop policy if exists "Allow public read access" on public.journal_entries;
drop policy if exists "Allow public insert access" on public.journal_entries;
drop policy if exists "Allow public update access" on public.journal_entries;
drop policy if exists "Allow public delete access" on public.journal_entries;

-- 4. Create policies for public access (anon key)
create policy "Allow public read access"
on public.journal_entries for select
to anon, authenticated
using (true);

create policy "Allow public insert access"
on public.journal_entries for insert
to anon, authenticated
with check (true);

create policy "Allow public update access"
on public.journal_entries for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow public delete access"
on public.journal_entries for delete
to anon, authenticated
using (true);

-- 5. Enable real-time updates for journal_entries
alter publication supabase_realtime add table public.journal_entries;
