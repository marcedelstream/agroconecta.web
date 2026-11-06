import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { parseValorAgro, VALOR_AGRO_URL, type ImportedPrice } from './valoragro'

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' })

/**
 * Trae los precios de las fuentes externas y los guarda en market_price_imports (oculta). Una fila por precio y por
 * fecha de la fuente: si la fuente no cambió, la carga del día siguiente no duplica nada.
 */
export async function importPrices(options: { dryRun?: boolean } = {}) {
  const res = await fetch(VALOR_AGRO_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Agroconecta/1.0)' }, cache: 'no-store' })
  if (!res.ok) throw new Error(`Valor Agro respondió HTTP ${res.status}`)
  const prices: ImportedPrice[] = parseValorAgro(await res.text())
  if (prices.length === 0) throw new Error('No se encontraron precios en Valor Agro (¿cambió la página?)')

  if (!options.dryRun) {
    const rows = prices.map((p) => ({
      source: p.source,
      market: p.market,
      label: p.label,
      currency: p.currency,
      unit: p.unit,
      value: p.value,
      previous_value: p.previousValue,
      min_value: p.minValue,
      max_value: p.maxValue,
      source_date: p.sourceDate ?? today(),
      fetched_at: new Date().toISOString(),
    }))
    const { error } = await createSupabaseAdmin()
      .from('market_price_imports')
      .upsert(rows, { onConflict: 'source,market,label,source_date' })
    if (error) throw new Error(error.message)
  }

  return { dryRun: !!options.dryRun, count: prices.length, prices }
}
