'use client'

import { useActionState, useState } from 'react'
import { createKnowledgeSource, type KnowledgeActionState } from './actions'

export function KnowledgeSourceForm() {
  const [state, formAction, isPending] = useActionState<KnowledgeActionState, FormData>(createKnowledgeSource, { error: null })
  const [kind, setKind] = useState<'link' | 'document'>('link')
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <form action={formAction} encType="multipart/form-data" className="card flex flex-col gap-4">
      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{state.error}</div>
      )}

      <div>
        <label className="block text-sm text-muted mb-1.5">Tipo</label>
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value as 'link' | 'document')} className="input">
          <option value="link">Link (URL de referencia)</option>
          <option value="document">Documento (texto pegado o .docx)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1.5">Título</label>
        <input name="title" required placeholder="Ej: Guía de manejo de pasturas del Chaco" className="input" />
        <p className="text-xs text-muted mt-1">Karai cita este título al final de su respuesta cuando usa esta fuente.</p>
      </div>

      {kind === 'link' && (
        <div>
          <label className="block text-sm text-muted mb-1.5">URL</label>
          <input name="url" type="url" placeholder="https://..." className="input" />
        </div>
      )}

      {kind === 'document' && (
        <div>
          <label className="block text-sm text-muted mb-1.5">Subir documento (.docx)</label>
          <input
            name="docx_file"
            type="file"
            accept=".docx"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lime file:px-3 file:py-2 file:text-sm file:font-medium file:text-bg hover:file:bg-lime-dark"
          />
          {fileName && <p className="text-xs text-lime mt-1">{fileName}</p>}
          <p className="text-xs text-muted mt-1">Si subís un archivo, se usa ese texto y se ignora lo que escribas abajo.</p>
        </div>
      )}

      <div>
        <label className="block text-sm text-muted mb-1.5">
          {kind === 'link' ? 'Descripción (qué dice esa fuente, para que Karai la use bien)' : 'O pegá el texto acá directamente'}
        </label>
        <textarea
          name="content"
          rows={kind === 'link' ? 3 : 8}
          placeholder={kind === 'link' ? 'Resumen breve de qué contiene el link...' : 'Pegá el texto del documento acá...'}
          className="input resize-none"
        />
        <p className="text-xs text-muted mt-1">Se usa recortado a 2000 caracteres por fuente, para no disparar el costo por consulta.</p>
      </div>

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? 'Guardando...' : 'Agregar fuente'}
      </button>
    </form>
  )
}
