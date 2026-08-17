import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { ECOSYSTEM_KIND_LABELS, type EcosystemListingRow } from '@/lib/types'
import { EcosystemListingForm } from '../EcosystemListingForm'
import { updateListing, deleteListing } from '../actions'
import { ConfirmSubmitButton } from '../../ConfirmSubmitButton'

interface Props {
  params: Promise<{ id: string }>
}

async function loadListing(id: string) {
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('ecosystem_listings')
    .select('id,kind,title,location,modality,description,image_url,category_label,publisher_name,contact_url,is_active,published_at')
    .eq('id', id)
    .maybeSingle()
  return data as EcosystemListingRow | null
}

export default async function EcosistemaDetailPage({ params }: Props) {
  const { id } = await params
  const listing = await loadListing(id)
  if (!listing) notFound()

  const updateAction = updateListing.bind(null, listing.id)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/ecosistema" className="text-muted text-sm hover:text-foreground transition-colors">
          ← Ecosistema
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-foreground">{listing.title}</h1>
        <p className="text-muted text-sm mt-0.5">{ECOSYSTEM_KIND_LABELS[listing.kind]} · {listing.location}</p>
      </div>

      <div className="space-y-6">
        <EcosystemListingForm listing={listing} action={updateAction} submitLabel="Guardar cambios" />

        <div className="card border-danger/30">
          <h2 className="font-display font-semibold text-base text-danger mb-2">Eliminar publicación</h2>
          <p className="text-muted text-sm mb-4">Esta acción no se puede deshacer.</p>
          <ConfirmSubmitButton
            action={deleteListing}
            fields={{ id: listing.id, image_url: listing.image_url ?? '' }}
            confirmMessage="¿Eliminar esta publicación? Esta acción no se puede deshacer."
            className="btn text-sm text-danger border-danger/40 hover:bg-danger/10"
          />
        </div>
      </div>
    </div>
  )
}
