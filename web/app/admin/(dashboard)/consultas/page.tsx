import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { SERVICE_LABELS } from './service-labels'

interface ServiceLeadRow {
  id: string
  user_id: string | null
  service_type: string
  phone: string
  additional_info: string | null
  created_at: string
}

interface ProfileRow {
  id: string
  name: string
  email: string | null
}

async function loadLeads() {
  const supabase = createSupabaseAdmin()
  const { data: leads, error } = await supabase
    .from('service_leads')
    .select('id,user_id,service_type,phone,additional_info,created_at')
    .order('created_at', { ascending: false })

  if (error || !leads) return { leads: [] as ServiceLeadRow[], profiles: new Map<string, ProfileRow>(), error: error?.message ?? null }

  const userIds = [...new Set(leads.map((l) => l.user_id).filter(Boolean))] as string[]
  const profiles = new Map<string, ProfileRow>()

  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id,name,email')
      .in('id', userIds)
    for (const p of profileRows ?? []) profiles.set(p.id, p as ProfileRow)
  }

  return { leads: leads as ServiceLeadRow[], profiles, error: null }
}

export default async function ConsultasPage() {
  const { leads, profiles, error } = await loadLeads()

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white">Consultas de servicio</h1>
        <p className="text-muted text-sm mt-0.5">
          Formularios enviados desde las páginas de servicio de la app (menú lateral → Servicios).
        </p>
      </div>

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `service_leads`: {error}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Usuario</th>
                <th>Teléfono</th>
                <th>Info adicional</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted">
                    No hay consultas cargadas todavía.
                  </td>
                </tr>
              )}
              {leads.map((lead) => {
                const profile = lead.user_id ? profiles.get(lead.user_id) : null
                return (
                  <tr key={lead.id}>
                    <td className="text-xs text-muted whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleString('es-PY')}
                    </td>
                    <td className="text-sm">{SERVICE_LABELS[lead.service_type] ?? lead.service_type}</td>
                    <td className="text-sm">
                      {profile ? (
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          {profile.email && <p className="text-xs text-muted">{profile.email}</p>}
                        </div>
                      ) : (
                        <span className="text-xs text-muted">Usuario no identificado</span>
                      )}
                    </td>
                    <td className="text-sm">{lead.phone}</td>
                    <td className="text-xs text-muted max-w-xs truncate">{lead.additional_info || '—'}</td>
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
