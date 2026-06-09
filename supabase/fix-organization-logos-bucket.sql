insert into storage.buckets (id, name, public)
values ('organization-logos', 'organization-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read organization logos" on storage.objects;
create policy "public read organization logos" on storage.objects
  for select using (bucket_id = 'organization-logos');

notify pgrst, 'reload schema';
