import type { createSupabaseAdmin } from '@/lib/supabase-admin'

// Contexto minimo de Agroconecta para que el modelo responda con datos reales en vez de inventar
// (KARAI-DIAGNOSTICO-SPRINT-1.md secc. 5: "no hace falta RAG con embeddings el dia 1 — se puede
// consultar directo"). Nada de esto es privado del usuario, son las mismas noticias/precios
// publicos que ya sirve la app.
export async function loadPublicContext(admin: ReturnType<typeof createSupabaseAdmin>): Promise<string> {
  const [postsRes, pricesRes] = await Promise.all([
    admin
      .from('posts')
      .select('title,summary,category,published_at')
      .eq('editorial_status', 'published')
      .order('published_at', { ascending: false })
      .limit(5),
    admin
      .from('market_prices')
      .select('label,market,currency,unit,value,updated_at')
      .order('updated_at', { ascending: false })
      .limit(8),
  ])

  const posts = postsRes.data ?? []
  const prices = pricesRes.data ?? []

  const postsBlock = posts.length
    ? posts.map((p) => `- [${p.category}] ${p.title}: ${p.summary}`).join('\n')
    : '(sin noticias publicadas por el momento)'

  const pricesBlock = prices.length
    ? prices.map((p) => `- ${p.label} (${p.market}): ${p.value} ${p.currency}/${p.unit}`).join('\n')
    : '(sin precios cargados por el momento)'

  return [
    'Últimas noticias publicadas en Agroconecta:',
    postsBlock,
    '',
    'Precios de mercado más recientes en Agroconecta:',
    pricesBlock,
  ].join('\n')
}
