'use client'

import { useEffect, useState } from 'react'

interface VisitCounterProps {
  path: string
  label?: string
  className?: string
}

function formatViews(value: number) {
  return new Intl.NumberFormat('es-PY').format(value)
}

export function VisitCounter({ path, label = 'Visitas', className = '' }: VisitCounterProps) {
  const [views, setViews] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function registerView() {
      try {
        const response = await fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
          cache: 'no-store',
        })
        const data = await response.json()

        if (!cancelled && typeof data.views === 'number') {
          setViews(data.views)
        }
      } catch {
        if (!cancelled) setViews(null)
      }
    }

    registerView()

    return () => {
      cancelled = true
    }
  }, [path])

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-bdr bg-secondary/45 px-3 py-1.5 text-xs text-muted ${className}`}
      aria-live="polite"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-lime/70" />
      <span>{label}</span>
      <span className="font-semibold text-foreground">{views === null ? '-' : formatViews(views)}</span>
    </div>
  )
}
