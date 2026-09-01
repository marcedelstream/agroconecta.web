import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { ALLY_PLAN_LABELS, type OrganizationRow } from '@/lib/types'
import { OrganizationForm } from './OrganizationForm'
import { createOrganization } from './actions'

const STATUS_ORDER: Record<string, number> = { overdue: 0, trial: 1, active: 2, paused: 3 }

async function loadOrgs() {
  // Cliente admin: la lista tiene que mostrar tambien las organizaciones pausadas
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('organizations')
    .select('id,slug,name,description,type,commercial_status,plan_name,is_verified,logo_url,ally_plan,ally_founder,billing_notes')
    .order('name')
  const orgs = (data ?? []) as OrganizationRow[]
  // Vencidas primero para que cobrar deje de depender de acordarse.
  return orgs.sort((a, b) => (STATUS_ORDER[a.commercial_status] ?? 9) - (STATUS_ORDER[b.commercial_status] ?? 9))
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-success/15 text-success',
  trial: 'bg-warning/15 text-warning',
  overdue: 'bg-danger/15 text-danger',
  paused: 'bg-muted/15 text-muted',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  trial: 'Prueba',
  overdue: 'Vencida',
  paused: 'Pausada',
}

interface Props {
  searchParams: Promise<{ estado?: string }>
}

export default async function OrganizacionesPage({ searchParams }: Props) {
  const { estado } = await searchParams
  const allOrgs = await loadOrgs()
  const overdueCount = allOrgs.filter((org) => org.commercial_status === 'overdue').length
  const orgs = estado === 'overdue' ? allOrgs.filter((org) => org.commercial_status === 'overdue') : allOrgs

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Organizaciones</h1>
          <p className="text-muted text-sm mt-0.5">{orgs.length} cuentas</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/organizaciones"
            className={`btn text-xs ${!estado ? 'bg-lime/15 text-lime border-lime/30' : ''}`}
          >
            Todas
          </Link>
          <Link
            href="/admin/organizaciones?estado=overdue"
            className={`btn text-xs ${estado === 'overdue' ? 'bg-danger/15 text-danger border-danger/30' : ''}`}
          >
            Vencidas{overdueCount > 0 ? ` (${overdueCount})` : ''}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div>
          <h2 className="font-display font-semibold text-base text-foreground mb-3">
            Nueva organización
          </h2>
          <OrganizationForm action={createOrganization} submitLabel="Crear organización" />
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th>Plan</th>
                  <th>Aliado</th>
                  <th>Estado</th>
                  <th>Verificada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orgs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted">
                      No hay organizaciones cargadas.
                    </td>
                  </tr>
                )}
                {orgs.map((org) => (
                  <tr key={org.id}>
                    <td>
                      {org.logo_url ? (
                        <Image src={org.logo_url} alt={org.name} width={40} height={40} className="rounded-lg w-10 h-10 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-secondary border border-bdr flex items-center justify-center text-muted text-xs">
                          {org.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-muted text-xs">{org.slug}</p>
                    </td>
                    <td className="text-muted text-sm capitalize">{org.type}</td>
                    <td className="text-sm">{org.plan_name}</td>
                    <td className="text-xs">
                      {org.ally_plan ? (
                        <span className="badge text-xs bg-lime/15 text-lime">
                          {ALLY_PLAN_LABELS[org.ally_plan]}{org.ally_founder ? ' · Fundador' : ''}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge text-xs ${STATUS_STYLE[org.commercial_status] ?? 'bg-secondary text-muted'}`}
                        title={org.billing_notes ?? undefined}
                      >
                        {STATUS_LABELS[org.commercial_status] ?? org.commercial_status}
                      </span>
                      {org.billing_notes && (
                        <p className="text-muted text-xs mt-1 max-w-[220px] truncate" title={org.billing_notes}>
                          {org.billing_notes}
                        </p>
                      )}
                    </td>
                    <td className="text-center">{org.is_verified ? '✓' : '—'}</td>
                    <td>
                      <Link
                        href={`/admin/organizaciones/${org.id}`}
                        className="btn text-xs"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
