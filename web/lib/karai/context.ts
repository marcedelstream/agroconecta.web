import type { createSupabaseAdmin } from '@/lib/supabase-admin'
import type { ExtractedFarmData } from './farm-extraction'

const MAX_KNOWLEDGE_CONTENT_CHARS = 800

// Contexto minimo de Agroconecta para que el modelo responda con datos reales en vez de inventar
// (KARAI-DIAGNOSTICO-SPRINT-1.md secc. 5: "no hace falta RAG con embeddings el dia 1 — se puede
// consultar directo"). Nada de esto es privado del usuario, son las mismas noticias/precios
// publicos que ya sirve la app.
async function loadPublicContext(admin: ReturnType<typeof createSupabaseAdmin>): Promise<string> {
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

// Fuentes cargadas a mano por el equipo (web/app/admin/(dashboard)/karai/fuentes) para cuando
// Agroconecta no tiene el dato — placeholder simple sin RAG/embeddings todavia, se trunca por
// longitud para no disparar el costo de tokens.
async function loadKnowledgeContext(admin: ReturnType<typeof createSupabaseAdmin>): Promise<string> {
  const { data } = await admin
    .from('karai_knowledge_sources')
    .select('kind,title,url,content')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  const sources = data ?? []
  if (!sources.length) return ''

  const block = sources
    .map((s) => {
      const body = (s.content ?? '').slice(0, MAX_KNOWLEDGE_CONTENT_CHARS)
      return s.kind === 'link'
        ? `- ${s.title} (${s.url ?? 'sin URL'}): ${body}`
        : `- ${s.title} (documento cargado por el equipo): ${body}`
    })
    .join('\n')

  return `\n\nFuentes de referencia adicionales cargadas por el equipo de Agroconecta (usar solo si son relevantes a la pregunta, y aclarar que es una fuente externa, no un dato de la plataforma):\n${block}`
}

// Lo que Karai ya sabe de la finca de ESTE usuario puntual (farm_profile) — nunca de otro. Se
// arma en orchestrator.ts con el profileId de la sesión autenticada, nunca con un id que venga del
// cliente.
async function loadOwnFarmContext(admin: ReturnType<typeof createSupabaseAdmin>, profileId: string): Promise<string> {
  const { data } = await admin.from('farm_profile').select('data').eq('profile_id', profileId).maybeSingle()
  const farm = (data?.data ?? {}) as ExtractedFarmData
  if (!farm || Object.keys(farm).length === 0) return ''

  const lines: string[] = []
  if (farm.ubicacion) lines.push(`- Ubicación: ${farm.ubicacion}`)
  if (typeof farm.hectareas === 'number') lines.push(`- Hectáreas: ${farm.hectareas}`)
  for (const a of farm.animales ?? []) lines.push(`- Animales: ${a.cantidad} ${a.tipo}`)
  for (const c of farm.cultivos ?? []) lines.push(`- Cultivo: ${c.tipo}, ${c.superficie_ha} ha`)
  if (!lines.length) return ''

  return `\n\nDatos de finca que este usuario ya registró con vos (información privada suya, no la compartas con otros usuarios):\n${lines.join('\n')}`
}

export async function buildContext(admin: ReturnType<typeof createSupabaseAdmin>, profileId: string): Promise<string> {
  const [publicContext, knowledgeContext, ownFarmContext] = await Promise.all([
    loadPublicContext(admin),
    loadKnowledgeContext(admin),
    loadOwnFarmContext(admin, profileId),
  ])

  return `${publicContext}${knowledgeContext}${ownFarmContext}`
}
