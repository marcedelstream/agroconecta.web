import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { startOfTodayAsuncionUtc } from '@/lib/karai/quota'

// Importante: esta pantalla NO expone conversaciones privadas de los usuarios (decisión de
// producto, 2026-09-01) — solo agregados de uso y "leads" (el mensaje puntual que el clasificador
// marcó como intención comercial, no el resto de la conversación). Ver lib/karai/orchestrator.ts,
// recordLeadIfCommercial.

interface LeadRow {
  id: string
  profile_id: string
  excerpt: string
  status: 'new' | 'contacted' | 'closed'
  created_at: string
}

interface ProfileLite {
  id: string
  name: string | null
  email: string | null
  phone: string | null
}

async function loadKaraiData() {
  const admin = createSupabaseAdmin()
  const todayStart = startOfTodayAsuncionUtc()

  const [leadsRes, conversationCountRes, usageTodayRes, usageWeekRes] = await Promise.all([
    admin.from('karai_leads').select('id,profile_id,excerpt,status,created_at').order('created_at', { ascending: false }).limit(50),
    admin.from('conversations').select('id', { count: 'exact', head: true }),
    admin.from('usage_ledger').select('profile_id,tokens_used').gte('created_at', todayStart),
    admin
      .from('usage_ledger')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 3_600_000).toISOString()),
  ])

  const leads = (leadsRes.data ?? []) as LeadRow[]
  const usageToday = usageTodayRes.data ?? []
  const activeUsersToday = new Set(usageToday.map((row) => row.profile_id)).size
  const tokensToday = usageToday.reduce((sum, row) => sum + (row.tokens_used ?? 0), 0)

  const profileIds = Array.from(new Set(leads.map((l) => l.profile_id)))
  const { data: profilesData } = profileIds.length
    ? await admin.from('profiles').select('id,name,email,phone').in('id', profileIds)
    : { data: [] as ProfileLite[] }
  const profilesById = new Map((profilesData ?? []).map((p) => [p.id, p as ProfileLite]))

  return {
    leads,
    conversationCount: conversationCountRes.count ?? 0,
    usageQueriesToday: usageToday.length,
    activeUsersToday,
    tokensToday,
    usageLast7Days: usageWeekRes.count ?? 0,
    profilesById,
  }
}

const STATUS_LABELS: Record<string, string> = { new: 'Nuevo', contacted: 'Contactado', closed: 'Cerrado' }
const STATUS_STYLE: Record<string, string> = {
  new: 'bg-lime/15 text-lime',
  contacted: 'bg-info/15 text-info',
  closed: 'bg-muted/15 text-muted',
}

export default async function KaraiAdminPage() {
  const { leads, conversationCount, usageQueriesToday, activeUsersToday, tokensToday, usageLast7Days, profilesById } =
    await loadKaraiData()

  const stats = [
    { label: 'Consultas hoy', value: usageQueriesToday, color: 'text-lime' },
    { label: 'Usuarios activos hoy', value: activeUsersToday, color: 'text-info' },
    { label: 'Consultas últimos 7 días', value: usageLast7Days, color: 'text-warning' },
    { label: 'Tokens usados hoy', value: tokensToday.toLocaleString('es-PY'), color: 'text-success' },
    { label: 'Conversaciones totales', value: conversationCount, color: 'text-muted' },
    { label: 'Leads nuevos', value: leads.filter((l) => l.status === 'new').length, color: 'text-lime' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Karai</h1>
        <p className="text-muted text-sm mt-0.5">
          Uso agregado y oportunidades comerciales detectadas. Las conversaciones de los usuarios son privadas —
          este panel no las expone, solo el mensaje puntual de cada lead.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="card">
            <p className="text-muted text-xs">{label}</p>
            <p className={`font-display font-bold text-2xl mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bdr">
          <h2 className="font-display font-semibold text-white">Oportunidades comerciales detectadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted">
                    Todavía no se detectaron oportunidades comerciales.
                  </td>
                </tr>
              )}
              {leads.map((lead) => {
                const profile = profilesById.get(lead.profile_id)
                return (
                  <tr key={lead.id}>
                    <td>
                      <p className="font-medium">{profile?.name ?? 'Sin perfil'}</p>
                      <p className="text-muted text-xs">{profile?.email ?? profile?.phone ?? lead.profile_id}</p>
                    </td>
                    <td className="text-sm max-w-xs">
                      <p className="line-clamp-2">{lead.excerpt}</p>
                    </td>
                    <td>
                      <span className={`badge text-xs ${STATUS_STYLE[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
                    </td>
                    <td className="text-muted text-sm">{new Date(lead.created_at).toLocaleString('es-PY')}</td>
                    <td>
                      <Link href={`/admin/karai/leads/${lead.id}`} className="btn text-xs">
                        Ver
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
