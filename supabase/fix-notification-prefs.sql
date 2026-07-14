-- Los toggles de notificaciones en el perfil (Perfil > Notificaciones) hoy solo cambian un
-- campo local en el dispositivo — nadie los lee al mandar los pushes. Esto persiste esas
-- preferencias en `profiles` para que el envío (manual y automático al aprobar una nota
-- importante) pueda filtrar destinatarios por categoría.

alter table public.profiles
  add column if not exists notification_prefs jsonb not null default '{
    "breakingNews": true,
    "priceAlerts": true,
    "weatherAlerts": true,
    "institutionalUpdates": false
  }'::jsonb;

notify pgrst, 'reload schema';
