'use client'

import { useActionState, useState } from 'react'
import { saveFarmProfile, type FarmProfileActionState } from './actions'
import type { ExtractedFarmData } from '@/lib/karai/farm-extraction'

type Animal = { tipo: string; cantidad: number }
type Cultivo = { tipo: string; superficie_ha: number }

export function FarmProfileForm({ initialData }: { initialData: ExtractedFarmData }) {
  const [state, formAction, isPending] = useActionState<FarmProfileActionState, FormData>(saveFarmProfile, { error: null })

  const [ubicacion, setUbicacion] = useState(initialData.ubicacion ?? '')
  const [hectareas, setHectareas] = useState(initialData.hectareas?.toString() ?? '')
  const [animales, setAnimales] = useState<Animal[]>(initialData.animales ?? [])
  const [cultivos, setCultivos] = useState<Cultivo[]>(initialData.cultivos ?? [])

  function buildPayload() {
    const data: ExtractedFarmData = {}
    if (ubicacion.trim()) data.ubicacion = ubicacion.trim()
    if (hectareas.trim() && !Number.isNaN(Number(hectareas))) data.hectareas = Number(hectareas)
    const cleanAnimales = animales.filter((a) => a.tipo.trim() && a.cantidad > 0)
    if (cleanAnimales.length) data.animales = cleanAnimales
    const cleanCultivos = cultivos.filter((c) => c.tipo.trim() && c.superficie_ha > 0)
    if (cleanCultivos.length) data.cultivos = cleanCultivos
    return JSON.stringify(data)
  }

  return (
    <form action={formAction} className="card flex flex-col gap-5">
      <input type="hidden" name="data" value={buildPayload()} />

      {state.error && (
        <div className="rounded-xl bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">{state.error}</div>
      )}
      {state.ok && (
        <div className="rounded-xl bg-success/10 border border-success/30 px-4 py-3 text-sm text-success">Guardado.</div>
      )}

      <div>
        <label className="block text-sm text-muted mb-1.5">Ubicación</label>
        <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ej: Chaco, Boquerón" className="input" />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1.5">Hectáreas</label>
        <input
          value={hectareas}
          onChange={(e) => setHectareas(e.target.value)}
          type="number"
          min="0"
          placeholder="Ej: 150"
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-2">Animales</label>
        <div className="flex flex-col gap-2">
          {animales.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={a.tipo}
                onChange={(e) => setAnimales((prev) => prev.map((x, idx) => (idx === i ? { ...x, tipo: e.target.value } : x)))}
                placeholder="Tipo (ej: novillos)"
                className="input flex-1"
              />
              <input
                value={a.cantidad || ''}
                onChange={(e) =>
                  setAnimales((prev) => prev.map((x, idx) => (idx === i ? { ...x, cantidad: Number(e.target.value) } : x)))
                }
                type="number"
                min="0"
                placeholder="Cantidad"
                className="input w-28"
              />
              <button type="button" onClick={() => setAnimales((prev) => prev.filter((_, idx) => idx !== i))} className="btn text-xs">
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setAnimales((prev) => [...prev, { tipo: '', cantidad: 0 }])}
            className="btn text-xs self-start"
          >
            + Agregar animal
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-2">Cultivos</label>
        <div className="flex flex-col gap-2">
          {cultivos.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={c.tipo}
                onChange={(e) => setCultivos((prev) => prev.map((x, idx) => (idx === i ? { ...x, tipo: e.target.value } : x)))}
                placeholder="Cultivo (ej: soja)"
                className="input flex-1"
              />
              <input
                value={c.superficie_ha || ''}
                onChange={(e) =>
                  setCultivos((prev) => prev.map((x, idx) => (idx === i ? { ...x, superficie_ha: Number(e.target.value) } : x)))
                }
                type="number"
                min="0"
                placeholder="Hectáreas"
                className="input w-28"
              />
              <button type="button" onClick={() => setCultivos((prev) => prev.filter((_, idx) => idx !== i))} className="btn text-xs">
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCultivos((prev) => [...prev, { tipo: '', superficie_ha: 0 }])}
            className="btn text-xs self-start"
          >
            + Agregar cultivo
          </button>
        </div>
      </div>

      <button type="submit" disabled={isPending} className="btn-primary self-start">
        {isPending ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
