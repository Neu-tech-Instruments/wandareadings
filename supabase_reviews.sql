-- Create a table for real user reviews
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_name text not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text not null,
  avatar_url text, -- URL to the uploaded image
  date_display text -- e.g. "Oct 24, 2025" or we can format created_at
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Allow public read/write (since anyone can review)
create policy "Public Reviews" on public.reviews for select using (true);
create policy "Public Insert Reviews" on public.reviews for insert with check (true);

-- STORAGE (for Avatars)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage Policies
create policy "Avatar Images are Public"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload Avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
