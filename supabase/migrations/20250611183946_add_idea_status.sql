-- Create enum type for idea status
create type public.idea_status as enum (
  'new',
  'content_generated',
  'ready',
  'posted',
  'archived'
);

-- Add status column to ideas table
alter table public.ideas 
add column status public.idea_status default 'new' not null;
