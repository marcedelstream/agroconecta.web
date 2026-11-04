import { createClient } from '@supabase/supabase-js'

// Proyecto externo de eventosagropy.com (mismo que usa mobile/lib/supabase-events.ts) — es otro
// ecosistema de Agroconecta, no vive en el Supabase principal. Anon key, protegida por RLS del
// lado de ese proyecto — segura de tener server-side.
function getEventsClient() {
  const url = process.env.EVENTOS_SUPABASE_URL
  const key = process.env.EVENTOS_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

interface EventRow {
  title: string
  category: string | null
  date: string
  end_date: string | null
  time: string | null
  location: string | null
  city: string | null
  department: string | null
}

export async function loadEventsContext(): Promise<string> {
  const client = getEventsClient()
  if (!client) return ''

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' })
  // También los de las últimas dos semanas, marcados como terminados: "¿cómo estuvo la Expo?" necesita saber que ya pasó.
  const since = new Date(Date.now() - 14 * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' })
  const { data, error } = await client
    .from('events')
    .select('title,category,date,end_date,time,location,city,department')
    .eq('is_approved', true)
    .gte('date', since)
    .order('date', { ascending: true })
    .limit(25)

  if (error || !data?.length) return ''

  const block = (data as EventRow[])
    .map((e) => {
      const place = [e.location, e.city, e.department].filter(Boolean).join(', ')
      const when = e.time ? `${e.date} ${e.time}` : e.date
      const until = e.end_date && e.end_date !== e.date ? ` al ${e.end_date}` : ''
      return `- ${e.title}${e.category ? ` [${e.category}]` : ''} — ${when}${until} (${eventStatus(e, today)})${place ? ` — ${place}` : ''}`
    })
    .join('\n')

  return `\n\nEventos del agro (eventosagropy.com, ecosistema de Agroconecta; fechas AAAA-MM-DD y su estado respecto de hoy):\n${block}`
}

/** "terminó", "en curso" o "próximo" respecto de hoy (fechas AAAA-MM-DD en hora de Paraguay). */
export function eventStatus(e: { date: string; end_date: string | null }, today: string): string {
  const end = e.end_date ?? e.date
  if (end < today) return 'terminó'
  if (e.date <= today) return 'en curso'
  return 'próximo'
}
