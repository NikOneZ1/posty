create table public.ideas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  project_id uuid references public.projects on delete cascade not null,
  idea_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ideas enable row level security;

-- Allow users to select their own ideas
create policy "Users can view their own ideas" on public.ideas
  for select using (auth.uid() = user_id);

-- Allow users to insert ideas for themselves
create policy "Users can insert their own ideas" on public.ideas
  for insert with check (auth.uid() = user_id);

-- Allow users to update their own ideas (optional for MVP)
create policy "Users can update their own ideas" on public.ideas
  for update using (auth.uid() = user_id);

-- Allow users to delete their own ideas (optional for MVP)
create policy "Users can delete their own ideas" on public.ideas
  for delete using (auth.uid() = user_id);
