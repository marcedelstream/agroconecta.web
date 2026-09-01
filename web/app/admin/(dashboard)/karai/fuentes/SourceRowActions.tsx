'use client'

import { useTransition } from 'react'
import { toggleKnowledgeSource, deleteKnowledgeSource } from './actions'

export function SourceRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleKnowledgeSource(id, !isActive))}
        className="btn text-xs"
      >
        {isActive ? 'Desactivar' : 'Activar'}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm('¿Eliminar esta fuente?')) startTransition(() => deleteKnowledgeSource(id))
        }}
        className="btn text-xs border-danger/30 text-danger"
      >
        Eliminar
      </button>
    </div>
  )
}
