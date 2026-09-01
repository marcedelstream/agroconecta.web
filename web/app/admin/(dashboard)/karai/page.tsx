import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { startOfTodayAsuncionUtc } from '@/lib/karai/quota'

interface ConversationRow {
  id: string
  profile_id: string
  channel: string
  started_at: string
  last_message_at: string
}

interface ProfileLite {
  id: string
  name: string | null
  email: string | null
}

async function loadKaraiData() {
  const admin = createSupabaseAdmin()
  const todayStart = startOfTodayAsuncionUtc()

  const [conversationsRes, conversationCountRes, messageCountRes, usageTodayRes, usageWeekRes] = await Promise.all([
    admin
      .from('conversations')
      .select('id,profile_id,channel,started_at,last_message_at')
      .order('last_message_at', { ascending: false })
      .limit(30),
    admin.from('conversations').select('id', { count: 'exact', head: true }),
    admin.from('conversation_messages').select('id', { count: 'exact', head: true }),
    admin.from('usage_ledger').select('profile_id,tokens_used').gte('created_at', todayStart),
    admin
      .from('usage_ledger')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 3_600_000).toISOString()),
  ])

  const conversations = (conversationsRes.data ?? []) as ConversationRow[]
  const usageToday = usageTodayRes.data ?? []
  const activeUsersToday = new Set(usageToday.map((row) => row.profile_id)).size
  const tokensToday = usageToday.reduce((sum, row) => sum + (row.tokens_used ?? 0), 0)

  const profileIds = Array.from(new Set(conversations.map((c) => c.profile_id)))
  const { data: profilesData } = profileIds.length
    ? await admin.from('profiles').select('id,name,email').in('id', profileIds)
    : { data: [] as ProfileLite[] }
  const profilesById = new Map((profilesData ?? []).map((p) => [p.id, p as ProfileLite]))

  return {
    conversations,
    conversationCount: conversationCountRes.count ?? 0,
    messageCount: messageCountRes.count ?? 0,
    usageQueriesToday: usageToday.length,
    activeUsersToday,
    tokensToday,
    usageLast7Days: usageWeekRes.count ?? 0,
    profilesById,
  }
}

export default async function KaraiAdminPage() {
  const { conversations, conversationCount, messageCount, usageQueriesToday, activeUsersToday, tokensToday, usageLast7Days, profilesById } =
    await loadKaraiData()

  const stats = [
    { label: 'Consultas hoy', value: usageQueriesToday, color: 'text-lime' },
    { label: 'Usuarios activos hoy', value: activeUsersToday, color: 'text-info' },
    { label: 'Consultas últimos 7 días', value: usageLast7Days, color: 'text-warning' },
    { label: 'Tokens usados hoy', value: tokensToday.toLocaleString('es-PY'), color: 'text-success' },
    { label: 'Conversaciones totales', value: conversationCount, color: 'text-muted' },
    { label: 'Mensajes totales', value: messageCount, color: 'text-muted' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-white">Karai</h1>
        <p className="text-muted text-sm mt-0.5">
          Solo lectura — uso y conversaciones del asistente. La cuota Starter es de 15 consultas/día por usuario.
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
          <h2 className="font-display font-semibold text-white">Conversaciones recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Canal</th>
                <th>Iniciada</th>
                <th>Último mensaje</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted">
                    Todavía no hay conversaciones.
                  </td>
                </tr>
              )}
              {conversations.map((conv) => {
                const profile = profilesById.get(conv.profile_id)
                return (
                  <tr key={conv.id}>
                    <td>
                      <p className="font-medium">{profile?.name ?? 'Sin perfil'}</p>
                      <p className="text-muted text-xs">{profile?.email ?? conv.profile_id}</p>
                    </td>
                    <td className="text-muted text-sm capitalize">{conv.channel}</td>
                    <td className="text-muted text-sm">{new Date(conv.started_at).toLocaleString('es-PY')}</td>
                    <td className="text-muted text-sm">{new Date(conv.last_message_at).toLocaleString('es-PY')}</td>
                    <td>
                      <Link href={`/admin/karai/${conv.id}`} className="btn text-xs">
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
