'use client'

import { useActionState } from 'react'
import type { OrganizationRow, PostRow } from '@/lib/types'
import { Help } from '@/components/admin/ui'
import { PostForm } from '../PostForm'
import { createPost } from '../actions'
import { importFromUrl, type ImportState } from './actions'

type Org = Pick<OrganizationRow, 'id' | 'name'>

interface Props {
  orgs: Org[]
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-secondary border border-bdr text-foreground placeholder:text-muted focus:outline-none focus:border-lime text-sm transition-colors'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

// Si el medio de origen ya existe como organización se preselecciona; si no, Agroconecta.
function suggestOrg(orgs: Org[], siteName: string, sourceUrl: string): string {
  const host = normalize(new URL(sourceUrl).hostname.replace(/^www\./, '').split('.')[0])
  const site = normalize(siteName)
  const match = orgs.find((org) => {
    const name = normalize(org.name)
    return name === site || site.includes(name) || name.replace(/\s+/g, '').includes(host)
  })
  return match?.id ?? orgs.find((org) => normalize(org.name).includes('agroconecta'))?.id ?? ''
}

export function ImportClient({ orgs }: Props) {
  const [state, formAction, isPending] = useActionState<ImportState, FormData>(importFromUrl, { status: 'idle' })

  const draft: Partial<PostRow> | undefined =
    state.status === 'ok'
      ? {
          title: state.draft.title,
          summary: state.draft.summary,
          content: state.draft.content,
          category: state.draft.category,
          target_departments: state.draft.target_departments,
          image_url: state.draft.image_url,
          content_type: 'article',
          editorial_status: 'draft',
          organization_id: suggestOrg(orgs, state.siteName, state.sourceUrl),
        }
      : undefined

  return (
    <div className="space-y-6">
      <form action={formAction} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Link de la nota</label>
          <input
            name="url"
            type="url"
            required
            className={inputClass}
            placeholder="https://www.medio.com.py/ganaderia/nombre-de-la-nota"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-foreground mb-2">
            ¿Cómo la querés cargar?
            <Help text="Reescrita: misma información con otras palabras y 'Con información de' el medio. Tal cual: el texto original sin cambios y 'Fuente' con link. Para copiar tal cual conviene tener permiso del medio." />
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-start gap-2.5 rounded-lg border border-bdr bg-secondary px-3 py-2.5 cursor-pointer">
              <input type="radio" name="mode" value="rewrite" defaultChecked className="mt-0.5 accent-lime" />
              <span className="text-sm">
                <span className="font-medium text-foreground">Reescribir con otras palabras</span>
                <span className="block text-xs text-muted">La IA la redacta de nuevo, sin inventar datos.</span>
              </span>
            </label>
            <label className="flex items-start gap-2.5 rounded-lg border border-bdr bg-secondary px-3 py-2.5 cursor-pointer">
              <input type="radio" name="mode" value="verbatim" className="mt-0.5 accent-lime" />
              <span className="text-sm">
                <span className="font-medium text-foreground">Copiar tal cual, con la fuente</span>
                <span className="block text-xs text-muted">Texto original y link al medio al final.</span>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="btn-primary text-sm">
            {isPending ? 'Leyendo la nota…' : 'Preparar publicación'}
          </button>
          {isPending && <span className="text-xs text-muted">Puede tardar unos segundos si se reescribe.</span>}
        </div>

        {state.status === 'error' && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{state.error}</div>
        )}
      </form>

      {state.status === 'ok' && draft && (
        <div className="card space-y-4">
          <div className="rounded-lg border border-bdr bg-secondary px-4 py-3 text-sm text-foreground">
            {state.mode === 'rewrite' ? 'Reescrita' : 'Copiada tal cual'} desde{' '}
            <a href={state.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              {state.siteName}
            </a>
            . Revisá título, texto, categoría y organización, y después guardala. Queda como <strong>borrador</strong> salvo
            que cambies el estado.
          </div>

          {state.draft.warning && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
              {state.draft.warning}
            </div>
          )}

          {state.draft.image_url && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.draft.image_url} alt="" className="w-full max-h-72 object-cover rounded-lg border border-bdr" />
              <p className="text-xs text-muted mt-1">
                Imagen del medio original (queda en &quot;URL de imagen alternativa&quot;). Si tenés una propia, subila en
                &quot;Imagen destacada&quot;.
              </p>
            </div>
          )}

          <PostForm key={state.nonce} draft={draft} orgs={orgs} action={createPost} />
        </div>
      )}
    </div>
  )
}
