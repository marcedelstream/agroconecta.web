-- PLANTILLA (no es un seed automático): cómo cargar una encuesta y un quiz reales hasta que exista el
-- panel en /admin. Reemplazá los textos y corré cada bloque en el SQL Editor de Supabase.
-- Requiere supabase/fix-v2-points.sql.

-- ── Encuesta ─────────────────────────────────────────────────────────────────────────────────
with p as (
  insert into public.polls (question) values ('¿Cuál es tu mayor desafío esta zafra?') returning id
)
insert into public.poll_options (poll_id, label, position)
select p.id, o.label, o.position from p, (values
  ('Costo de insumos', 1), ('Clima', 2), ('Precio de venta', 3), ('Mano de obra', 4)
) as o(label, position);

-- ── Quiz (3 preguntas; correct_index empieza en 0) ─────────────────────────────────────────────
with z as (insert into public.quizzes (title) values ('Quiz agro de la semana') returning id),
q as (
  insert into public.quiz_questions (quiz_id, position, question, options)
  select z.id, x.position, x.question, x.options from z, (values
    (1, '¿Qué cultivo ocupa la mayor superficie sembrada en Paraguay?', array['Soja', 'Maíz', 'Trigo']),
    (2, 'La zafriña de maíz normalmente se siembra…', array['Antes de la soja', 'Después de cosechar la soja', 'En pleno invierno']),
    (3, '¿Qué mide un pluviómetro?', array['Humedad del suelo', 'Velocidad del viento', 'Lluvia caída'])
  ) as x(position, question, options)
  returning id, position
)
insert into public.quiz_answer_keys (question_id, correct_index)
select q.id, k.correct from q join (values (1, 0), (2, 1), (3, 2)) as k(position, correct) on k.position = q.position;
