import Link from 'next/link'
import { ArrowRight, CheckCircle2, Plus } from 'lucide-react'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { PageHeader, SectionTitle } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'

interface Task {
  count: number
  title: string
  text: string
  href: string
  cta: string
}

interface Summary {
  active_users: number | null
  poll_votes: number | null
  quiz_answers: number | null
  karai_messages: number | null
}

// Cada conteo es best-effort: si una tabla no existe (migración sin correr) cuenta 0 y la tarea no aparece.
async function count(query: PromiseLike<{ count: number | null }>): Promise<number> {
  try {
    return (await query).count ?? 0
  } catch {
    return 0
  }
}

async function loadHome() {
  const db = createSupabaseAdmin()
  const now = new Date()
  const inAWeek = new Date(now.getTime() + 7 * 86_400_000).toISOString()
  const head = { count: 'exact' as const, head: true }

  const [pending, leads, karaiLeads, codes, ending, live, polls, quizzes, summary] = await Promise.all([
    count(db.from('posts').select('id', head).eq('editorial_status', 'pending_review')),
    count(db.from('service_leads').select('id', head).eq('status', 'pendiente')),
    count(db.from('karai_leads').select('id', head).eq('status', 'new')),
    count(db.from('reward_redemptions').select('id', head).eq('status', 'emitido')),
    count(db.from('ad_campaigns').select('id', head).eq('is_active', true).gte('ends_at', now.toISOString()).lte('ends_at', inAWeek)),
    count(db.from('live_sessions').select('id', head).eq('is_live', true)),
    count(db.from('polls').select('id', head).eq('is_active', true)),
    count(db.from('quizzes').select('id', head).eq('is_active', true)),
    db.from('v2_metric_summary').select('active_users,poll_votes,quiz_answers,karai_messages').maybeSingle(),
  ])

  const tasks: Task[] = [
    { count: pending, title: 'Publicaciones para revisar', text: 'Notas que mandaron las organizaciones y esperan tu aprobación.', href: '/admin/publicaciones?status=pending_review', cta: 'Revisar' },
    { count: leads, title: 'Consultas sin responder', text: 'Personas que pidieron que las contactemos.', href: '/admin/consultas', cta: 'Ver consultas' },
    { count: karaiLeads, title: 'Oportunidades de Karai', text: 'Conversaciones de Karai donde alguien mostró interés comercial.', href: '/admin/karai', cta: 'Ver leads' },
    { count: live, title: 'Transmisiones prendidas', text: 'Se están mostrando ahora arriba del feed. Acordate de apagarlas al terminar.', href: '/admin/en-vivo', cta: 'Ver en vivo' },
    { count: ending, title: 'Publicidad que vence esta semana', text: 'Avisale al anunciante si quiere renovar.', href: '/admin/banners', cta: 'Ver campañas' },
    { count: codes, title: 'Códigos de canje sin usar', text: 'Premios canjeados que el aliado todavía no validó.', href: '/admin/premios', cta: 'Ver códigos' },
  ].filter((t) => t.count > 0)

  // Sin encuesta ni quiz activos, el feed no tiene contenido para sumar puntos.
  if (polls + quizzes === 0) {
    tasks.push({ count: 0, title: 'No hay encuestas ni quiz activos', text: 'Cargá uno: es lo que hace que la gente sume puntos.', href: '/admin/encuestas', cta: 'Crear encuesta' })
  }

  return { tasks, summary: summary.data as Summary | null }
}

const fmt = (n: number | null | undefined) => Number(n ?? 0).toLocaleString('es-PY')

export default async function AdminHome() {
  const { tasks, summary } = await loadHome()

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Hoy"
        help="Acá ves lo que hay para hacer. Cada tarjeta te lleva directo a la pantalla donde se resuelve."
        actions={
          <Link href="/admin/publicaciones/nueva" className="btn-primary text-sm gap-2">
            <Plus size={16} aria-hidden /> Nueva publicación
          </Link>
        }
      />

      <SectionTitle>Para hacer</SectionTitle>
      {tasks.length === 0 ? (
        <div className="card flex items-center gap-3 mb-8">
          <CheckCircle2 className="text-success shrink-0" aria-hidden />
          <p className="text-foreground">Todo al día. No hay nada pendiente por ahora.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {tasks.map((t) => (
            <Link key={t.title} href={t.href} className="card flex flex-col gap-2 hover:border-lime transition-colors">
              <div className="flex items-center gap-3">
                {t.count > 0 && (
                  <span className="min-w-9 h-9 px-2 rounded-full bg-lime/25 text-foreground font-bold flex items-center justify-center">{t.count}</span>
                )}
                <p className="font-display font-semibold text-foreground">{t.title}</p>
              </div>
              <p className="text-sm text-muted">{t.text}</p>
              <span className="text-sm font-semibold text-lime inline-flex items-center gap-1 mt-1">
                {t.cta} <ArrowRight size={14} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      )}

      <SectionTitle help="Últimos 30 días. El detalle está en Métricas.">Cómo viene la app</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios activos', value: summary?.active_users },
          { label: 'Votos en encuestas', value: summary?.poll_votes },
          { label: 'Respuestas de quiz', value: summary?.quiz_answers },
          { label: 'Mensajes a Karai', value: summary?.karai_messages },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="font-display font-bold text-3xl text-foreground mt-1">{fmt(s.value)}</p>
          </div>
        ))}
      </div>
      <Link href="/admin/metricas" className="text-sm font-semibold text-lime inline-flex items-center gap-1 mt-4">
        Ver todas las métricas <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  )
}
