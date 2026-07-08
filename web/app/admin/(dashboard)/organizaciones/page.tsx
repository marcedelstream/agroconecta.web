import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import type { OrganizationRow } from '@/lib/types'
import { OrganizationForm } from './OrganizationForm'
import { createOrganization } from './actions'

async function loadOrgs() {
  // Cliente admin: la lista tiene que mostrar tambien las organizaciones pausadas
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('organizations')
    .select('id,slug,name,description,type,commercial_status,plan_name,is_verified,logo_url')
    .order('name')
  return (data ?? []) as OrganizationRow[]
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

export default async function OrganizacionesPage() {
  const orgs = await loadOrgs()

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Organizaciones</h1>
          <p className="text-muted text-sm mt-0.5">{orgs.length} cuentas</p>
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
                  <th>Estado</th>
                  <th>Verificada</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orgs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted">
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
                    <td>
                      <span className={`badge text-xs ${STATUS_STYLE[org.commercial_status] ?? 'bg-secondary text-muted'}`}>
                        {STATUS_LABELS[org.commercial_status] ?? org.commercial_status}
                      </span>
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
