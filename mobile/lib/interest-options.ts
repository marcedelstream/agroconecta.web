import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'
import { GOAL_OPTIONS, PRODUCTION_BY_RUBRO, RUBRO_OPTIONS, SCALE_OPTIONS, type Option } from './onboarding-v2'

// Intereses que maneja el panel (/admin/intereses → tabla interest_options). Se leen al abrir la app y se
// guardan en el teléfono; si no hay red o la tabla no existe, se usa la lista que trae la app (la misma
// con la que arrancó la tabla), así el onboarding nunca queda vacío.

export interface InterestCatalog {
  rubros: Option[]
  productionByRubro: Record<string, Option[]>
  goals: Option[]
  scale: Option[]
}

export const BUILT_IN_CATALOG: InterestCatalog = {
  rubros: RUBRO_OPTIONS,
  productionByRubro: PRODUCTION_BY_RUBRO,
  goals: GOAL_OPTIONS,
  scale: SCALE_OPTIONS,
}

const CACHE_KEY = '@agroconecta:interest-options'

interface Row {
  kind: 'rubro' | 'produccion' | 'objetivo' | 'escala'
  value: string
  label: string
  parent: string | null
}

function toCatalog(rows: Row[]): InterestCatalog | null {
  const pick = (kind: Row['kind']) => rows.filter((r) => r.kind === kind).map((r) => ({ value: r.value, label: r.label }))
  const rubros = pick('rubro')
  if (rubros.length === 0) return null
  const productionByRubro: Record<string, Option[]> = {}
  for (const r of rows) {
    if (r.kind !== 'produccion' || !r.parent) continue
    ;(productionByRubro[r.parent] ??= []).push({ value: r.value, label: r.label })
  }
  return { rubros, productionByRubro, goals: pick('objetivo'), scale: pick('escala') }
}

async function fetchCatalog(): Promise<InterestCatalog | null> {
  const { data, error } = await supabase.from('interest_options').select('kind,value,label,parent').order('position').order('label')
  if (error || !data) return null
  return toCatalog(data as Row[])
}

// Una sola carga por sesión de la app, compartida por todas las pantallas que la usan.
let memory: InterestCatalog | null = null
let pending: Promise<InterestCatalog | null> | null = null

export function useInterestCatalog(): InterestCatalog {
  const [catalog, setCatalog] = useState<InterestCatalog>(memory ?? BUILT_IN_CATALOG)

  useEffect(() => {
    if (memory) return
    let alive = true
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (alive && raw && !memory) setCatalog(JSON.parse(raw) as InterestCatalog)
      })
      .catch(() => null)
    pending ??= fetchCatalog().catch(() => null)
    pending.then((fresh) => {
      if (!fresh) return
      memory = fresh
      if (alive) setCatalog(fresh)
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh)).catch(() => null)
    })
    return () => {
      alive = false
    }
  }, [])

  return catalog
}
