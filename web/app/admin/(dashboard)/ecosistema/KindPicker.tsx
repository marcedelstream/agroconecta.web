'use client'

import { ECOSYSTEM_KINDS, ECOSYSTEM_KIND_ORDER } from '@/lib/ecosystem-kinds'
import type { EcosystemListingKind } from '@/lib/types'

// Primer paso del alta: elegir qué es lo que se encontró. Según la respuesta cambia todo el formulario.
export function KindPicker({ onPick }: { onPick: (kind: EcosystemListingKind) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">¿Qué encontraste?</p>
      {ECOSYSTEM_KIND_ORDER.map((kind) => {
        const cfg = ECOSYSTEM_KINDS[kind]
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onPick(kind)}
            className="flex w-full items-center gap-4 rounded-2xl border border-bdr bg-surface px-4 py-4 text-left transition-colors hover:border-lime hover:bg-lime/5"
          >
            <span className="text-3xl" aria-hidden>{cfg.emoji}</span>
            <span>
              <span className="block font-display font-semibold text-foreground">{cfg.label}</span>
              <span className="block text-sm text-muted">{cfg.pitch}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
