'use client'

import { useActionState, useState } from 'react'
import { createKnowledgeSource, type KnowledgeActionState } from './actions'

export function KnowledgeSourceForm() {
  const [state, formAction, isPending] = useActionState<KnowledgeActionState, FormData>(createKnowledgeSource, { error: null })
  const [kind, setKind] = useState<'link' | 'document'>('link')

  return (
    <form action={formAction} className="card flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{state.error}</div>
      )}

      <div>
        <label className="block text-sm text-muted mb-1.5">Tipo</label>
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value as 'link' | 'document')} className="input">
          <option value="link">Link (URL de referencia)</option>
          <option value="document">Documento (texto pegado)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1.5">Título</label>
        <input name="title" required placeholder="Ej: Guía de manejo de pasturas del Chaco" className="input" />
      </div>

      {kind === 'link' && (
        <div>
          <label className="block text-sm text-muted mb-1.5">URL</label>
          <input name="url" type="url" placeholder="https://..." className="input" />
        </div>
      )}

      <div>
        <label className="block text-sm text-muted mb-1.5">
          {kind === 'link' ? 'Descripción (qué dice esa fuente, para que Karai la use bien)' : 'Contenido del documento'}
        </label>
        <textarea
          name="content"
          rows={kind === 'link' ? 3 : 8}
          placeholder={kind === 'link' ? 'Resumen breve de qué contiene el link...' : 'Pegá el texto del documento acá...'}
          className="input resize-none"
        />
        <p className="text-xs text-muted mt-1">Se usa recortado a 800 caracteres por fuente, para no disparar el costo por consulta.</p>
      </div>

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? 'Guardando...' : 'Agregar fuente'}
      </button>
    </form>
  )
}
