import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, type PostRow, type EditorialStatus, type NewsCategory } from '@/lib/types'
import { approvePost, rejectPost, deletePost } from './actions'
import { ConfirmSubmitButton } from '../ConfirmSubmitButton'

async function loadPosts(status?: string) {
  // Server-side (anon key + RLS) solo puede leer posts publicados — sin esto, los
  // filtros de "Borradores"/"En revisión"/"Rechazadas" siempre mostraban vacío.
  const supabase = createSupabaseAdmin()
  let query = supabase
    .from('posts')
    .select('id,title,category,target_departments,content_type,editorial_status,is_important,published_at,created_at,image_url,organizations(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status) query = query.eq('editorial_status', status)

  const { data } = await query
  return (data ?? []) as unknown as PostRow[]
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function PublicacionesPage({ searchParams }: Props) {
  const { status } = await searchParams
  const posts = await loadPosts(status)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Publicaciones</h1>
          <p className="text-muted text-sm mt-0.5">{posts.length} entradas</p>
        </div>
        <Link href="/admin/publicaciones/nueva" className="btn-primary text-sm">
          + Nueva
        </Link>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { label: 'Todas', value: '' },
          { label: 'En revisión', value: 'pending_review' },
          { label: 'Publicadas', value: 'published' },
          { label: 'Borradores', value: 'draft' },
          { label: 'Rechazadas', value: 'rejected' },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={value ? `/admin/publicaciones?status=${value}` : '/admin/publicaciones'}
            className={`btn text-xs shrink-0 ${status === value || (!status && !value) ? 'bg-lime text-bg border-lime' : ''}`}
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
                <th>Título</th>
                <th>Cuenta</th>
                <th>Categoría</th>
                <th>Segmento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted">
                    No hay publicaciones con este filtro.
                  </td>
                </tr>
              )}
              {posts.map((post) => {
                const org = Array.isArray(post.organizations) ? post.organizations[0] : post.organizations
                const statusColor = STATUS_COLORS[post.editorial_status as EditorialStatus] ?? '#6B7280'
                const isPending = post.editorial_status === 'pending_review'
                const departments = post.target_departments?.length ?? 0

                return (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/admin/publicaciones/${post.id}`} className="hover:text-lime transition-colors font-medium line-clamp-1 max-w-xs block">
                        {post.title}
                      </Link>
                      {post.is_important && (
                        <span className="text-xs text-warning">⚑ Importante</span>
                      )}
                    </td>
                    <td className="text-muted text-sm">{org?.name ?? '—'}</td>
                    <td className="text-sm">{CATEGORY_LABELS[post.category as NewsCategory] ?? post.category}</td>
                    <td className="text-muted text-xs">{departments > 0 ? `${departments} deptos.` : 'Nacional'}</td>
                    <td>
                      <span className="badge text-xs" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                        {STATUS_LABELS[post.editorial_status as EditorialStatus] ?? post.editorial_status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <form action={approvePost}>
                              <input type="hidden" name="id" value={post.id} />
                              <button type="submit" className="btn text-xs bg-success/15 text-success border-success/30 hover:bg-success/25">
                                Aprobar
                              </button>
                            </form>
                            <form action={rejectPost}>
                              <input type="hidden" name="id" value={post.id} />
                              <button type="submit" className="btn text-xs bg-danger/15 text-danger border-danger/30 hover:bg-danger/25">
                                Rechazar
                              </button>
                            </form>
                          </>
                        )}
                        <Link href={`/admin/publicaciones/${post.id}`} className="btn text-xs">
                          Editar
                        </Link>
                        <ConfirmSubmitButton
                          action={deletePost}
                          fields={{ id: post.id, image_url: post.image_url ?? '' }}
                          confirmMessage="¿Eliminar esta publicación? Esta acción no se puede deshacer."
                          className="btn text-xs text-danger border-danger/40 hover:bg-danger/10"
                        />
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
