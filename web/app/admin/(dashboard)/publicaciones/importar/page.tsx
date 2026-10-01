import { createSupabaseServer } from '@/lib/supabase-server'
import type { OrganizationRow } from '@/lib/types'
import { PageHeader } from '@/components/admin/ui'
import { ImportClient } from './ImportClient'

async function loadOrgs() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('organizations')
    .select('id,name')
    .order('name')
  return (data ?? []) as Pick<OrganizationRow, 'id' | 'name'>[]
}

export default async function ImportarPublicacionPage() {
  const orgs = await loadOrgs()

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Importar nota desde un link"
        help="Pegá el link de una noticia de otro medio. Se arma la publicación con sus datos: reescrita con otras palabras o copiada tal cual con la fuente. Siempre queda para revisar antes de guardar."
      />
      <ImportClient orgs={orgs} />
    </div>
  )
}
