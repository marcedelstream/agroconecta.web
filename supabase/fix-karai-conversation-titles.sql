-- Permite renombrar conversaciones desde el sidebar del chat (si es null, la UI sigue usando el
-- primer mensaje como preview/título automático).

alter table public.conversations
  add column if not exists title text;

notify pgrst, 'reload schema';
