-- Eventos organizados por una organización de Agroconecta + campanita de notificaciones funcional.
--
-- Los eventos viven en el Supabase externo de eventosagropy.com, que tiene su PROPIA tabla
-- `organizations` (distinta a la nuestra, con su propio espacio de IDs). No hay FK real entre
-- ambas bases, así que acá guardamos un mapeo manual: el admin de Agroconecta completa el slug
-- de la organización correspondiente en eventosagropy.com, y con eso se buscan sus eventos.

alter table public.organizations
  add column if not exists events_organizer_slug text;

-- Campanita: si el usuario tiene una fila en user_subscriptions con notify=true, recibe avisos
-- de esa organización. Tocar la campanita sin estar siguiendo la organización primero la sigue.
alter table public.user_subscriptions
  add column if not exists notify boolean not null default true;

notify pgrst, 'reload schema';
