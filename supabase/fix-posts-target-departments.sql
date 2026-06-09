alter table public.posts
  add column if not exists target_departments text[] not null default '{}';

notify pgrst, 'reload schema';
