import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { extraPostCategories } from '@/lib/interest-options'
import { createSupabaseServer } from '@/lib/supabase-server'
import { PostForm } from '../PostForm'
import { createPost } from '../actions'
import { CONTENT_TYPE_LABELS, type ContentType, type OrganizationRow } from '@/lib/types'
import { PageHeader } from '@/components/admin/ui'

async function loadOrgs() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('organizations')
    .select('id,name')
    .order('name')
  return (data ?? []) as Pick<OrganizationRow, 'id' | 'name'>[]
}

export default async function NuevaPublicacionPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams
  const orgs = await loadOrgs()
  // ?tipo=video llega desde "Cargar algo nuevo" con el tipo de contenido ya elegido.
  const draft = tipo && tipo in CONTENT_TYPE_LABELS ? { content_type: tipo as ContentType } : undefined

  const extraCategories = await extraPostCategories(createSupabaseAdmin())
  return (
    <div className="max-w-4xl">
      <PageHeader title="Nueva publicación" help="Completá los campos. Podés guardarla como borrador o publicarla directo." />

      <div className="card">
        <PostForm orgs={orgs} draft={draft} action={createPost} extraCategories={extraCategories} />
      </div>
    </div>
  )
}
