import type { SupabaseClient } from '@supabase/supabase-js'
import { loadInterestOptions } from './interest-options'

// Etiquetas de cada contenido (tabla content_tags, supabase/fix-v2-content-tags.sql). Las etiquetas son las
// opciones 'produccion' de /admin/intereses; cada una pertenece a una categoría ('rubro').

export type ContentSource = 'post' | 'listing' | 'library' | 'event' | 'org'

/** Mismo formato que la clave del feed: "post:<uuid>", "event:<slug>"… */
export const contentKey = (source: ContentSource, id: string) => `${source}:${id}`

export interface TagGroup {
  category: string
  label: string
  tags: { value: string; label: string }[]
}

/** Categorías activas con sus etiquetas activas, en el orden del panel. Para los selectores del panel. */
export async function loadTagGroups(db: SupabaseClient): Promise<TagGroup[]> {
  const options = await loadInterestOptions(db, true)
  return options
    .filter((o) => o.kind === 'rubro')
    .map((c) => ({
      category: c.value,
      label: c.label,
      tags: options.filter((o) => o.kind === 'produccion' && o.parent === c.value).map((o) => ({ value: o.value, label: o.label })),
    }))
    .filter((g) => g.tags.length > 0)
}

export async function loadContentTags(db: SupabaseClient, key: string): Promise<string[]> {
  const { data } = await db.from('content_tags').select('tag').eq('content_key', key)
  return ((data ?? []) as { tag: string }[]).map((r) => r.tag)
}

/** Reemplaza las etiquetas de un contenido. Sin la tabla migrada no hace nada (no frena el guardado). */
export async function saveContentTags(db: SupabaseClient, key: string, tags: string[]): Promise<void> {
  const unique = [...new Set(tags.map((t) => t.trim()).filter(Boolean))]
  const { error } = await db.from('content_tags').delete().eq('content_key', key)
  if (error) {
    console.error('content_tags: no se pudo limpiar', key, error.message)
    return
  }
  if (unique.length === 0) return
  const { error: insertError } = await db.from('content_tags').insert(unique.map((tag) => ({ content_key: key, tag })))
  if (insertError) console.error('content_tags: no se pudo guardar', key, insertError.message)
}

export const tagsFromForm = (formData: FormData) => formData.getAll('tags').map(String)

/**
 * Suma a cada contenido sus etiquetas y la categoría de cada una: algo etiquetado "sésamo" también tiene que
 * aparecer al filtrar por Agricultura y recomendarse a quien eligió Agricultura.
 */
export function mergeTags<T extends { key: string; tags: string[] }>(
  items: T[],
  rows: { content_key: string; tag: string }[],
  categoryOf: Map<string, string>,
): T[] {
  const byKey = new Map<string, string[]>()
  for (const r of rows) {
    const extra = [r.tag, categoryOf.get(r.tag)].filter((t): t is string => !!t)
    byKey.set(r.content_key, [...(byKey.get(r.content_key) ?? []), ...extra])
  }
  return items.map((item) => {
    const extra = byKey.get(item.key)
    return extra ? { ...item, tags: [...new Set([...item.tags, ...extra])] } : item
  })
}

const IN_CHUNK = 200

/** Best-effort: si la tabla no existe o falla, los contenidos quedan con las etiquetas que ya traían. */
export async function attachContentTags<T extends { key: string; tags: string[] }>(db: SupabaseClient, items: T[]): Promise<T[]> {
  if (items.length === 0) return items
  const keys = items.map((i) => i.key)
  const chunks: string[][] = []
  for (let i = 0; i < keys.length; i += IN_CHUNK) chunks.push(keys.slice(i, i + IN_CHUNK))

  const [results, options] = await Promise.all([
    Promise.all(chunks.map((chunk) => db.from('content_tags').select('content_key,tag').in('content_key', chunk))),
    loadInterestOptions(db),
  ])
  if (results.some((r) => r.error)) return items

  const rows = results.flatMap((r) => (r.data ?? []) as { content_key: string; tag: string }[])
  const categoryOf = new Map(options.filter((o) => o.kind === 'produccion' && o.parent).map((o) => [o.value, o.parent as string]))
  return mergeTags(items, rows, categoryOf)
}
