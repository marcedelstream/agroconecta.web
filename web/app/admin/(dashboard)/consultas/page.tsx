import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { SERVICE_LABELS, PUBLISH_LEAD_TARGETS } from './service-labels'
import { markLeadHandled, reopenLead, activateMembership } from './actions'
import { MembershipQuickForm } from './MembershipQuickForm'

interface ServiceLeadRow {
  id: string
  user_id: string | null
  service_type: string
  phone: string
  additional_info: string | null
  status: 'pendiente' | 'atendido'
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
    .select('id,user_id,service_type,phone,additional_info,status,created_at')
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

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function ConsultasPage({ searchParams }: Props) {
  const { status } = await searchParams
  const effectiveStatus = status ?? 'pendiente'
  const { leads, profiles, error } = await loadLeads()
  const filtered = effectiveStatus === 'todas' ? leads : leads.filter((l) => l.status === effectiveStatus)
  const pendingCount = leads.filter((l) => l.status === 'pendiente').length

  const TABS = [
    { label: 'Pendientes', value: 'pendiente' },
    { label: 'Atendidas', value: 'atendido' },
    { label: 'Todas', value: 'todas' },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white">Consultas de servicio</h1>
        <p className="text-muted text-sm mt-0.5">
          Formularios enviados desde las páginas de servicio de la app (menú lateral → Servicios), pedidos de
          membresía anual y pedidos de publicación (evento/empleo/clasificado/curso).
          {pendingCount > 0 && <span className="text-warning"> {pendingCount} sin atender.</span>}
        </p>
      </div>

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `service_leads`: {error}
        </div>
      )}

      <MembershipQuickForm />

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(({ label, value }) => (
          <Link
            key={value}
            href={`/admin/consultas?status=${value}`}
            className={`btn text-xs shrink-0 ${effectiveStatus === value ? 'bg-lime text-bg border-lime' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

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
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted">
                    No hay consultas {effectiveStatus === 'todas' ? '' : `en estado "${effectiveStatus}"`}.
                  </td>
                </tr>
              )}
              {filtered.map((lead) => {
                const profile = lead.user_id ? profiles.get(lead.user_id) : null
                const isPending = lead.status !== 'atendido'
                const publishTarget = PUBLISH_LEAD_TARGETS[lead.service_type]

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
                    <td className="text-xs text-muted max-w-xs">
                      <p className="line-clamp-3">{lead.additional_info || '—'}</p>
                    </td>
                    <td>
                      <span className={`badge text-xs ${isPending ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'}`}>
                        {isPending ? 'Pendiente' : 'Atendida'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col items-start gap-1.5">
                        {lead.service_type === 'membresia-anual' && lead.user_id && (
                          <form action={activateMembership}>
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <input type="hidden" name="user_id" value={lead.user_id} />
                            <button type="submit" className="btn text-xs bg-lime/15 text-lime border-lime/30 hover:bg-lime/25 whitespace-nowrap">
                              Activar membresía
                            </button>
                          </form>
                        )}
                        {publishTarget && (
                          <Link href={publishTarget} className="btn text-xs whitespace-nowrap">
                            Crear publicación →
                          </Link>
                        )}
                        <form action={isPending ? markLeadHandled : reopenLead}>
                          <input type="hidden" name="id" value={lead.id} />
                          <button type="submit" className="btn text-xs whitespace-nowrap">
                            {isPending ? 'Marcar atendido' : 'Reabrir'}
                          </button>
                        </form>
                      </div>
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
