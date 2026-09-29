import type { SupabaseClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/seo'

/** Slug libre para un post nuevo. Colisión: sufijo numérico, en vez de pegar el uuid a la URL. */
export async function uniquePostSlug(supabase: SupabaseClient, title: string): Promise<string> {
  const base = slugify(title) || 'noticia'
  let candidate = base
  let n = 1
  while (true) {
    const { data } = await supabase.from('posts').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}
