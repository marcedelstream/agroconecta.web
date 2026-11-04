import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createCover, deleteCover, setCoverOrder, toggleCover } from './actions'
import { ConfirmSubmitButton } from '../ConfirmSubmitButton'
import { EmptyState, FieldLabel, Notice, PageHeader } from '@/components/admin/ui'
import type { FeedbackParams } from '@/lib/admin-feedback'
import { CreateDrawer } from '@/components/admin/CreateDrawer'

export const dynamic = 'force-dynamic'

interface CoverRow {
  id: string
  title: string
  image_url: string
  is_active: boolean
  sort_order: number
}

// Portadas que cada persona puede elegir para su Perfil en la app (solo las que cargamos acá).
export default async function PortadasPage({ searchParams }: { searchParams: Promise<FeedbackParams> }) {
  const feedback = await searchParams
  const { data, error } = await createSupabaseAdmin()
    .from('profile_covers')
    .select('id,title,image_url,is_active,sort_order')
    .order('sort_order', { ascending: true })
  const covers = (data ?? []) as CoverRow[]

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Portadas del perfil"
        help="Imágenes para la portada del Perfil en la app. Cada persona elige una de estas; no pueden subir fotos propias. Más adelante algunas se van a poder canjear con puntos."
      />
      <Notice {...feedback} />

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `profile_covers`: {error.message}. Falta correr <code>supabase/fix-v2-profile-covers.sql</code>.
        </div>
      )}

      <div className="mb-5 flex justify-end">
        <CreateDrawer label="Nueva portada" title="Nueva portada" description="Imagen horizontal, mejor 1200 × 400 px. Lo de abajo queda tapado por la foto de perfil.">
          <form action={createCover} className="space-y-4">
            <div>
              <FieldLabel htmlFor="title">Nombre</FieldLabel>
              <input id="title" name="title" className="input" placeholder="Ej: Atardecer en el campo" required />
            </div>
            <div>
              <FieldLabel htmlFor="image_file">Imagen</FieldLabel>
              <input id="image_file" name="image_file" type="file" accept="image/*" required className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg" />
            </div>
            <div>
              <FieldLabel htmlFor="sort_order" help="1 sale primero en la lista de la app.">Orden</FieldLabel>
              <input id="sort_order" name="sort_order" type="number" min={1} step={1} className="input w-24" placeholder="1" />
            </div>
            <button type="submit" className="btn-primary">Cargar portada</button>
          </form>
        </CreateDrawer>
      </div>

      {covers.length === 0 ? (
        <EmptyState title="Todavía no hay portadas" text="Cargá la primera y ya aparece para elegir en el Perfil de la app." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {covers.map((c) => (
            <div key={c.id} className="card p-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image_url} alt={c.title} className="h-28 w-full object-cover" />
              <div className="flex flex-wrap items-center gap-2 p-3">
                <p className="mr-auto font-medium">{c.title}</p>
                <span className={`badge text-xs ${c.is_active ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'}`}>{c.is_active ? 'Visible' : 'Oculta'}</span>
                <form action={setCoverOrder} className="flex items-center gap-1 text-xs text-muted">
                  <input type="hidden" name="id" value={c.id} />
                  Orden
                  <input name="sort_order" type="number" min={1} step={1} defaultValue={c.sort_order} className="input w-16 py-1 text-xs" />
                  <button type="submit" className="btn text-xs">Guardar</button>
                </form>
                <form action={toggleCover}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="is_active" value={String(c.is_active)} />
                  <button type="submit" className="btn text-xs">{c.is_active ? 'Ocultar' : 'Mostrar'}</button>
                </form>
                <ConfirmSubmitButton
                  action={deleteCover}
                  fields={{ id: c.id, image_url: c.image_url }}
                  confirmMessage="¿Eliminar esta portada? Quien la tenga elegida vuelve a la de Agroconecta."
                  className="btn text-xs text-danger border-danger/40 hover:bg-danger/10"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
