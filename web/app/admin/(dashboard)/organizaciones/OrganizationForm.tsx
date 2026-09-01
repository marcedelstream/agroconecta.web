'use client'

import { useActionState } from 'react'
import {
  ALLY_CATEGORY_LABELS,
  ALLY_PLAN_LABELS,
  type AllyCategory,
  type AllyPlan,
  type CommercialStatus,
  type OrganizationRow,
  type OrganizationType,
} from '@/lib/types'
import type { OrganizationActionState } from './actions'

interface Props {
  organization?: OrganizationRow
  action: (prev: OrganizationActionState, formData: FormData) => Promise<OrganizationActionState>
  submitLabel: string
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-secondary border border-bdr text-foreground placeholder:text-muted focus:outline-none focus:border-lime text-sm transition-colors'

const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

const ORGANIZATION_TYPES: { value: OrganizationType; label: string }[] = [
  { value: 'media', label: 'Medio' },
  { value: 'asociacion', label: 'Asociación' },
  { value: 'institucion', label: 'Institución' },
  { value: 'gremio', label: 'Gremio' },
  { value: 'rematadora', label: 'Rematadora' },
  { value: 'empresa', label: 'Empresa' },
]

const COMMERCIAL_STATUSES: { value: CommercialStatus; label: string }[] = [
  { value: 'trial', label: 'Prueba' },
  { value: 'active', label: 'Activa' },
  { value: 'overdue', label: 'Vencida' },
  { value: 'paused', label: 'Pausada' },
]

const ALLY_PLANS: { value: AllyPlan; label: string }[] = (
  Object.entries(ALLY_PLAN_LABELS) as [AllyPlan, string][]
).map(([value, label]) => ({ value, label }))

const ALLY_CATEGORIES: { value: AllyCategory; label: string }[] = (
  Object.entries(ALLY_CATEGORY_LABELS) as [AllyCategory, string][]
).map(([value, label]) => ({ value, label }))

export function OrganizationForm({ organization, action, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, { error: null })

  return (
    <form action={formAction} encType="multipart/form-data" className="card space-y-4">
      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input
            name="name"
            required
            defaultValue={organization?.name ?? ''}
            className={inputClass}
            placeholder="Asociación Paraguaya de Brangus"
          />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            name="slug"
            defaultValue={organization?.slug ?? ''}
            className={inputClass}
            placeholder="asociacion-brangus"
          />
          <p className="text-xs text-muted mt-1">Si queda vacío, se genera desde el nombre.</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={organization?.description ?? ''}
          className={`${inputClass} resize-none`}
          placeholder="Breve descripción de la organización"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Tipo</label>
          <select name="type" defaultValue={organization?.type ?? 'asociacion'} className={inputClass}>
            {ORGANIZATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Estado comercial</label>
          <select name="commercial_status" defaultValue={organization?.commercial_status ?? 'trial'} className={inputClass}>
            {COMMERCIAL_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Plan</label>
          <input
            name="plan_name"
            defaultValue={organization?.plan_name ?? 'Piloto'}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notas de facturación</label>
        <textarea
          name="billing_notes"
          rows={2}
          defaultValue={organization?.billing_notes ?? ''}
          className={`${inputClass} resize-none`}
          placeholder="Ej: vence el 10 de cada mes, factura pendiente desde agosto..."
        />
        <p className="text-xs text-muted mt-1">Solo interno — se usa para hacer seguimiento manual de cobros y vencimientos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Foto / logo 1:1</label>
          <input
            name="logo_file"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-lime-dark"
          />
          <p className="text-xs text-muted mt-1">Recomendado: imagen cuadrada. Máximo 4 MB.</p>
        </div>

        <div>
          <label className={labelClass}>URL de logo alternativa</label>
          <input
            name="logo_url"
            type="text"
            defaultValue={organization?.logo_url ?? ''}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Slug de organizador en eventosagropy.com (opcional)</label>
        <input
          name="events_organizer_slug"
          defaultValue={organization?.events_organizer_slug ?? ''}
          className={inputClass}
          placeholder="fca-una"
        />
        <p className="text-xs text-muted mt-1">
          Si esta organización también carga eventos en eventosagropy.com, pegá acá su slug para que sus
          eventos aparezcan en su perfil dentro de la app.
        </p>
      </div>

      <div className="border-t border-bdr pt-4 space-y-4">
        <p className="text-sm font-medium text-foreground">Directorio de Aliados</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Plan de Aliado</label>
            <select name="ally_plan" defaultValue={organization?.ally_plan ?? ''} className={inputClass}>
              <option value="">Ninguno — no es Aliado</option>
              {ALLY_PLANS.map((plan) => (
                <option key={plan.value} value={plan.value}>{plan.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Categoría del Aliado</label>
            <select name="ally_category" defaultValue={organization?.ally_category ?? ''} className={inputClass}>
              <option value="">Sin categoría</option>
              {ALLY_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Contacto (teléfono / WhatsApp)</label>
          <input
            name="contact_phone"
            defaultValue={organization?.contact_phone ?? ''}
            className={inputClass}
            placeholder="+595981234567"
          />
          <p className="text-xs text-muted mt-1">Se usa para el botón de contacto directo en el Directorio de Aliados.</p>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="ally_founder"
            defaultChecked={organization?.ally_founder ?? false}
            className="w-4 h-4 rounded accent-lime"
          />
          <span className="text-sm text-foreground">Aliado Fundador</span>
        </label>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          name="is_verified"
          defaultChecked={organization?.is_verified ?? true}
          className="w-4 h-4 rounded accent-lime"
        />
        <span className="text-sm text-foreground">Cuenta verificada</span>
      </label>

      <button type="submit" disabled={isPending} className="btn-primary text-sm">
        {isPending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
