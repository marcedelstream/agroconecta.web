'use client'

import { useTransition } from 'react'
import { setKnowledgeSourceStatus, deleteKnowledgeSource } from './actions'
import type { KaraiSourceStatus } from '@/lib/karai/knowledge-types'

export function SourceRowActions({ id, status }: { id: string; status: KaraiSourceStatus }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status !== 'aprobado' && (
        <button disabled={isPending} onClick={() => startTransition(() => setKnowledgeSourceStatus(id, 'aprobado'))} className="btn text-xs">
          Aprobar
        </button>
      )}
      {status === 'aprobado' && (
        <button disabled={isPending} onClick={() => startTransition(() => setKnowledgeSourceStatus(id, 'vencido'))} className="btn text-xs">
          Marcar vencida
        </button>
      )}
      {status !== 'retirado' && (
        <button disabled={isPending} onClick={() => startTransition(() => setKnowledgeSourceStatus(id, 'retirado'))} className="btn text-xs">
          Retirar
        </button>
      )}
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
