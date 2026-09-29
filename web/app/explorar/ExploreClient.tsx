'use client'

import { useEffect, useMemo, useState } from 'react'
import { ResultCard } from '@/components/site/ResultCard'
import { filterCandidates } from '@/lib/feed/explore'
import { RUBRO_LABEL, TYPE_TABS } from '@/lib/feed/labels'
import { sortByStart } from '@/lib/feed/ranking'
import type { FeedCandidate, FeedContentType } from '@/lib/feed/types'

interface Props {
  catalog: FeedCandidate[]
  initialQuery: string
  initialType: FeedContentType | null
}

const PAGE = 24

// Igual que Explorar de la app: el catálogo llega una vez y búsqueda, tipo y rubro filtran al
// instante en el navegador. La URL se actualiza para poder compartir la búsqueda.
export function ExploreClient({ catalog, initialQuery, initialType }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState<FeedContentType | null>(initialType)
  const [rubro, setRubro] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE)

  const results = useMemo(() => {
    const matches = filterCandidates(catalog, { query, type, rubro })
    return type === 'evento' || type === 'remate' ? sortByStart(matches) : matches
  }, [catalog, query, type, rubro])

  const counts = useMemo(() => {
    const base = filterCandidates(catalog, { query, type: null, rubro })
    const map = new Map<FeedContentType, number>()
    for (const c of base) map.set(c.contentType, (map.get(c.contentType) ?? 0) + 1)
    return map
  }, [catalog, query, rubro])

  useEffect(() => {
    setLimit(PAGE)
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (type) params.set('tipo', type)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `/explorar?${qs}` : '/explorar')
  }, [query, type, rubro])

  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'bg-navy text-white' : 'bg-surface text-foreground border border-bdr hover:bg-secondary'}`

  return (
    <div className="space-y-5">
      <label className="flex items-center gap-3 rounded-full bg-surface border border-bdr px-5 h-14 shadow-sm focus-within:border-lime">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá cursos, eventos, remates, empleos…"
          className="flex-1 bg-transparent outline-none text-[17px] text-foreground placeholder:text-muted"
          aria-label="Buscar"
          autoFocus={!initialQuery && !initialType}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="text-sm font-semibold text-muted hover:text-foreground">
            Borrar
          </button>
        )}
      </label>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="tablist" aria-label="Tipo de contenido">
        <button type="button" role="tab" aria-selected={!type} onClick={() => setType(null)} className={chip(!type)}>
          Todo
        </button>
        {TYPE_TABS.filter((t) => counts.get(t.value) || t.value === type).map((t) => (
          <button key={t.value} type="button" role="tab" aria-selected={type === t.value} onClick={() => setType(t.value)} className={chip(type === t.value)}>
            {t.label} <span className="opacity-60 font-medium">{counts.get(t.value) ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap" aria-label="Rubro">
        {Object.entries(RUBRO_LABEL).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRubro((r) => (r === value ? null : value))}
            aria-pressed={rubro === value}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${rubro === value ? 'bg-brand-tint border-lime text-lime-dark' : 'border-bdr text-muted hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="card text-center py-12">
          <p className="font-display font-bold text-lg text-foreground">No encontramos nada con esa búsqueda</p>
          <p className="text-muted mt-1">Probá con otra palabra, o preguntale a Karai.</p>
          <a href="/karai" className="btn-primary mt-4 inline-flex">Preguntale a Karai</a>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.slice(0, limit).map((c) => (
              <ResultCard key={c.key} item={c} />
            ))}
          </div>
          {results.length > limit && (
            <div className="text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn px-6">
                Ver más
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
