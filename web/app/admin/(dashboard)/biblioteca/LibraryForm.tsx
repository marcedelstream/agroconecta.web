'use client'

import { useActionState } from 'react'
import { LIBRARY_CATEGORY_LABELS, type LibraryCategory } from '@/lib/types'
import { createLibraryItem, type LibraryActionState } from './actions'

const initialState: LibraryActionState = { error: null }

export function LibraryForm() {
  const [state, formAction, isPending] = useActionState(createLibraryItem, initialState)

  return (
    <form action={formAction} encType="multipart/form-data" className="card space-y-4 h-fit">
      <h2 className="font-display font-semibold text-base text-foreground">Nuevo título</h2>

      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
        <input name="title" required className="input" placeholder="Manual de manejo de pasturas" />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Autor (opcional)</label>
        <input name="author" className="input" placeholder="Nombre del autor o institución" />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
        <textarea name="description" required rows={3} className="input resize-none" placeholder="De qué trata el título" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Categoría</label>
          <select name="category" className="input" defaultValue="manual">
            {(Object.entries(LIBRARY_CATEGORY_LABELS) as [LibraryCategory, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Páginas (opcional)</label>
          <input name="page_count" type="number" min="1" className="input" placeholder="120" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Portada</label>
        <input
          name="cover_file"
          type="file"
          accept="image/*"
          required
          className="block w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-lime/15 file:text-lime hover:file:bg-lime/25 cursor-pointer"
        />
        <p className="text-xs text-muted mt-1">Imagen vertical tipo tapa de libro · Máx. 4 MB.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Archivo (PDF)</label>
        <input
          name="item_file"
          type="file"
          accept="application/pdf"
          required
          className="block w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-lime/15 file:text-lime hover:file:bg-lime/25 cursor-pointer"
        />
        <p className="text-xs text-muted mt-1">Máx. 30 MB. Se guarda en un bucket privado.</p>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" name="is_published" defaultChecked className="w-4 h-4 rounded accent-lime" />
        <span className="text-sm text-foreground">Publicado</span>
      </label>

      <button type="submit" disabled={isPending} className="btn-primary text-sm w-full">
        {isPending ? 'Subiendo...' : 'Agregar título'}
      </button>
    </form>
  )
}
