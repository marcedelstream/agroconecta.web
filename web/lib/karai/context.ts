import type { createSupabaseAdmin } from '@/lib/supabase-admin'
import type { ExtractedFarmData } from './farm-extraction'
import { loadEventsContext } from './events-context'
import { SOURCE_LEVEL_LABELS, isSourceUsable, type KaraiSourceLevel } from './knowledge-types'
import { postUrl } from '@/lib/seo'

const MAX_KNOWLEDGE_CONTENT_CHARS = 2000

// Sin esto el modelo no tiene forma de saber qué es "hoy" — no puede decidir qué evento es
// "próximo" ni interpretar "esta semana" sin la fecha/hora actual de Paraguay.
function nowContext(): string {
  const now = new Date()
  const formatted = now.toLocaleString('es-PY', {
    timeZone: 'America/Asuncion',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `Hoy es ${formatted} (hora de Paraguay).`
}

// KARAI-PLAN-ENTRENAMIENTO-Y-FUENTES.md secc. 5 "Precios": cada valor va con su fecha de
// actualización explícita, para que el modelo diga "último precio cargado" en vez de "hoy" cuando
// el dato no es del día. Función pura (exportada) para poder testear esta regla sin mockear Supabase.
export function formatPriceLine(p: { label: string; market: string; currency: string; unit: string; value: number; updated_at: string }): string {
  const updated = new Date(p.updated_at).toLocaleDateString('es-PY', { day: 'numeric', month: 'short' })
  return `- ${p.label} (${p.market}): ${p.value} ${p.currency}/${p.unit} — actualizado el ${updated}`
}

// Contexto minimo de Agroconecta para que el modelo responda con datos reales en vez de inventar
// (KARAI-DIAGNOSTICO-SPRINT-1.md secc. 5: "no hace falta RAG con embeddings el dia 1 — se puede
// consultar directo"). Nada de esto es privado del usuario, son las mismas noticias/precios
// publicos que ya sirve la app.
async function loadPublicContext(admin: ReturnType<typeof createSupabaseAdmin>): Promise<string> {
  const [postsRes, pricesRes] = await Promise.all([
    admin
      .from('posts')
      .select('title,summary,category,published_at,slug')
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

  // Cada noticia lleva su link real (mismo helper que usa el resto del sitio, lib/seo.ts) — así el
  // modelo puede compartir el link directo de ESA noticia en vez de mandar siempre al genérico
  // /descargar (KARAI-PLAN-ENTRENAMIENTO-Y-FUENTES.md: "contexto con ID/link por item").
  const postsBlock = posts.length
    ? posts.map((p) => `- [${p.category}] ${p.title}: ${p.summary} — ${postUrl({ slug: p.slug })}`).join('\n')
    : '(sin noticias publicadas por el momento)'

  const pricesBlock = prices.length ? prices.map(formatPriceLine).join('\n') : '(sin precios cargados por el momento)'

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
//
// KARAI-PLAN-ENTRENAMIENTO-Y-FUENTES.md secc. 4.2: "impedir que una fuente vencida se use para una
// respuesta vigente" — por eso el filtro es status='aprobado' Y (sin vencimiento O vigente), nunca
// solo un on/off. Cada línea lleva su nivel de autoridad y vigencia para que el modelo pueda
// citarlos con precisión, no solo el título.
async function loadKnowledgeContext(admin: ReturnType<typeof createSupabaseAdmin>): Promise<string> {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await admin
    .from('karai_knowledge_sources')
    .select('kind,title,url,content,publisher,source_level,expires_at,status')
    .eq('status', 'aprobado')
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order('created_at', { ascending: false })
    .limit(10)

  // Segunda capa de defensa además del filtro en la query: isSourceUsable() es la misma regla
  // ("aprobada Y no vencida") pero como función pura testeada, por si la query cambia alguna vez y
  // deja de filtrar bien.
  const sources = (data ?? []).filter((s) => isSourceUsable({ status: s.status, expiresAt: s.expires_at }, today))
  if (!sources.length) return ''

  const block = sources
    .map((s) => {
      const body = (s.content ?? '').slice(0, MAX_KNOWLEDGE_CONTENT_CHARS)
      const level = s.source_level ? SOURCE_LEVEL_LABELS[s.source_level as KaraiSourceLevel] : null
      const meta = [s.publisher, level, s.expires_at ? `vigente hasta ${s.expires_at}` : null].filter(Boolean).join(' · ')
      const origin = s.kind === 'link' ? (s.url ?? 'sin URL') : 'documento cargado por el equipo'
      return `- ${s.title} (${origin}${meta ? ` · ${meta}` : ''}): ${body}`
    })
    .join('\n')

  return `\n\nFuentes de referencia adicionales cargadas y aprobadas por el equipo de Agroconecta (usar solo si son relevantes a la pregunta, y aclarar que es una fuente externa, no un dato de la plataforma):\n${block}`
}

// Lo que Karai ya sabe de la finca de ESTE usuario puntual (farm_profile) — nunca de otro. Se
// arma en orchestrator.ts con el profileId de la sesión autenticada, nunca con un id que venga del
// cliente.
async function loadOwnFarmContext(admin: ReturnType<typeof createSupabaseAdmin>, profileId: string): Promise<string> {
  const { data } = await admin.from('farm_profile').select('data').eq('profile_id', profileId).maybeSingle()
  const farm = (data?.data ?? {}) as ExtractedFarmData
  if (!farm || Object.keys(farm).length === 0) return ''

  const lines: string[] = []
  if (farm.nombre) lines.push(`- Finca: ${farm.nombre}`)
  if (farm.depto || farm.distrito) lines.push(`- Ubicación: ${[farm.distrito, farm.depto].filter(Boolean).join(', ')}`)
  if (typeof farm.hectareas === 'number') lines.push(`- Hectáreas totales: ${farm.hectareas}`)
  for (const a of farm.animales ?? []) {
    lines.push(`- Animales: ${a.cantidad} ${a.tipo}${a.raza ? ` (${a.raza})` : ''}${a.potrero ? `, potrero ${a.potrero}` : ''}`)
  }
  for (const c of farm.cultivos ?? []) {
    lines.push(`- Cultivo: ${c.tipo}, ${c.hectareas} ha${c.variedad ? ` (${c.variedad})` : ''}${c.estado ? `, estado: ${c.estado}` : ''}`)
  }
  if (farm.notas) lines.push(`- Notas: ${farm.notas}`)
  if (!lines.length) return ''

  return `\n\nDatos de finca que este usuario ya registró con vos (información privada suya, no la compartas con otros usuarios):\n${lines.join('\n')}`
}

export async function buildContext(admin: ReturnType<typeof createSupabaseAdmin>, profileId: string): Promise<string> {
  const [publicContext, eventsContext, knowledgeContext, ownFarmContext] = await Promise.all([
    loadPublicContext(admin),
    loadEventsContext(),
    loadKnowledgeContext(admin),
    loadOwnFarmContext(admin, profileId),
  ])

  return `${nowContext()}\n\n${publicContext}${eventsContext}${knowledgeContext}${ownFarmContext}`
}
