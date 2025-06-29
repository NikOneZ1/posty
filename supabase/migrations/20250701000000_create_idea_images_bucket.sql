-- create public bucket for idea images
insert into storage.buckets (id, name, public)
values ('idea-images', 'idea-images', true);
