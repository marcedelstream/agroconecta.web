# Supabase: buckets, logos y banners

## 1. Ejecutar migracion

En Supabase, entra a SQL Editor y ejecuta:

```sql
-- Archivo local:
-- supabase/storage-and-banners.sql
```

Ese script crea o actualiza:

- Bucket publico `organization-logos`
- Bucket publico `banners`
- Tabla `ad_campaigns`
- Columna `posts.target_departments`
- Politicas publicas de lectura para logos, banners y anuncios activos

## 2. Subir logos 1:1 de organizaciones

1. Ir a Supabase Dashboard.
2. Abrir Storage.
3. Entrar al bucket `organization-logos`.
4. Subir el logo cuadrado de cada organizacion, idealmente `512 x 512 px`, PNG o JPG.
5. Copiar la URL publica.
6. Guardarla en `organizations.logo_url`.

Ejemplo SQL:

```sql
update organizations
set logo_url = 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/organization-logos/brangus.png'
where slug = 'brangus';
```

El admin ya muestra esa columna en `/organizations`.

## 3. Subir banners de prueba

Los banners locales generados estan en:

```text
assets/banners/ganaderia-creditos.png
assets/banners/semillas-zafra.png
assets/banners/sanidad-animal.png
assets/banners/precision-agro.png
assets/banners/mercados-granos.png
assets/banners/cooperativa-regional.png
```

Dimension usada: `640 x 200 px`. La app los muestra como zocalo `320 x 100 px`.

Subilos al bucket `banners` dentro de una carpeta `demo`, con estos nombres exactos:

```text
demo/ganaderia-creditos.png
demo/semillas-zafra.png
demo/sanidad-animal.png
demo/precision-agro.png
demo/mercados-granos.png
demo/cooperativa-regional.png
```

La app ya usa esas URLs publicas. Si todavia no estan subidos, cae automaticamente a los PNG locales.

## 4. Crear campañas segmentadas

Cada campaña puede apuntar a:

- `target_professions`: productor, veterinario, agronomo, comerciante, etc.
- `target_departments`: central, itapua, boqueron, etc.
- `target_categories`: ganaderia, agricultura, clima, mercados, tecnologia, institucional.

Si un array queda vacio, significa "todos".

Ejemplo:

```sql
insert into ad_campaigns (
  title,
  image_url,
  target_professions,
  target_departments,
  target_categories
) values (
  'Remate Brangus destacado',
  'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/remates/brangus-mayo.png',
  array['productor'],
  array['central','presidente-hayes','boqueron'],
  array['ganaderia']
);
```

## 5. Segmentar publicaciones por departamento

La columna nueva es `posts.target_departments`.

Ejemplo para publicar solo en Central e Itapua:

```sql
update posts
set target_departments = array['central','itapua']
where id = 'POST_ID';
```

Para noticia nacional:

```sql
update posts
set target_departments = array[]::text[]
where id = 'POST_ID';
```

La app filtra automaticamente por el departamento del perfil del usuario.
