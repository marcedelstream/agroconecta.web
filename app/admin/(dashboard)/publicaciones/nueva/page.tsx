import { createSupabaseServer } from '@/lib/supabase-server'
import { PostForm } from '../PostForm'
import { createPost } from '../actions'
import type { OrganizationRow } from '@/lib/types'

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

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-foreground">Nueva publicación</h1>
        <p className="text-muted text-sm mt-0.5">Completá los campos y guardá como borrador o publicá directamente.</p>
      </div>

      <div className="card">
        <PostForm orgs={orgs} action={createPost} />
      </div>
    </div>
  )
}
