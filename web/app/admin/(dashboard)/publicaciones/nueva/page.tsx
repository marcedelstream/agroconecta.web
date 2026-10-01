import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { extraPostCategories } from '@/lib/interest-options'
import { createSupabaseServer } from '@/lib/supabase-server'
import { PostForm } from '../PostForm'
import { createPost } from '../actions'
import type { OrganizationRow } from '@/lib/types'
import { PageHeader } from '@/components/admin/ui'

async function loadOrgs() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('organizations')
    .select('id,name')
    .order('name')
  return (data ?? []) as Pick<OrganizationRow, 'id' | 'name'>[]
}

export default async function NuevaPublicacionPage() {
  const orgs = await loadOrgs()

  const extraCategories = await extraPostCategories(createSupabaseAdmin())
  return (
    <div className="max-w-4xl">
      <PageHeader title="Nueva publicación" help="Completá los campos. Podés guardarla como borrador o publicarla directo." />

      <div className="card">
        <PostForm orgs={orgs} action={createPost} extraCategories={extraCategories} />
      </div>
    </div>
  )
}
