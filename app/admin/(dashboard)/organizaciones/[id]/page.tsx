import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, type OrganizationRow, type PostRow, type EditorialStatus, type NewsCategory } from '@/lib/types'
import { OrganizationForm } from '../OrganizationForm'
import { deleteOrganization, updateOrganization } from '../actions'

interface Props {
  params: Promise<{ id: string }>
}

async function loadOrg(id: string) {
  const supabase = await createSupabaseServer()
  const [orgRes, postsRes] = await Promise.all([
    supabase
      .from('organizations')
      .select('id,slug,name,description,type,commercial_status,plan_name,is_verified,logo_url')
      .eq('id', id)
      .single(),
    supabase
      .from('posts')
      .select('id,title,editorial_status,category,created_at')
      .eq('organization_id', id)
      .order('created_at', { ascending: false })
      .limit(8),
  ])
  return {
    org: orgRes.data as OrganizationRow | null,
    posts: (postsRes.data ?? []) as unknown as PostRow[],
  }
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-success/15 text-success',
  trial: 'bg-warning/15 text-warning',
  overdue: 'bg-danger/15 text-danger',
  paused: 'bg-muted/15 text-muted',
}

const COMMERCIAL_STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  trial: 'Prueba',
  overdue: 'Vencida',
  paused: 'Pausada',
}

export default async function OrgDetailPage({ params }: Props) {
  const { id } = await params
  const { org, posts } = await loadOrg(id)
  if (!org) notFound()

  const updateAction = updateOrganization.bind(null, org.id)

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/organizaciones" className="text-muted text-sm hover:text-foreground transition-colors">
          ← Organizaciones
        </Link>
      </div>

      <div className="flex items-start gap-4 mb-8">
        {org.logo_url ? (
          <Image src={org.logo_url} alt={org.name} width={64} height={64} className="rounded-xl w-16 h-16 object-cover shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-secondary border border-bdr flex items-center justify-center text-2xl font-bold text-muted shrink-0">
            {org.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-2xl text-foreground">{org.name}</h1>
            {org.is_verified && (
              <span className="badge bg-lime/15 text-lime text-xs">✓ Verificada</span>
            )}
            <span className={`badge text-xs ${STATUS_STYLE[org.commercial_status] ?? ''}`}>
              {COMMERCIAL_STATUS_LABELS[org.commercial_status] ?? org.commercial_status}
            </span>
          </div>
          <p className="text-muted text-sm mt-0.5 capitalize">{org.type} · {org.plan_name}</p>
          {org.description && <p className="text-muted text-sm mt-2 max-w-lg">{org.description}</p>}
          {org.logo_url && (
            <p className="text-muted text-xs mt-2 break-all">Logo 1:1: {org.logo_url}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div>
          <h2 className="font-display font-semibold text-base text-foreground mb-3">
            Editar organización
          </h2>
          <OrganizationForm organization={org} action={updateAction} submitLabel="Guardar cambios" />
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info inline-block" />
                Publicaciones
              </h2>
              <Link
                href="/admin/publicaciones/nueva"
                className="btn text-xs"
              >
                + Nueva
              </Link>
            </div>

            {posts.length === 0 ? (
              <p className="text-muted text-sm">Sin publicaciones aún.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {posts.map((post) => {
                  const statusColor = STATUS_COLORS[post.editorial_status as EditorialStatus] ?? '#6B7280'
                  return (
                    <Link
                      key={post.id}
                      href={`/admin/publicaciones/${post.id}`}
                      className="flex items-center justify-between gap-3 group py-1"
                    >
                      <span className="text-sm text-foreground group-hover:text-lime transition-colors line-clamp-1">
                        {post.title}
                      </span>
                      <span className="text-muted text-xs">{CATEGORY_LABELS[post.category as NewsCategory]}</span>
                      <span
                        className="badge text-xs shrink-0"
                        style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                      >
                        {STATUS_LABELS[post.editorial_status as EditorialStatus] ?? post.editorial_status}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card border-danger/30">
            <h2 className="font-display font-semibold text-base text-danger mb-2">
              Eliminar organización
            </h2>
            <p className="text-muted text-sm mb-4">
              Si tiene publicaciones asociadas, Supabase puede impedir la eliminación para proteger el historial.
            </p>
            <form action={deleteOrganization}>
              <input type="hidden" name="id" value={org.id} />
              <button type="submit" className="btn text-xs border-danger/40 text-danger hover:bg-danger/10">
                Eliminar organización
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
