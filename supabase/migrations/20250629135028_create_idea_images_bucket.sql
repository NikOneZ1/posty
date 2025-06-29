-- Create bucket for idea images
insert into storage.buckets (id, name, public)
values ('idea-images', 'idea-images', true);

-- Allow authenticated users to manage their own files in the bucket
create policy "idea images read" on storage.objects
  for select using (bucket_id = 'idea-images');

create policy "idea images insert" on storage.objects
  for insert with check (bucket_id = 'idea-images' and auth.uid() = owner);

create policy "idea images update" on storage.objects
  for update using (bucket_id = 'idea-images' and auth.uid() = owner)
  with check (bucket_id = 'idea-images' and auth.uid() = owner);

create policy "idea images delete" on storage.objects
  for delete using (bucket_id = 'idea-images' and auth.uid() = owner);