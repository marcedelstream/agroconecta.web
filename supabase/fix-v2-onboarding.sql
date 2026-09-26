-- Agroconecta v2 — Fase 2: onboarding nuevo. Idempotente. NO correr en producción sin confirmación.
--
-- `consents` (creada para Karai en fix-karai-foundations.sql) tiene RLS activo pero ninguna policy:
-- desde la app no se podía registrar la aceptación de términos y del programa de puntos.

drop policy if exists "users read own consents" on public.consents;
create policy "users read own consents" on public.consents for select using (auth.uid() = profile_id);

drop policy if exists "users insert own consents" on public.consents;
create policy "users insert own consents" on public.consents for insert with check (auth.uid() = profile_id);
