import { createSupabaseAdmin } from '@/lib/supabase-admin'

interface ReportRow {
  campaign_id: string
  title: string
  advertiser_name: string | null
  impressions: number
  clicks: number
  reach: number
  ctr_percent: number
}

interface DepartmentRow {
  campaign_id: string
  department: string | null
}

export const dynamic = 'force-dynamic'

const fmt = (n: number) => Number(n).toLocaleString('es-PY')

// Reporte por campaña para el anunciante (BACKEND §6): impresiones, clics, CTR y alcance, más el
// alcance por departamento. Sale de ad_events, que registra la app v2 (feed y dentro de la noticia).
export default async function PublicidadPage() {
  const admin = createSupabaseAdmin()
  const [report, depts] = await Promise.all([
    admin.from('ad_campaign_report').select('*').order('impressions', { ascending: false }),
    admin.from('ad_events').select('campaign_id,department').eq('event_type', 'impression').limit(20000),
  ])
  const rows = (report.data ?? []) as ReportRow[]

  const byDept = new Map<string, Map<string, number>>()
  for (const r of (depts.data ?? []) as DepartmentRow[]) {
    const m = byDept.get(r.campaign_id) ?? new Map<string, number>()
    const key = r.department ?? 'sin dato'
    m.set(key, (m.get(key) ?? 0) + 1)
    byDept.set(r.campaign_id, m)
  }

  return (
    <div className="max-w-6xl">
      <h1 className="font-display font-bold text-2xl text-white">Reporte de publicidad</h1>
      <p className="text-muted text-sm mt-0.5 mb-6">Resultados de las campañas en la app v2 (feed y dentro de la noticia).</p>

      {report.error && <div className="card mb-6 border-danger/40 text-danger text-sm">No se pudo leer el reporte (¿se corrió fix-v2-live-ads.sql?): {report.error.message}</div>}

      <div className="card p-0 overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr><th>Campaña</th><th>Impresiones</th><th>Alcance</th><th>Clics</th><th>CTR</th><th>Top departamentos</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const top = [...(byDept.get(r.campaign_id)?.entries() ?? [])].sort((a, b) => b[1] - a[1]).slice(0, 3)
              return (
                <tr key={r.campaign_id}>
                  <td>
                    <p className="text-white font-medium">{r.title}</p>
                    {r.advertiser_name && <p className="text-xs text-muted">{r.advertiser_name}</p>}
                  </td>
                  <td>{fmt(r.impressions)}</td>
                  <td>{fmt(r.reach)}</td>
                  <td>{fmt(r.clicks)}</td>
                  <td>{Number(r.ctr_percent).toLocaleString('es-PY', { maximumFractionDigits: 2 })}%</td>
                  <td className="text-xs text-muted">{top.map(([d, n]) => `${d} (${fmt(n)})`).join(' · ') || '—'}</td>
                </tr>
              )
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="text-center text-muted text-sm py-8">Todavía no hay datos.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
