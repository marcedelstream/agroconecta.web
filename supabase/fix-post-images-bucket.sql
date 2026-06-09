insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read post images" on storage.objects;
create policy "public read post images" on storage.objects
  for select using (bucket_id = 'post-images');

notify pgrst, 'reload schema';
