import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

interface Summary {
  active_users: number
  poll_votes: number
  quiz_answers: number
  points_issued: number
  points_redeemed: number
  karai_messages: number
}
interface Sessions { sessions: number; avg_items_per_session: number; pct_sessions_with_interaction: number }
interface Cta { source: string; impressions: number; cta_opens: number; ctr_pct: number }
interface Retention { cohort_week: string; users: number; d1_pct: number; d7_pct: number; d30_pct: number }

const fmt = (n: number | null | undefined) => Number(n ?? 0).toLocaleString('es-PY', { maximumFractionDigits: 1 })
const SOURCE_LABEL: Record<string, string> = { post: 'Publicaciones', event: 'Eventos', listing: 'Ecosistema' }

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display font-bold text-2xl text-white mt-1">{value}</p>
    </div>
  )
}

// Métricas de éxito de la app v2 (BACKEND §9). Vistas SQL de supabase/fix-v2-metrics.sql.
export default async function MetricasPage() {
  const db = createSupabaseAdmin()
  const [summary, sessions, cta, retention, karaiUsers] = await Promise.all([
    db.from('v2_metric_summary').select('*').maybeSingle(),
    db.from('v2_metric_sessions').select('*').maybeSingle(),
    db.from('v2_metric_cta').select('*'),
    db.from('v2_metric_retention').select('*').limit(8),
    db.from('usage_ledger').select('profile_id').gte('created_at', new Date(Date.now() - 30 * 86_400_000).toISOString()).limit(20000),
  ])
  const s = summary.data as Summary | null
  const se = sessions.data as Sessions | null
  const karaiActive = new Set(((karaiUsers.data ?? []) as { profile_id: string }[]).map((r) => r.profile_id)).size
  const error = summary.error ?? sessions.error

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Métricas de la app v2</h1>
        <p className="text-muted text-sm mt-0.5">Últimos 30 días.</p>
      </div>
      {error && <div className="card border-danger/40 text-danger text-sm">No se pudo leer (¿se corrió fix-v2-metrics.sql?): {error.message}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Usuarios activos" value={fmt(s?.active_users)} />
        <Stat label="Items vistos por sesión" value={fmt(se?.avg_items_per_session)} />
        <Stat label="Sesiones con interacción" value={`${fmt(se?.pct_sessions_with_interaction)}%`} />
        <Stat label="Sesiones" value={fmt(se?.sessions)} />
        <Stat label="Votos en encuestas" value={fmt(s?.poll_votes)} />
        <Stat label="Respuestas de quiz" value={fmt(s?.quiz_answers)} />
        <Stat label="Puntos emitidos / canjeados" value={`${fmt(s?.points_issued)} / ${fmt(s?.points_redeemed)}`} />
        <Stat label="Mensajes a Karai por usuario activo" value={fmt(karaiActive ? (s?.karai_messages ?? 0) / karaiActive : 0)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-0 overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>CTR del botón de acción</th><th>Impresiones</th><th>Aperturas</th><th>CTR</th></tr></thead>
            <tbody>
              {((cta.data ?? []) as Cta[]).map((c) => (
                <tr key={c.source}><td>{SOURCE_LABEL[c.source] ?? c.source}</td><td>{fmt(c.impressions)}</td><td>{fmt(c.cta_opens)}</td><td>{fmt(c.ctr_pct)}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-0 overflow-hidden">
          <table className="admin-table">
            <thead><tr><th>Cohorte (semana)</th><th>Usuarios</th><th>D1</th><th>D7</th><th>D30</th></tr></thead>
            <tbody>
              {((retention.data ?? []) as Retention[]).map((r) => (
                <tr key={r.cohort_week}><td>{r.cohort_week}</td><td>{fmt(r.users)}</td><td>{fmt(r.d1_pct)}%</td><td>{fmt(r.d7_pct)}%</td><td>{fmt(r.d30_pct)}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted">El CTR de publicidad por campaña está en <a href="/admin/publicidad" className="text-lime">Reporte de publicidad</a>.</p>
    </div>
  )
}
