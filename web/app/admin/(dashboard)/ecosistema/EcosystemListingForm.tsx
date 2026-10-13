'use client'

import { useActionState, useState } from 'react'
import { ECOSYSTEM_KINDS } from '@/lib/ecosystem-kinds'
import type { EcosystemListingKind, EcosystemListingRow } from '@/lib/types'
import type { ListingDraft } from '@/lib/news-import/listing-draft'
import type { EcosystemListingActionState } from './actions'
import { Help } from '@/components/admin/ui'
import { KindPicker } from './KindPicker'
import { LinkPrefill } from './LinkPrefill'

interface Props {
  listing?: EcosystemListingRow
  /** Tipo ya elegido al abrir (ej. desde "Cargar algo nuevo" o la pestaña filtrada). */
  initialKind?: EcosystemListingKind
  action: (prev: EcosystemListingActionState, formData: FormData) => Promise<EcosystemListingActionState>
  submitLabel: string
}

type Fields = Omit<ListingDraft, 'warning'>

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-secondary border border-bdr text-foreground placeholder:text-muted focus:outline-none focus:border-lime text-sm transition-colors'

const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

function fieldsFrom(listing?: EcosystemListingRow): Fields {
  return {
    title: listing?.title ?? '',
    location: listing?.location ?? '',
    modality: listing?.modality ?? '',
    description: listing?.description ?? '',
    category_label: listing?.category_label ?? '',
    publisher_name: listing?.publisher_name ?? '',
    contact_url: listing?.contact_url ?? '',
    image_url: listing?.image_url ?? '',
  }
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime text-xs font-bold text-bg">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Chips({ options, value, onPick }: { options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            value === o ? 'border-lime bg-lime text-bg' : 'border-bdr bg-surface text-muted hover:text-foreground'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function EcosystemListingForm({ listing, initialKind, action, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState(action, { error: null })
  const [kind, setKind] = useState<EcosystemListingKind | null>(listing?.kind ?? initialKind ?? null)
  const [fields, setFields] = useState<Fields>(() => fieldsFrom(listing))
  const set = (key: keyof Fields) => (value: string) => setFields((f) => ({ ...f, [key]: value }))
  const bind = (key: keyof Fields) => ({
    name: key,
    value: fields[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key)(e.target.value),
  })

  if (!kind) return <KindPicker onPick={setKind} />
  const cfg = ECOSYSTEM_KINDS[kind]

  return (
    <form action={formAction} encType="multipart/form-data" className="card space-y-6">
      <input type="hidden" name="kind" value={kind} />

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
        <span className="flex items-center gap-2 font-display font-semibold text-foreground">
          <span className="text-2xl" aria-hidden>{cfg.emoji}</span> {cfg.label}
        </span>
        <button type="button" onClick={() => setKind(null)} className="text-xs font-semibold text-lime hover:underline">
          Cambiar tipo
        </button>
      </div>

      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{state.error}</div>
      )}

      {!listing && <LinkPrefill kind={kind} onDraft={(draft) => setFields({ ...fieldsFrom(), ...draft })} />}

      <Step n={1} title="Lo principal">
        <div>
          <label className={labelClass}>{cfg.title.label} *</label>
          <input required className={inputClass} placeholder={cfg.title.placeholder} {...bind('title')} />
        </div>
        <div>
          <label className={labelClass}>{cfg.publisher.label} *<Help text={cfg.publisher.help} /></label>
          <input required className={inputClass} placeholder={cfg.publisher.placeholder} {...bind('publisher_name')} />
        </div>
      </Step>

      <Step n={2} title="Dónde y cómo">
        <div>
          <label className={labelClass}>Ubicación *</label>
          <input required className={inputClass} placeholder={cfg.location.placeholder} {...bind('location')} />
        </div>
        <div>
          <label className={labelClass}>{cfg.modality.label} *<Help text={cfg.modality.help} /></label>
          <input required className={`${inputClass} mb-2`} placeholder="Tocá una opción o escribí" {...bind('modality')} />
          <Chips options={cfg.modality.suggestions} value={fields.modality} onPick={set('modality')} />
        </div>
      </Step>

      <Step n={3} title="El detalle">
        <div className="rounded-xl bg-secondary px-3 py-2 text-xs text-muted">
          <span className="font-semibold text-foreground">Acordate de poner: </span>
          {cfg.description.checklist.join(' · ')}
        </div>
        <textarea required rows={6} className={`${inputClass} resize-y`} placeholder={cfg.description.placeholder} {...bind('description')} />
      </Step>

      <Step n={4} title="Rubro y contacto">
        <div>
          <label className={labelClass}>Rubro *<Help text="Se ve como etiqueta en el aviso." /></label>
          <input required className={`${inputClass} mb-2`} placeholder="Tocá una opción o escribí" {...bind('category_label')} />
          <Chips options={cfg.categories} value={fields.category_label} onPick={set('category_label')} />
        </div>
        <div>
          <label className={labelClass}>Contacto<Help text={cfg.contactHelp} /></label>
          <input className={inputClass} placeholder="https://wa.me/595981234567" {...bind('contact_url')} />
          <p className="text-xs text-muted mt-1">Es lo que se abre cuando tocan &quot;Contactar&quot; en la app.</p>
        </div>
      </Step>

      <Step n={5} title="Imagen (opcional)">
        {fields.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fields.image_url} alt="" className="h-32 w-full rounded-xl object-cover bg-secondary" />
        )}
        <input
          name="image_file"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-lime-dark"
        />
        <p className="text-xs text-muted">Máx. 4 MB. Si subís un archivo, reemplaza al link de abajo.</p>
        <input className={inputClass} placeholder="O pegá el link de una imagen: https://..." {...bind('image_url')} />
      </Step>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" name="is_active" defaultChecked={listing?.is_active ?? true} className="w-4 h-4 rounded accent-lime" />
        <span className="text-sm text-foreground">Activo (visible en la app)</span>
      </label>

      <button type="submit" disabled={isPending} className="btn-primary text-sm w-full">
        {isPending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
