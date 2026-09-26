-- Agroconecta v2 — Fase 2: puntos, encuestas y quiz. Ver docs/design_handoff_v2_feed/BACKEND-Y-DATOS.md §5.
-- Idempotente. NO correr en producción sin confirmación de Marce. Requiere fix-v2-feed.sql.
--
-- Principio: la app no decide nada que tenga valor. Los puntos solo se otorgan dentro de funciones
-- security definer; el cliente no puede insertar en el ledger, y la respuesta correcta del quiz vive
-- en una tabla sin policies (nadie la puede leer por la API) hasta que el usuario responde.

-- ── Configuración (decisiones D3 de Marce: se cambian acá sin tocar código) ──────────────────
create table if not exists public.points_config (
  key text primary key,
  value numeric,
  description text not null
);
insert into public.points_config (key, value, description) values
  ('welcome', 50, 'Puntos de bienvenida al terminar el onboarding'),
  ('poll_vote', 10, 'Puntos por responder una encuesta'),
  ('quiz_correct', 10, 'Puntos por cada respuesta correcta del quiz'),
  ('daily_cap', null, 'Tope diario de puntos ganados (null = sin tope)'),
  ('expiry_months', null, 'Meses hasta que vencen los puntos (null = no vencen)')
on conflict (key) do nothing;
alter table public.points_config enable row level security;
drop policy if exists "anyone reads points config" on public.points_config;
create policy "anyone reads points config" on public.points_config for select using (true);

-- ── Ledger: solo se agregan filas. El unique impide cobrar dos veces lo mismo. ───────────────
create table if not exists public.points_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  source text not null,
  source_ref text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (user_id, source, source_ref)
);
create index if not exists points_ledger_user_idx on public.points_ledger (user_id, created_at desc);
alter table public.points_ledger enable row level security;
drop policy if exists "users read own points" on public.points_ledger;
create policy "users read own points" on public.points_ledger for select using (auth.uid() = user_id);

-- Otorga puntos respetando email verificado y tope diario. Devuelve lo otorgado (0 si no corresponde
-- o si ya se había cobrado). Interna: no se expone a la API.
create or replace function public._award_points(p_user uuid, p_delta integer, p_source text, p_ref text, p_desc text)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v_cap numeric;
  v_today integer;
  v_amount integer := p_delta;
  v_inserted integer;
begin
  if p_delta <= 0 then return 0; end if;
  -- Antifraude mínimo: solo cuentas con email verificado (Google y el código por email ya lo están).
  if not exists (select 1 from auth.users u where u.id = p_user and u.email_confirmed_at is not null) then
    return 0;
  end if;
  select value into v_cap from public.points_config where key = 'daily_cap';
  if v_cap is not null then
    select coalesce(sum(delta), 0) into v_today from public.points_ledger
      where user_id = p_user and delta > 0 and created_at >= date_trunc('day', now() at time zone 'America/Asuncion') at time zone 'America/Asuncion';
    v_amount := least(p_delta, greatest(0, v_cap::integer - v_today));
    if v_amount = 0 then return 0; end if;
  end if;
  insert into public.points_ledger (user_id, delta, source, source_ref, description)
    values (p_user, v_amount, p_source, p_ref, p_desc)
    on conflict (user_id, source, source_ref) do nothing;
  get diagnostics v_inserted = row_count;
  return case when v_inserted > 0 then v_amount else 0 end;
end $$;
revoke execute on function public._award_points(uuid, integer, text, text, text) from public, anon, authenticated;

-- Saldo + últimos movimientos del usuario actual.
create or replace function public.get_points_summary()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'balance', coalesce((select sum(delta) from public.points_ledger where user_id = auth.uid()), 0),
    'history', coalesce((
      select json_agg(h) from (
        select delta, description, created_at from public.points_ledger
        where user_id = auth.uid() order by created_at desc limit 30
      ) h
    ), '[]'::json)
  )
$$;

create or replace function public.claim_welcome_points()
returns integer language plpgsql security definer set search_path = public as $$
declare v_points integer;
begin
  if auth.uid() is null then return 0; end if;
  select value::integer into v_points from public.points_config where key = 'welcome';
  return public._award_points(auth.uid(), coalesce(v_points, 0), 'welcome', 'welcome', 'Puntos de bienvenida');
end $$;

-- ── Encuestas ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  organization_id uuid references public.organizations(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  position integer not null default 0
);
create table if not exists public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
drop policy if exists "anyone reads active polls" on public.polls;
create policy "anyone reads active polls" on public.polls for select using (is_active);
drop policy if exists "anyone reads poll options" on public.poll_options;
create policy "anyone reads poll options" on public.poll_options for select using (true);
drop policy if exists "users read own votes" on public.poll_votes;
create policy "users read own votes" on public.poll_votes for select using (auth.uid() = user_id);
-- Sin policy de insert: se vota solo por vote_poll().

create or replace function public.poll_results(p_poll uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_object_agg(o.id, (select count(*) from public.poll_votes v where v.option_id = o.id)), '{}'::json)
  from public.poll_options o where o.poll_id = p_poll
$$;
-- Solo la llaman vote_poll() y el servidor del feed: los porcentajes se ven después de votar.
revoke execute on function public.poll_results(uuid) from public, anon, authenticated;

create or replace function public.vote_poll(p_poll uuid, p_option uuid)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_points integer;
  v_awarded integer := 0;
  v_inserted integer;
begin
  if v_user is null then raise exception 'No autorizado'; end if;
  if not exists (
    select 1 from public.polls p join public.poll_options o on o.poll_id = p.id
    where p.id = p_poll and o.id = p_option and p.is_active and (p.ends_at is null or p.ends_at > now())
  ) then raise exception 'Encuesta u opción inválida'; end if;

  insert into public.poll_votes (poll_id, option_id, user_id) values (p_poll, p_option, v_user)
    on conflict (poll_id, user_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted > 0 then
    select value::integer into v_points from public.points_config where key = 'poll_vote';
    v_awarded := public._award_points(v_user, coalesce(v_points, 0), 'poll', p_poll::text, 'Encuesta respondida');
  end if;
  return json_build_object(
    'myVote', (select option_id from public.poll_votes where poll_id = p_poll and user_id = v_user),
    'results', public.poll_results(p_poll),
    'awarded', v_awarded
  );
end $$;

-- ── Quiz ───────────────────────────────────────────────────────────────────────────────────
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization_id uuid references public.organizations(id) on delete set null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  position integer not null default 0,
  question text not null,
  options text[] not null check (array_length(options, 1) between 2 and 5)
);
-- La respuesta correcta vive aparte y SIN policies: ni anon ni authenticated la pueden leer.
create table if not exists public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  correct_index integer not null check (correct_index >= 0)
);
create table if not exists public.quiz_answers (
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chosen_index integer not null,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  primary key (question_id, user_id)
);
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_answers enable row level security;
drop policy if exists "anyone reads active quizzes" on public.quizzes;
create policy "anyone reads active quizzes" on public.quizzes for select using (is_active);
drop policy if exists "anyone reads quiz questions" on public.quiz_questions;
create policy "anyone reads quiz questions" on public.quiz_questions for select using (true);
drop policy if exists "users read own quiz answers" on public.quiz_answers;
create policy "users read own quiz answers" on public.quiz_answers for select using (auth.uid() = user_id);

create or replace function public.answer_quiz(p_question uuid, p_choice integer)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_correct integer;
  v_points integer;
  v_awarded integer := 0;
  v_inserted integer;
  v_quiz uuid;
begin
  if v_user is null then raise exception 'No autorizado'; end if;
  select q.quiz_id, k.correct_index into v_quiz, v_correct
    from public.quiz_questions q
    join public.quiz_answer_keys k on k.question_id = q.id
    join public.quizzes z on z.id = q.quiz_id
    where q.id = p_question and z.is_active and (z.ends_at is null or z.ends_at > now())
      and p_choice >= 0 and p_choice < array_length(q.options, 1);
  if v_quiz is null then raise exception 'Pregunta u opción inválida'; end if;

  -- Se responde una sola vez: un segundo intento devuelve lo ya respondido, sin puntos.
  insert into public.quiz_answers (question_id, user_id, chosen_index, is_correct)
    values (p_question, v_user, p_choice, p_choice = v_correct)
    on conflict (question_id, user_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted > 0 and p_choice = v_correct then
    select value::integer into v_points from public.points_config where key = 'quiz_correct';
    v_awarded := public._award_points(v_user, coalesce(v_points, 0), 'quiz', p_question::text, 'Respuesta correcta en un quiz');
  end if;
  return (
    select json_build_object('chosenIndex', a.chosen_index, 'correct', a.is_correct, 'correctIndex', v_correct, 'awarded', v_awarded)
    from public.quiz_answers a where a.question_id = p_question and a.user_id = v_user
  );
end $$;

-- Respuestas correctas de lo que el usuario YA respondió (para pintar el quiz al volver a verlo).
create or replace function public.my_quiz_answers(p_quiz uuid)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object(
    'questionId', a.question_id, 'chosenIndex', a.chosen_index, 'correct', a.is_correct, 'correctIndex', k.correct_index
  )), '[]'::json)
  from public.quiz_answers a
  join public.quiz_questions q on q.id = a.question_id
  join public.quiz_answer_keys k on k.question_id = a.question_id
  where q.quiz_id = p_quiz and a.user_id = auth.uid()
$$;

-- Las funciones públicas son solo para usuarios logueados.
revoke execute on function public.get_points_summary() from anon;
revoke execute on function public.claim_welcome_points() from anon;
revoke execute on function public.vote_poll(uuid, uuid) from anon;
revoke execute on function public.answer_quiz(uuid, integer) from anon;
revoke execute on function public.my_quiz_answers(uuid) from anon;
