'use client'

import { useTransition } from 'react'
import { updateLeadStatus } from '../actions'

const OPTIONS: { value: 'new' | 'contacted' | 'closed'; label: string }[] = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'closed', label: 'Cerrado' },
]

export function LeadStatusForm({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          disabled={isPending || status === opt.value}
          onClick={() => startTransition(() => updateLeadStatus(id, opt.value))}
          className={`btn text-xs ${status === opt.value ? 'bg-lime/15 text-lime border-lime/30' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
