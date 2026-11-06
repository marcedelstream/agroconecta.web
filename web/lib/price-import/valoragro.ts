// Precios de ganado de valoragro.com.py (pedido 2026-11-06). Se leen de sus tablas de mercados y se guardan en
// market_price_imports (supabase/fix-v2-price-imports.sql), una tabla aparte que todavía no se muestra en ningún lado.
// Funciones puras para testear el parseo sin red.

// La portada trae más que la sección Mercados: también el cordero y los precios Europa y Hilton.
export const VALOR_AGRO_URL = 'https://www.valoragro.com.py/'
export const VALOR_AGRO_SOURCE = 'valoragro'

export interface ImportedPrice {
  source: string
  /** Tabla de origen, ej. "Ganado a frigorífico". */
  market: string
  label: string
  currency: 'PYG' | 'USD'
  unit: string
  value: number
  previousValue: number | null
  minValue: number | null
  maxValue: number | null
  /** Fecha que informa la fuente (AAAA-MM-DD). */
  sourceDate: string | null
}

const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Valor Agro mezcla formatos: "5.40" y "5,45" son decimales en dólares; "18.520" son miles en guaraníes. Si tiene
 * grupos de tres dígitos es un número entero con separador de miles (y entonces es guaraní, aunque la tabla diga
 * dólares: el cordero figura "35.000" en una tabla rotulada en dólares).
 */
export function parseNumber(raw: string): { value: number; thousands: boolean } | null {
  const s = raw.trim()
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) return { value: Number(s.replace(/[.,]/g, '')), thousands: true }
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? { value: n, thousands: false } : null
}

/** "Última actualización: 03/11/2026" → "2026-11-03". */
export function parseSourceDate(text: string): string | null {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(text)
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null
}

export function parseValorAgro(html: string): ImportedPrice[] {
  const out: ImportedPrice[] = []
  for (const chunk of html.split('tabla-mercados').slice(1)) {
    const body = chunk.split('</article>')[0]
    const market = strip(/title-mercados">([\s\S]*?)<\/span>/.exec(body)?.[1] ?? '')
    const heads = [...body.matchAll(/est-mercados[^>]*>([^<]*)/g)].map((m) => normalize(m[1]))
    const labels = [...body.matchAll(/cat-mercados">([^<]*)/g)].map((m) => m[1].trim())
    const values = [...body.matchAll(/result-mercados[^>]*>([\s\S]*?)<\/span>/g)].map((m) => strip(m[1]))
    const note = strip(/msj_mercados">([\s\S]*?)<\/span>/.exec(body)?.[1] ?? '')
    if (!market || labels.length === 0) continue

    const cols = heads.length - 1
    const tableUsd = /d[oó]lar/i.test(note)
    labels.forEach((label, row) => {
      const cells = values.slice(row * cols, row * cols + cols).map(parseNumber)
      if (cells.length !== cols || cells.some((c) => !c)) return
      const col = (name: string) => cells[heads.slice(1).findIndex((h) => h.includes(name))] ?? null
      const current = col('actual') ?? col('promedio') ?? cells[cells.length - 1]
      if (!current) return
      const currency: 'PYG' | 'USD' = tableUsd && !current.thousands ? 'USD' : 'PYG'
      out.push({
        source: VALOR_AGRO_SOURCE,
        market,
        label,
        currency,
        unit: currency === 'USD' ? 'US$/kg' : '₲/kg',
        value: current.value,
        previousValue: col('anterior')?.value ?? null,
        minValue: col('min')?.value ?? null,
        maxValue: col('max')?.value ?? null,
        sourceDate: parseSourceDate(note),
      })
    })
  }
  return out
}

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
