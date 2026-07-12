import Image from 'next/image'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { LIBRARY_CATEGORY_LABELS, type LibraryItemRow } from '@/lib/types'
import { deleteLibraryItem, togglePublished } from './actions'
import { LibraryForm } from './LibraryForm'
import { ConfirmSubmitButton } from '../ConfirmSubmitButton'

async function loadItems() {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('library_items')
    .select('id,title,author,description,category,cover_image_url,file_url,file_type,page_count,is_published,created_at')
    .order('created_at', { ascending: false })
  return {
    items: (data ?? []) as LibraryItemRow[],
    error: error?.message ?? null,
  }
}

export default async function BibliotecaPage() {
  const { items, error } = await loadItems()

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Biblioteca</h1>
          <p className="text-muted text-sm mt-0.5">{items.length} títulos</p>
        </div>
      </div>

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `library_items`: {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <LibraryForm />

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Portada</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted">
                      No hay títulos cargados.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="relative w-10 h-14 rounded-md overflow-hidden bg-secondary">
                        <Image src={item.cover_image_url} alt={item.title} fill className="object-cover" sizes="40px" />
                      </div>
                    </td>
                    <td>
                      <p className="font-medium">{item.title}</p>
                      {item.author && <p className="text-muted text-xs">{item.author}</p>}
                    </td>
                    <td className="text-sm">{LIBRARY_CATEGORY_LABELS[item.category]}</td>
                    <td>
                      <span className={`badge text-xs ${item.is_published ? 'bg-success/15 text-success' : 'bg-muted/15 text-muted'}`}>
                        {item.is_published ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <form action={togglePublished}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="is_published" value={String(item.is_published)} />
                          <button type="submit" className="btn text-xs">
                            {item.is_published ? 'Ocultar' : 'Publicar'}
                          </button>
                        </form>
                        <ConfirmSubmitButton
                          action={deleteLibraryItem}
                          fields={{ id: item.id, cover_image_url: item.cover_image_url, file_url: item.file_url }}
                          confirmMessage="¿Eliminar este título? Esta acción no se puede deshacer."
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
