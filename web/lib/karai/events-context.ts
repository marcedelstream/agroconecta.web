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

  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await client
    .from('events')
    .select('title,category,date,end_date,time,location,city,department')
    .eq('is_approved', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(15)

  if (error || !data?.length) return ''

  const block = (data as EventRow[])
    .map((e) => {
      const place = [e.location, e.city, e.department].filter(Boolean).join(', ')
      const when = e.time ? `${e.date} ${e.time}` : e.date
      return `- ${e.title}${e.category ? ` [${e.category}]` : ''} — ${when}${place ? ` — ${place}` : ''}`
    })
    .join('\n')

  return `\n\nPróximos eventos del agro (eventosagropy.com, ecosistema de Agroconecta):\n${block}`
}
