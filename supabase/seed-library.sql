-- Biblioteca digital de prueba. El "file_url" apunta a un PDF publico de muestra (no es contenido
-- real, es solo para poder abrir el lector y confirmar que funciona) — la app ya sabe abrir una URL
-- externa directo, sin pasar por el bucket privado (ver fetchLibraryFileSignedUrl). Para contenido
-- real, subí los PDF desde /admin/biblioteca y van a servirse con URL firmada del bucket privado.
-- Requiere haber corrido supabase/fix-library.sql antes. Se puede correr mas de una vez sin
-- duplicar (guard por title).

insert into library_items (title, author, description, category, cover_image_url, file_url, file_type, page_count, is_published)
select 'Manual de Manejo de Pasturas', 'INTA Paraguay',
  'Guia practica para el manejo eficiente de pasturas en sistemas ganaderos paraguayos.',
  'manual', 'https://picsum.photos/seed/lib-pasturas/400/600',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 48, true
where not exists (select 1 from library_items where title = 'Manual de Manejo de Pasturas');

insert into library_items (title, author, description, category, cover_image_url, file_url, file_type, page_count, is_published)
select 'Revista Agro Paraguay - Edicion 2026', 'Agroconecta',
  'Edicion especial con analisis de zafra, entrevistas y tendencias del sector.',
  'revista', 'https://picsum.photos/seed/lib-revista/400/600',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 32, true
where not exists (select 1 from library_items where title = 'Revista Agro Paraguay - Edicion 2026');

insert into library_items (title, author, description, category, cover_image_url, file_url, file_type, page_count, is_published)
select 'Guia Tecnica de Sanidad Animal', 'SENACSA',
  'Protocolos y recomendaciones tecnicas para la sanidad del rodeo.',
  'tecnico', 'https://picsum.photos/seed/lib-sanidad/400/600',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 64, true
where not exists (select 1 from library_items where title = 'Guia Tecnica de Sanidad Animal');

insert into library_items (title, author, description, category, cover_image_url, file_url, file_type, page_count, is_published)
select 'Historia del Agro Paraguayo', 'Marcelo Escobar',
  'Un recorrido por la evolucion del sector agropecuario paraguayo en el ultimo siglo.',
  'historia', 'https://picsum.photos/seed/lib-historia/400/600',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 120, true
where not exists (select 1 from library_items where title = 'Historia del Agro Paraguayo');

insert into library_items (title, author, description, category, cover_image_url, file_url, file_type, page_count, is_published)
select 'Legislacion Agraria Vigente', 'MAG',
  'Compilado de normativa vigente relevante para productores del sector.',
  'legislacion', 'https://picsum.photos/seed/lib-legislacion/400/600',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'pdf', 96, true
where not exists (select 1 from library_items where title = 'Legislacion Agraria Vigente');
