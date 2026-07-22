import { createSupabaseAdmin } from './supabase-admin'

type CurrencyCode = 'PYG' | 'USD'
type MarketPriceKind = 'cattle' | 'international'

interface ExtractedPrice {
  kind: MarketPriceKind
  label: string
  market: string
  currency: CurrencyCode
  unit: string
  value: number
  change: number
  change_percent: number
  updated_at: string
}

interface ImportResult {
  ok: boolean
  source: string
  imported: number
  deleted: number
  updatedAt: string | null
  prices: ExtractedPrice[]
}

const VALOR_AGRO_URL = 'https://www.valoragro.com.py/'
const FETCH_TIMEOUT_MS = 15000

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstMatch(value: string, pattern: RegExp) {
  return pattern.exec(value)?.[1]?.trim() ?? ''
}

function parseNumber(value: string, currency: CurrencyCode) {
  const clean = value.replace(/\s+/g, '').trim()
  if (!clean) return 0

  if (currency === 'PYG') {
    return Number(clean.replace(/\./g, '').replace(',', '.')) || 0
  }

  return Number(clean.replace(',', '.')) || 0
}

function parseDate(value: string) {
  const match = /(\d{2})\/(\d{2})\/(\d{4})/.exec(value)
  if (!match) return null

  const [, day, month, year] = match
  return `${year}-${month}-${day}T12:00:00-04:00`
}

function percentChange(current: number, previous: number) {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}

async function fetchHome() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(VALOR_AGRO_URL, {
      signal: controller.signal,
      headers: {
        accept: 'text/html,*/*;q=0.8',
        'user-agent': 'AgroconectaBot/1.0 (+https://agroconecta.com.py)',
      },
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`Valor Agro HTTP ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timeout)
  }
}

function marketBlocks(html: string) {
  return Array.from(html.matchAll(/<article\b[^>]*class=["'][^"']*tabla-mercados[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi))
    .map((match) => match[0])
}

function blockTitle(block: string) {
  return stripHtml(firstMatch(block, /<span class=["']title-mercados["']>([\s\S]*?)<\/span>/i))
}

function marketBlock(html: string, titlePattern: RegExp) {
  return marketBlocks(html).find((block) => titlePattern.test(blockTitle(block))) ?? ''
}

function extractRows(block: string) {
  const labels = Array.from(block.matchAll(/<span class="cat-mercados">([\s\S]*?)<\/span>/gi))
    .map((match) => stripHtml(match[1]))
  const values = Array.from(block.matchAll(/<span class="result-mercados">\s*([\s\S]*?)\s*<\/span>/gi))
    .map((match) => stripHtml(match[1]))

  return { labels, values }
}

function extractUpdateDate(block: string) {
  const note = stripHtml(firstMatch(block, /<span class="msj_mercados">([\s\S]*?)<\/span>/i))
  return parseDate(note)
}

function parseFrigorifico(block: string): ExtractedPrice[] {
  const updatedAt = extractUpdateDate(block)
  if (!updatedAt) return []

  const { labels, values } = extractRows(block)
  return labels.map((label, index): ExtractedPrice => {
    const previous = parseNumber(values[index * 2] ?? '', 'USD')
    const current = parseNumber(values[index * 2 + 1] ?? '', 'USD')

    return {
      kind: 'cattle',
      label,
      market: 'Valor Agro - Ganado a frigorifico',
      currency: 'USD',
      unit: 'USD/kg',
      value: current,
      change: current - previous,
      change_percent: percentChange(current, previous),
      updated_at: updatedAt,
    }
  }).filter((row) => row.value > 0)
}

function parseOvino(block: string): ExtractedPrice[] {
  const updatedAt = extractUpdateDate(block)
  if (!updatedAt) return []

  const { labels, values } = extractRows(block)
  return labels.map((label, index): ExtractedPrice => {
    const previous = parseNumber(values[index * 2] ?? '', 'PYG')
    const current = parseNumber(values[index * 2 + 1] ?? '', 'PYG')

    return {
      kind: 'cattle',
      label: `Ovino ${label}`,
      market: 'Valor Agro - Ovino a frigorifico',
      currency: 'PYG',
      unit: 'Gs/kg',
      value: current,
      change: current - previous,
      change_percent: percentChange(current, previous),
      updated_at: updatedAt,
    }
  }).filter((row) => row.value > 0)
}

function parseConsumo(block: string): ExtractedPrice[] {
  const updatedAt = extractUpdateDate(block)
  if (!updatedAt) return []

  const { labels, values } = extractRows(block)
  return labels.map((label, index): ExtractedPrice => {
    const max = parseNumber(values[index * 3] ?? '', 'PYG')
    const min = parseNumber(values[index * 3 + 1] ?? '', 'PYG')
    const average = parseNumber(values[index * 3 + 2] ?? '', 'PYG')

    return {
      kind: 'cattle',
      label,
      market: `Valor Agro - Ganado de consumo (max ${max.toLocaleString('es-PY')} / min ${min.toLocaleString('es-PY')})`,
      currency: 'PYG',
      unit: 'Gs/kg promedio',
      value: average,
      change: 0,
      change_percent: 0,
      updated_at: updatedAt,
    }
  }).filter((row) => row.value > 0)
}

export async function extractValorAgroPrices() {
  const html = await fetchHome()
  const frigorifico = marketBlock(html, /Ganado\s+a frigor/i)
  const ovino = marketBlock(html, /Ovino\s+a frigor/i)
  const consumo = marketBlock(html, /Ganado\s+de consumo/i)

  return [
    ...parseFrigorifico(frigorifico),
    ...parseOvino(ovino),
    ...parseConsumo(consumo),
  ]
}

export async function importValorAgroPrices(): Promise<ImportResult> {
  const prices = await extractValorAgroPrices()
  if (prices.length === 0) throw new Error('No se encontraron precios con fecha en Valor Agro.')

  const supabase = createSupabaseAdmin()
  const { count, error: countError } = await supabase
    .from('market_prices')
    .select('id', { count: 'exact', head: true })

  if (countError) throw new Error(countError.message)

  const { error: deleteError } = await supabase.from('market_prices').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) throw new Error(deleteError.message)

  const { error: insertError } = await supabase.from('market_prices').insert(prices)
  if (insertError) throw new Error(insertError.message)

  const sortedDates = prices.map((price) => price.updated_at).sort()
  return {
    ok: true,
    source: VALOR_AGRO_URL,
    imported: prices.length,
    deleted: count ?? 0,
    updatedAt: sortedDates.at(-1) ?? null,
    prices,
  }
}





