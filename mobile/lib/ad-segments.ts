import { Colors } from '@/constants/colors'
import type { AdSegment, MockAd } from './types'

// When integrating live ad campaigns from Supabase, keep this function as the
// final fallback for local/demo banners.
const INTERIOR_DEPARTMENTS = new Set<AdSegment['department']>([
  'san-pedro',
  'caaguazu',
  'canindeyu',
  'paraguari',
  'cordillera',
  'guaira',
  'caazapa',
  'misiones',
  'neembucu',
  'concepcion',
  'presidente-hayes',
  'boqueron',
  'alto-paraguay',
])

const ADS: Record<string, MockAd> = {
  'livestock-credit': {
    id: 'livestock-credit',
    headline: 'Financia tu rodeo',
    subline: 'Credito ganadero con tasa preferencial',
    ctaLabel: 'Ver oferta',
    iconName: 'cash-outline',
    accentColor: Colors.category.ganaderia,
    imageUrl: 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/ganaderia-creditos.png',
    targetProfessions: ['productor'],
    targetCategories: ['ganaderia'],
  },
  'agrochem-seed': {
    id: 'agrochem-seed',
    headline: 'Semillas y agroquimicos',
    subline: 'Ofertas para la temporada de siembra 2026',
    ctaLabel: 'Ver catalogo',
    iconName: 'leaf-outline',
    accentColor: Colors.category.agricultura,
    imageUrl: 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/semillas-zafra.png',
    targetProfessions: ['productor', 'agronomo'],
    targetCategories: ['agricultura'],
  },
  'animal-health': {
    id: 'animal-health',
    headline: 'Salud animal primero',
    subline: 'Vacunas y antiparasitarios al mejor precio',
    ctaLabel: 'Consultar',
    iconName: 'medkit-outline',
    accentColor: Colors.category.ganaderia,
    imageUrl: 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/sanidad-animal.png',
    targetProfessions: ['veterinario', 'productor'],
    targetCategories: ['ganaderia'],
  },
  'precision-ag': {
    id: 'precision-ag',
    headline: 'Agricultura de precisión',
    subline: 'Tecnología para rendir más con menos insumos',
    ctaLabel: 'Conocer más',
    iconName: 'hardware-chip-outline',
    accentColor: Colors.category.tecnologia,
    imageUrl: 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/precision-agro.png',
    targetProfessions: ['agronomo', 'productor'],
    targetCategories: ['tecnologia', 'agricultura'],
  },
  'trading-platform': {
    id: 'trading-platform',
    headline: 'Compra y vende granos',
    subline: 'La plataforma de trading agropecuario del Paraguay',
    ctaLabel: 'Acceder',
    iconName: 'trending-up-outline',
    accentColor: Colors.category.mercados,
    imageUrl: 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/mercados-granos.png',
    targetProfessions: ['comerciante', 'productor'],
    targetCategories: ['mercados', 'agricultura'],
  },
  'regional-coop': {
    id: 'regional-coop',
    headline: 'Tu cooperativa regional',
    subline: 'Servicios financieros y agroinsumos para el interior',
    ctaLabel: 'Ver servicios',
    iconName: 'people-outline',
    accentColor: Colors.lime,
    imageUrl: 'https://ukodavvtmrrqnfgyvqql.supabase.co/storage/v1/object/public/banners/demo/cooperativa-regional.png',
    targetDepartments: [...INTERIOR_DEPARTMENTS],
  },
}

export function selectAd(segment: AdSegment): MockAd {
  const candidates = Object.values(ADS).filter((ad) => {
    const professionMatch = !ad.targetProfessions?.length || ad.targetProfessions.includes(segment.profession)
    const departmentMatch = !ad.targetDepartments?.length || ad.targetDepartments.includes(segment.department)
    const categoryMatch = !ad.targetCategories?.length || ad.targetCategories.some((cat) => segment.categories.includes(cat))
    return professionMatch && departmentMatch && categoryMatch
  })

  const pool = candidates.length > 0 ? candidates : Object.values(ADS)
  const rotationSlot = Math.floor(Date.now() / 30000) % pool.length
  return pool[rotationSlot]
}
