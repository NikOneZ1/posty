create table public.drafts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  project_id uuid references public.projects on delete cascade not null,
  idea_id uuid references public.ideas on delete cascade not null unique,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable row-level security
alter table public.drafts enable row level security;

-- RLS policies
create policy "Users can view their own drafts" on public.drafts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own drafts" on public.drafts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own drafts" on public.drafts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own drafts" on public.drafts
  for delete using (auth.uid() = user_id);
