import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { ECOSYSTEM_KIND_LABELS, type EcosystemListingKind, type EcosystemListingRow } from '@/lib/types'
import { deleteListing, toggleActive, createListing } from './actions'
import { EcosystemListingForm } from './EcosystemListingForm'
import { ConfirmSubmitButton } from '../ConfirmSubmitButton'

async function loadListings() {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('ecosystem_listings')
    .select('id,kind,title,location,modality,description,image_url,category_label,publisher_name,contact_url,is_active,published_at')
    .order('published_at', { ascending: false })
  return {
    listings: (data ?? []) as EcosystemListingRow[],
    error: error?.message ?? null,
  }
}

interface Props {
  searchParams: Promise<{ kind?: string }>
}

export default async function EcosistemaPage({ searchParams }: Props) {
  const { kind } = await searchParams
  const { listings, error } = await loadListings()
  const filtered = kind ? listings.filter((l) => l.kind === kind) : listings

  const TABS: { label: string; value: EcosystemListingKind | '' }[] = [
    { label: 'Todos', value: '' },
    ...(Object.entries(ECOSYSTEM_KIND_LABELS) as [EcosystemListingKind, string][]).map(([value, label]) => ({ value, label })),
  ]

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white">Ecosistema</h1>
        <p className="text-muted text-sm mt-0.5">
          Empleos, clasificados y cursos que se ven en la app (tab Ecosistema). &quot;Galería de videos&quot; no
          está acá — usa las publicaciones de tipo Video/Remate en <Link href="/admin/publicaciones" className="text-lime">Publicaciones</Link>.
        </p>
      </div>

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `ecosystem_listings`: {error}
        </div>
      )}

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(({ label, value }) => (
          <Link
            key={value || 'todos'}
            href={value ? `/admin/ecosistema?kind=${value}` : '/admin/ecosistema'}
            className={`btn text-xs shrink-0 ${(kind ?? '') === value ? 'bg-lime text-bg border-lime' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div>
          <h2 className="font-display font-semibold text-base text-foreground mb-3">Nueva publicación</h2>
          <EcosystemListingForm action={createListing} submitLabel="Crear publicación" />
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Ubicación</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted">
                      No hay publicaciones{kind ? ` de tipo ${ECOSYSTEM_KIND_LABELS[kind as EcosystemListingKind]}` : ''} todavía.
                    </td>
                  </tr>
                )}
                {filtered.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      {listing.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                          <Image src={listing.image_url} alt={listing.title} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary border border-bdr flex items-center justify-center text-muted text-xs">
                          —
                        </div>
                      )}
                    </td>
                    <td>
                      <p className="font-medium line-clamp-1 max-w-[220px]">{listing.title}</p>
                      <p className="text-muted text-xs">{listing.publisher_name}</p>
                    </td>
                    <td className="text-sm">{ECOSYSTEM_KIND_LABELS[listing.kind]}</td>
                    <td className="text-muted text-sm">{listing.location}</td>
                    <td className="text-sm">{listing.category_label}</td>
                    <td>
                      <span className={`badge text-xs ${listing.is_active ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'}`}>
                        {listing.is_active ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/ecosistema/${listing.id}`} className="btn text-xs">
                          Editar
                        </Link>
                        <form action={toggleActive}>
                          <input type="hidden" name="id" value={listing.id} />
                          <input type="hidden" name="is_active" value={String(listing.is_active)} />
                          <button type="submit" className="btn text-xs">
                            {listing.is_active ? 'Pausar' : 'Activar'}
                          </button>
                        </form>
                        <ConfirmSubmitButton
                          action={deleteListing}
                          fields={{ id: listing.id, image_url: listing.image_url ?? '' }}
                          confirmMessage="¿Eliminar esta publicación? Esta acción no se puede deshacer."
                          className="btn text-xs text-danger border-danger/40 hover:bg-danger/10"
                        />
                      </div>
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
