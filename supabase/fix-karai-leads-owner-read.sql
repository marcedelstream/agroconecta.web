-- Permite que el dueño de un lead lea SUS PROPIOS registros (no los de otros usuarios) — se usa en
-- /karai/mis-datos, sección Comercial, para mostrarle al usuario las consultas comerciales que ya
-- generó ("Avisar a Agroconecta" o deteccion automatica del clasificador). Sigue sin haber policy
-- de insert/update/delete para el cliente — eso sigue siendo exclusivo del service role.

create policy "users read own leads" on karai_leads
  for select using (auth.uid() = profile_id);

notify pgrst, 'reload schema';
