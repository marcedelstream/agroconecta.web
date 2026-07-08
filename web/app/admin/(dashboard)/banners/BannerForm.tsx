'use client'

import { useActionState } from 'react'
import { CATEGORY_LABELS, DEPARTMENT_LABELS, LINK_TYPE_LABELS, PLACEMENT_LABELS, type AdPlacement, type Department, type NewsCategory } from '@/lib/types'
import { createBanner, type BannerActionState } from './actions'

const initialState: BannerActionState = { error: null }

export function BannerForm() {
  const [state, formAction, isPending] = useActionState(createBanner, initialState)

  return (
    <form action={formAction} encType="multipart/form-data" className="card space-y-4 h-fit">
      <h2 className="font-display font-semibold text-base text-foreground">Nuevo banner</h2>

      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
        <input name="title" required className="input" placeholder="Remate Brangus destacado" />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Imagen del banner</label>
        <input
          name="image_file"
          type="file"
          accept="image/*"
          required
          className="block w-full text-sm text-muted
            file:mr-3 file:py-1.5 file:px-3
            file:rounded file:border-0
            file:text-xs file:font-semibold
            file:bg-lime/15 file:text-lime
            hover:file:bg-lime/25 cursor-pointer"
        />
        <p className="text-xs text-muted mt-1">Formato recomendado: 640 × 200 px · Máx. 8 MB.</p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">¿Dónde se muestra?</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(PLACEMENT_LABELS) as [AdPlacement, string][]).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="placement" value={value} defaultChecked={value === 'home'} className="accent-lime" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Destino del banner (opcional)</label>
        <select name="link_type" className="input" defaultValue="">
          <option value="">Sin destino — solo visual</option>
          {(Object.entries(LINK_TYPE_LABELS) as [string, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          name="link_target"
          className="input mt-2"
          placeholder="Ej: slug del evento, id de la publicación o URL completa"
        />
        <p className="text-xs text-muted mt-1">
          Para un evento, pegá el slug de eventosagropy.com (ej: <code>expo-agro-2026</code>). El programa y las
          noticias asociadas se cargan en <a href="/admin/eventos" className="text-lime">Eventos</a>.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Profesiones (opcional)</label>
        <input name="target_professions" className="input" placeholder="productor, veterinario" />
        <p className="text-xs text-muted mt-1">Separadas por coma. Vacío = todas.</p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Categorías</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(CATEGORY_LABELS) as [NewsCategory, string][]).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="target_categories" value={value} className="accent-lime" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Departamentos</p>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" name="target_departments" value={value} className="accent-lime" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="is_active" defaultChecked className="accent-lime" />
        Activo
      </label>

      <button type="submit" disabled={isPending} className="btn-primary text-sm w-full">
        {isPending ? 'Subiendo...' : 'Subir banner'}
      </button>
    </form>
  )
}
