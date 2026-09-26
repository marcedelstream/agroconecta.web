-- Agroconecta v2 — Fase 6: métricas de éxito (BACKEND-Y-DATOS.md §9), como vistas que lee /admin/metricas
-- con service role. Idempotente. Requiere fix-v2-feed.sql, fix-v2-points.sql y fix-v2-live-ads.sql.

-- Retención D1/D7/D30 por cohorte semanal (primer día con actividad en el feed).
create or replace view public.v2_metric_retention as
with days as (
  select user_id, (created_at at time zone 'America/Asuncion')::date as d
  from public.feed_events group by 1, 2
),
firsts as (select user_id, min(d) as first_day from days group by 1)
select
  date_trunc('week', f.first_day)::date as cohort_week,
  count(*) as users,
  round(100.0 * count(*) filter (where exists (select 1 from days x where x.user_id = f.user_id and x.d = f.first_day + 1)) / count(*), 1) as d1_pct,
  round(100.0 * count(*) filter (where exists (select 1 from days x where x.user_id = f.user_id and x.d between f.first_day + 7 and f.first_day + 13)) / count(*), 1) as d7_pct,
  round(100.0 * count(*) filter (where exists (select 1 from days x where x.user_id = f.user_id and x.d between f.first_day + 30 and f.first_day + 36)) / count(*), 1) as d30_pct
from firsts f
group by 1
order by 1 desc;

-- Sesiones (session_id de la app): items vistos y si hubo al menos una interacción.
create or replace view public.v2_metric_sessions as
with s as (
  select session_id,
         count(distinct source || ':' || source_id) filter (where event_type in ('impression', 'dwell', 'skip_fast')) as items,
         bool_or(event_type in ('like', 'save', 'share', 'cta_open', 'follow')) as interacted,
         min(created_at) as started_at
  from public.feed_events
  where created_at > now() - interval '30 days'
  group by session_id
)
select count(*) as sessions,
       round(avg(items), 1) as avg_items_per_session,
       round(100.0 * count(*) filter (where interacted) / nullif(count(*), 0), 1) as pct_sessions_with_interaction
from s;

-- CTR del botón de acción por fuente (post / evento / listing), últimos 30 días.
create or replace view public.v2_metric_cta as
select source,
       count(*) filter (where event_type = 'impression') as impressions,
       count(*) filter (where event_type = 'cta_open') as cta_opens,
       round(100.0 * count(*) filter (where event_type = 'cta_open') / nullif(count(*) filter (where event_type = 'impression'), 0), 2) as ctr_pct
from public.feed_events
where created_at > now() - interval '30 days'
group by source;

-- Participación, puntos y Karai (últimos 30 días).
create or replace view public.v2_metric_summary as
select
  (select count(distinct user_id) from public.feed_events where created_at > now() - interval '30 days') as active_users,
  (select count(*) from public.poll_votes where created_at > now() - interval '30 days') as poll_votes,
  (select count(*) from public.quiz_answers where created_at > now() - interval '30 days') as quiz_answers,
  (select coalesce(sum(delta), 0) from public.points_ledger where delta > 0 and created_at > now() - interval '30 days') as points_issued,
  (select coalesce(-sum(delta), 0) from public.points_ledger where delta < 0 and created_at > now() - interval '30 days') as points_redeemed,
  (select count(*) from public.usage_ledger where created_at > now() - interval '30 days') as karai_messages;

revoke all on public.v2_metric_retention, public.v2_metric_sessions, public.v2_metric_cta, public.v2_metric_summary from anon, authenticated;
