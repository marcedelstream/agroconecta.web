create table if not exists public.page_view_counts (
  path text primary key,
  views bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.page_view_counts enable row level security;

grant select on public.page_view_counts to anon, authenticated;

drop policy if exists "page view counts are publicly readable" on public.page_view_counts;
create policy "page view counts are publicly readable"
  on public.page_view_counts
  for select
  using (true);

create or replace function public.increment_page_view(p_path text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_views bigint;
begin
  if p_path is null or left(p_path, 1) <> '/' or length(p_path) > 300 then
    raise exception 'invalid page path';
  end if;

  insert into public.page_view_counts(path, views, updated_at)
  values (p_path, 1, now())
  on conflict (path)
  do update set
    views = public.page_view_counts.views + 1,
    updated_at = now()
  returning views into next_views;

  return next_views;
end;
$$;

revoke all on function public.increment_page_view(text) from public;
grant execute on function public.increment_page_view(text) to service_role;

notify pgrst, 'reload schema';
