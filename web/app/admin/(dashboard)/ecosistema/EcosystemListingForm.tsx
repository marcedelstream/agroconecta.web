'use client'

import { useActionState } from 'react'
import { ECOSYSTEM_KIND_LABELS, type EcosystemListingKind, type EcosystemListingRow } from '@/lib/types'
import type { EcosystemListingActionState } from './actions'

interface Props {
  listing?: EcosystemListingRow
  action: (prev: EcosystemListingActionState, formData: FormData) => Promise<EcosystemListingActionState>
  submitLabel: string
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-secondary border border-bdr text-foreground placeholder:text-muted focus:outline-none focus:border-lime text-sm transition-colors'

const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

const KINDS: { value: EcosystemListingKind; label: string }[] = (
  Object.entries(ECOSYSTEM_KIND_LABELS) as [EcosystemListingKind, string][]
).map(([value, label]) => ({ value, label }))

const CATEGORY_SUGGESTIONS = ['Ganadería', 'Agricultura', 'Maquinaria', 'Insumos', 'Servicios', 'Administración', 'Tecnología']
const MODALITY_SUGGESTIONS = ['Presencial', 'Remoto', 'Media jornada', 'Usado', 'Nuevo', 'Lote completo', 'Online']

export function EcosystemListingForm({ listing, action, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, { error: null })

  return (
    <form action={formAction} encType="multipart/form-data" className="card space-y-4">
      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label className={labelClass}>Tipo *</label>
        <select name="kind" required defaultValue={listing?.kind ?? 'empleo'} className={inputClass}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Título *</label>
        <input
          name="title"
          required
          defaultValue={listing?.title ?? ''}
          className={inputClass}
          placeholder="Ej: Capataz de estancia ganadera"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ubicación *</label>
          <input
            name="location"
            required
            defaultValue={listing?.location ?? ''}
            className={inputClass}
            placeholder="Ej: San Pedro"
          />
        </div>
        <div>
          <label className={labelClass}>Modalidad *</label>
          <input
            name="modality"
            required
            list="modality-suggestions"
            defaultValue={listing?.modality ?? ''}
            className={inputClass}
            placeholder="Ej: Presencial"
          />
          <datalist id="modality-suggestions">
            {MODALITY_SUGGESTIONS.map((m) => <option key={m} value={m} />)}
          </datalist>
        </div>
      </div>

      <div>
        <label className={labelClass}>Descripción *</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={listing?.description ?? ''}
          className={`${inputClass} resize-none`}
          placeholder="Detalle de la publicación"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Categoría *</label>
          <input
            name="category_label"
            required
            list="category-suggestions"
            defaultValue={listing?.category_label ?? ''}
            className={inputClass}
            placeholder="Ej: Ganadería"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className={labelClass}>Publica *</label>
          <input
            name="publisher_name"
            required
            defaultValue={listing?.publisher_name ?? ''}
            className={inputClass}
            placeholder="Nombre de la persona o empresa"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Contacto (WhatsApp o URL)</label>
        <input
          name="contact_url"
          defaultValue={listing?.contact_url ?? ''}
          className={inputClass}
          placeholder="https://wa.me/595981234567"
        />
        <p className="text-xs text-muted mt-1">Es lo que se abre cuando el usuario toca &quot;Ver contacto&quot; en la app.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Imagen (opcional)</label>
          <input
            name="image_file"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-lime-dark"
          />
          <p className="text-xs text-muted mt-1">Máx. 4 MB. Si no cargás nada, se muestra un ícono genérico.</p>
        </div>
        <div>
          <label className={labelClass}>URL de imagen alternativa</label>
          <input
            name="image_url"
            defaultValue={listing?.image_url ?? ''}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={listing?.is_active ?? true}
          className="w-4 h-4 rounded accent-lime"
        />
        <span className="text-sm text-foreground">Activo (visible en la app)</span>
      </label>

      <button type="submit" disabled={isPending} className="btn-primary text-sm w-full">
        {isPending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
