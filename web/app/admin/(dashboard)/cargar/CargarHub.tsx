'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { LOAD_OPTIONS } from './options'

// "¿Qué encontraste?": se toca una categoría y se despliega qué tener a mano y por dónde seguir.
export function CargarHub() {
  const [selected, setSelected] = useState<string | null>(null)
  const option = LOAD_OPTIONS.find((o) => o.id === selected)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LOAD_OPTIONS.map((o) => {
          const active = o.id === selected
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(active ? null : o.id)}
              aria-expanded={active}
              className={`flex flex-col items-start gap-1 rounded-2xl border px-4 py-4 text-left transition-colors ${
                active ? 'border-lime bg-lime/10' : 'border-bdr bg-surface hover:border-lime/60'
              }`}
            >
              <span className="text-3xl" aria-hidden>{o.emoji}</span>
              <span className="font-display font-semibold text-foreground">{o.label}</span>
              <span className="text-xs text-muted leading-snug">{o.pitch}</span>
            </button>
          )
        })}
      </div>

      {option && (
        <div className="card space-y-4 border-lime/50">
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground">
              <span aria-hidden>{option.emoji}</span> {option.label}
            </h2>
            {option.note && <p className="text-sm text-muted mt-1">{option.note}</p>}
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Tené a mano:</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {option.checklist.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-foreground">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-lime" aria-hidden /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {option.actions.map((a, i) => (
              <Link key={a.href} href={a.href} className={`${i === 0 ? 'btn-primary' : 'btn'} text-sm gap-2`}>
                {a.label} <ArrowRight size={15} aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
