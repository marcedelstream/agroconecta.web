import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, type PostRow, type EditorialStatus, type NewsCategory } from '@/lib/types'

async function loadDashboard() {
  const supabase = await createSupabaseServer()

  const [posts, orgs, banners] = await Promise.all([
    supabase
      .from('posts')
      .select('id,title,category,content_type,editorial_status,is_important,published_at,organizations(name)')
      .order('created_at', { ascending: false })
      .limit(15),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('ad_campaigns').select('id', { count: 'exact', head: true }),
  ])

  return {
    posts: (posts.data ?? []) as unknown as PostRow[],
    orgCount: orgs.count ?? 0,
    bannerCount: banners.count ?? 0,
  }
}

export default async function AdminDashboard() {
  const { posts, orgCount, bannerCount } = await loadDashboard()
  const pending = posts.filter((p) => p.editorial_status === 'pending_review')
  const published = posts.filter((p) => p.editorial_status === 'published')

  const stats = [
    { label: 'En revisión', value: pending.length, color: 'text-warning', href: '/admin/publicaciones?status=pending_review' },
    { label: 'Publicados', value: published.length, color: 'text-success', href: '/admin/publicaciones?status=published' },
    { label: 'Organizaciones', value: orgCount, color: 'text-info', href: '/admin/organizaciones' },
    { label: 'Banners', value: bannerCount, color: 'text-lime', href: '/admin/banners' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
          <p className="text-muted text-sm mt-0.5">
            Panel editorial y comercial de Agroconecta
          </p>
        </div>
        <Link href="/admin/publicaciones/nueva" className="btn-primary text-sm">
          + Nueva publicación
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color, href }) => (
          <Link key={label} href={href} className="card hover:border-bdr/60 transition-colors">
            <p className="text-muted text-xs">{label}</p>
            <p className={`font-display font-bold text-3xl mt-1 ${color}`}>{value}</p>
          </Link>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bdr">
          <h2 className="font-display font-semibold text-white">Publicaciones recientes</h2>
          <Link href="/admin/publicaciones" className="text-sm text-lime hover:text-lime-dark transition-colors">
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Cuenta</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Imp.</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const org = Array.isArray(post.organizations) ? post.organizations[0] : post.organizations
                const statusColor = STATUS_COLORS[post.editorial_status as EditorialStatus] ?? '#6B7280'
                return (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/admin/publicaciones/${post.id}`} className="hover:text-lime transition-colors font-medium line-clamp-1">
                        {post.title}
                      </Link>
                    </td>
                    <td className="text-muted text-sm">{org?.name ?? '—'}</td>
                    <td className="text-sm text-muted">{CATEGORY_LABELS[post.category as NewsCategory] ?? post.category}</td>
                    <td>
                      <span className="badge text-xs" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
                        {STATUS_LABELS[post.editorial_status as EditorialStatus] ?? post.editorial_status}
                      </span>
                    </td>
                    <td className="text-center">{post.is_important ? '⚑' : '—'}</td>
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
