'use client'

import { useActionState, useRef } from 'react'
import type { PostRow, OrganizationRow, NewsCategory, ContentType, AuctionStatus, EditorialStatus, Department } from '@/lib/types'
import { CATEGORY_LABELS, CONTENT_TYPE_LABELS, AUCTION_STATUS_LABELS, STATUS_LABELS, DEPARTMENT_LABELS } from '@/lib/types'
import type { ActionState } from './actions'

interface Props {
  post?: PostRow
  orgs: Pick<OrganizationRow, 'id' | 'name'>[]
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-secondary border border-bdr text-foreground placeholder:text-muted focus:outline-none focus:border-lime text-sm transition-colors'

const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

export function PostForm({ post, orgs, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { error: null })
  const selectedDepartments = new Set(post?.target_departments ?? [])
  const contentRef = useRef<HTMLTextAreaElement>(null)

  function insertContent(snippet: string) {
    const field = contentRef.current
    if (!field) return

    const start = field.selectionStart
    const end = field.selectionEnd
    const before = field.value.slice(0, start)
    const after = field.value.slice(end)
    const prefix = before && !before.endsWith('\n') ? '\n\n' : ''
    const suffix = after && !after.startsWith('\n') ? '\n\n' : ''
    field.value = `${before}${prefix}${snippet}${suffix}${after}`
    const nextCursor = before.length + prefix.length + snippet.length
    field.focus()
    field.setSelectionRange(nextCursor, nextCursor)
  }

  function addParagraph() {
    const text = window.prompt('Texto del párrafo')
    if (!text) return
    insertContent(`<p>${text}</p>`)
  }

  function addSubtitle() {
    const text = window.prompt('Subtítulo')
    if (!text) return
    insertContent(`<h2>${text}</h2>`)
  }

  function addQuote() {
    const quote = window.prompt('Texto de la cita')
    if (!quote) return
    const author = window.prompt('Autor o fuente de la cita (opcional)')
    insertContent(`<blockquote><p>${quote}</p>${author ? `<cite>${author}</cite>` : ''}</blockquote>`)
  }

  function addLink() {
    const url = window.prompt('URL del enlace')
    if (!url) return
    const text = window.prompt('Texto visible del enlace') || url
    insertContent(`<p><a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a></p>`)
  }

  function addVideo() {
    const url = window.prompt('URL embed de YouTube o video')
    if (!url) return
    insertContent(`<div class="content-video"><iframe src="${url}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`)
  }

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      {post && <input type="hidden" name="id" value={post.id} />}
      {post?.published_at && (
        <input type="hidden" name="published_at" value={post.published_at} />
      )}

      <div>
        <label className={labelClass}>Título *</label>
        <input
          name="title"
          required
          defaultValue={post?.title ?? ''}
          className={inputClass}
          placeholder="Título de la publicación"
        />
      </div>

      <div>
        <label className={labelClass}>Resumen</label>
        <textarea
          name="summary"
          rows={2}
          defaultValue={post?.summary ?? ''}
          className={`${inputClass} resize-none`}
          placeholder="Descripción corta que aparece en la tarjeta de noticia"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <label className="text-sm font-medium text-foreground">
            Contenido
            <span className="ml-2 text-xs text-muted font-normal">(HTML permitido)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={addParagraph} className="btn text-xs px-3 py-1.5">Párrafo</button>
            <button type="button" onClick={addSubtitle} className="btn text-xs px-3 py-1.5">Subtítulo</button>
            <button type="button" onClick={addQuote} className="btn text-xs px-3 py-1.5">Cita</button>
            <button type="button" onClick={addLink} className="btn text-xs px-3 py-1.5">Link</button>
            <button type="button" onClick={addVideo} className="btn text-xs px-3 py-1.5">Video</button>
            <button type="button" onClick={() => insertContent('<hr />')} className="btn text-xs px-3 py-1.5">Separador</button>
          </div>
        </div>
        <textarea
          ref={contentRef}
          name="content"
          rows={14}
          defaultValue={post?.content ?? ''}
          className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
          placeholder="<p>Contenido completo de la noticia...</p>"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Categoría *</label>
          <select
            name="category"
            required
            defaultValue={post?.category ?? 'ganaderia'}
            className={inputClass}
          >
            {(Object.entries(CATEGORY_LABELS) as [NewsCategory, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Tipo de contenido</label>
          <select
            name="content_type"
            defaultValue={post?.content_type ?? 'article'}
            className={inputClass}
          >
            {(Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Estado de transmisión</label>
          <select
            name="auction_status"
            defaultValue={post?.auction_status ?? ''}
            className={inputClass}
          >
            <option value="">— No aplica —</option>
            {(Object.entries(AUCTION_STATUS_LABELS) as [AuctionStatus, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1">Solo para Video o Remate. "En vivo" muestra el botón EN VIVO en la app.</p>
        </div>

        <div>
          <label className={labelClass}>Estado editorial</label>
          <select
            name="editorial_status"
            defaultValue={post?.editorial_status ?? 'draft'}
            className={inputClass}
          >
            {(Object.entries(STATUS_LABELS) as [EditorialStatus, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Organización</label>
          <select
            name="organization_id"
            defaultValue={post?.organization_id ?? ''}
            className={inputClass}
          >
            <option value="">— Sin organización —</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Imagen destacada</label>
          <input
            name="image_file"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-lime-dark"
          />
          <p className="text-xs text-muted mt-1">JPG, PNG o WebP. Máximo 8 MB.</p>
        </div>

        <div>
          <label className={labelClass}>URL de imagen alternativa</label>
          <input
            name="image_url"
            type="text"
            defaultValue={post?.image_url ?? ''}
            className={inputClass}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className={labelClass}>URL de YouTube</label>
          <input
            name="youtube_url"
            type="text"
            defaultValue={post?.youtube_url ?? ''}
            className={inputClass}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <label className="text-sm font-medium text-foreground">Departamentos destino</label>
          <span className="text-xs text-muted">Sin selección = nacional</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {(Object.entries(DEPARTMENT_LABELS) as [Department, string][]).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 rounded-lg border border-bdr bg-secondary px-3 py-2 text-xs text-muted cursor-pointer">
              <input
                type="checkbox"
                name="target_departments"
                value={value}
                defaultChecked={selectedDepartments.has(value)}
                className="w-3.5 h-3.5 rounded accent-lime"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="is_important"
            defaultChecked={post?.is_important ?? false}
            className="w-4 h-4 rounded accent-lime"
          />
          <span className="text-sm text-foreground">Marcar como importante</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="is_highlighted"
            defaultChecked={post?.is_highlighted ?? false}
            className="w-4 h-4 rounded accent-lime"
          />
          <span className="text-sm text-foreground">Destacar en home</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-bdr">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? 'Guardando...' : post ? 'Guardar cambios' : 'Crear publicación'}
        </button>
        <a href="/admin/publicaciones" className="btn text-sm">
          Cancelar
        </a>
      </div>
    </form>
  )
}
