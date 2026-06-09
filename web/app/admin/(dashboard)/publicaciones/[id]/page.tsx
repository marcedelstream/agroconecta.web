import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'
import { PostForm } from '../PostForm'
import { updatePost } from '../actions'
import { ArchiveButton } from './ArchiveButton'
import type { OrganizationRow, PostRow } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

async function loadData(id: string) {
  const supabase = await createSupabaseServer()
  const [postRes, orgsRes] = await Promise.all([
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('organizations')
      .select('id,name')
      .order('name'),
  ])
  return {
    post: postRes.data as PostRow | null,
    orgs: (orgsRes.data ?? []) as Pick<OrganizationRow, 'id' | 'name'>[],
  }
}

export default async function EditarPublicacionPage({ params }: Props) {
  const { id } = await params
  const { post, orgs } = await loadData(id)
  if (!post) notFound()

  const boundUpdate = updatePost.bind(null, id)

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/publicaciones" className="text-muted text-sm hover:text-foreground transition-colors">
              ← Publicaciones
            </Link>
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground line-clamp-1">{post.title}</h1>
          <p className="text-muted text-sm mt-0.5">
            Creado el {new Date(post.created_at).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {post.editorial_status === 'published' && (
            <Link
              href={`/noticias/${post.id}`}
              target="_blank"
              className="btn text-xs"
            >
              Ver en sitio ↗
            </Link>
          )}
          <ArchiveButton id={post.id} />
        </div>
      </div>

      <div className="card">
        <PostForm post={post} orgs={orgs} action={boundUpdate} />
      </div>
    </div>
  )
}
