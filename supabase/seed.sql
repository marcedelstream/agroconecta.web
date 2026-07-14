-- Organizaciones de prueba, incluyendo Aliados (plan, categoria, contacto, logo) para poder
-- navegar el Directorio de Aliados y ver logos/badges reales en toda la app.
-- Se puede correr mas de una vez sin duplicar (upsert por slug).

insert into organizations (slug, name, description, type, is_verified, commercial_status, plan_name, logo_url)
values
  ('agroconecta-medios', 'Agroconecta Medios', 'Noticias, analisis y tendencias del agro desde el ecosistema Agroconecta.', 'media', true, 'active', 'Interno', 'https://ui-avatars.com/api/?name=Agroconecta&background=A4D233&color=0A0A13&size=256'),
  ('poder-agropecuario', 'Poder Agropecuario', 'Medio especializado en noticias y analisis del sector agropecuario paraguayo.', 'media', true, 'active', 'Medio aliado', 'https://ui-avatars.com/api/?name=PA&background=3B82F6&color=fff&size=256'),
  ('campo-agropecuario', 'Campo Agropecuario', 'El referente digital del campo paraguayo con cobertura nacional.', 'media', true, 'active', 'Medio aliado', 'https://ui-avatars.com/api/?name=CA&background=22C55E&color=fff&size=256'),
  ('abc-rural', 'ABC Rural', 'Seccion agropecuaria de ABC Color, el diario de mayor circulacion del pais.', 'media', true, 'trial', 'Piloto', 'https://ui-avatars.com/api/?name=AR&background=6B7280&color=fff&size=256'),
  ('asociacion-brangus', 'Asociacion Paraguaya de Brangus', 'Comunicados, remates, jornadas tecnicas y novedades oficiales de la raza Brangus.', 'asociacion', true, 'active', 'Asociacion Pro', 'https://ui-avatars.com/api/?name=Brangus&background=F59E0B&color=0A0A13&size=256'),
  ('arp', 'Asociacion Rural del Paraguay', 'Gremio referente de la produccion ganadera y exposiciones rurales del Paraguay.', 'gremio', true, 'active', 'Institucional', 'https://ui-avatars.com/api/?name=ARP&background=A4D233&color=0A0A13&size=256'),
  ('senacsa', 'SENACSA', 'Servicio Nacional de Calidad y Salud Animal. Organismo oficial del Estado.', 'institucion', true, 'active', 'Institucional', 'https://ui-avatars.com/api/?name=SENACSA&background=3B82F6&color=fff&size=256'),
  ('mag', 'MAG', 'Ministerio de Agricultura y Ganaderia de la Republica del Paraguay.', 'institucion', true, 'active', 'Institucional', 'https://ui-avatars.com/api/?name=MAG&background=22C55E&color=fff&size=256'),
  ('senave', 'SENAVE', 'Servicio Nacional de Calidad y Sanidad Vegetal y de Semillas.', 'institucion', true, 'active', 'Institucional', 'https://ui-avatars.com/api/?name=SENAVE&background=8B5CF6&color=fff&size=256'),
  ('remates-paraguay', 'Remates Paraguay', 'Agenda y transmision de remates ganaderos en vivo desde todo el pais.', 'rematadora', true, 'trial', 'Remates', 'https://ui-avatars.com/api/?name=RP&background=EF4444&color=fff&size=256')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  is_verified = excluded.is_verified,
  commercial_status = excluded.commercial_status,
  plan_name = excluded.plan_name,
  logo_url = excluded.logo_url;

-- Aliados: 3 organizaciones ya existentes se marcan como Aliado (para probar el badge/plan en
-- publisher y en las noticias que ya publican), y 2 empresas NUEVAS sin ninguna publicacion, para
-- confirmar que el Directorio de Aliados las muestra igual (a diferencia del listado de
-- Organizaciones, que requiere posts).
update organizations set
  ally_plan = 'cosecha', ally_category = 'ganaderia', ally_founder = true,
  contact_phone = '+595981234567'
where slug = 'asociacion-brangus';

update organizations set
  ally_plan = 'semilla', ally_category = 'instituciones',
  contact_phone = '+595982345678'
where slug = 'arp';

update organizations set
  ally_plan = 'semilla', ally_category = 'servicios',
  contact_phone = '+595983456789'
where slug = 'remates-paraguay';

insert into organizations (slug, name, description, type, is_verified, commercial_status, plan_name, logo_url, ally_plan, ally_category, ally_founder, contact_phone)
values
  ('agroinsumos-py', 'AgroInsumos Paraguay', 'Distribuidora de insumos y maquinaria agricola con cobertura en todo el pais.', 'empresa', true, 'active', 'Aliado Cosecha', 'https://ui-avatars.com/api/?name=AI&background=A4D233&color=0A0A13&size=256', 'cosecha', 'insumos_maquinaria', true, '+595984567890'),
  ('tecnoagro-soluciones', 'TecnoAgro Soluciones', 'Software y sensores para agricultura de precision, adaptados al productor paraguayo.', 'empresa', true, 'active', 'Aliado Semilla', 'https://ui-avatars.com/api/?name=TA&background=8B5CF6&color=fff&size=256', 'semilla', 'tecnologia', false, '+595985678901')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  type = excluded.type,
  is_verified = excluded.is_verified,
  commercial_status = excluded.commercial_status,
  plan_name = excluded.plan_name,
  logo_url = excluded.logo_url,
  ally_plan = excluded.ally_plan,
  ally_category = excluded.ally_category,
  ally_founder = excluded.ally_founder,
  contact_phone = excluded.contact_phone;
