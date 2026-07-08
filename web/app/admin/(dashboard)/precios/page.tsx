import { createSupabaseServer } from '@/lib/supabase-server'
import { createMarketPrice, deleteMarketPrice, updateMarketPrice } from './actions'
import { ConfirmSubmitButton } from '../ConfirmSubmitButton'

interface MarketPriceRow {
  id: string
  kind: 'cattle' | 'international'
  label: string
  market: string
  currency: 'PYG' | 'USD'
  unit: string
  value: number
  change: number
  change_percent: number
  updated_at: string
}

async function loadPrices() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('market_prices')
    .select('id,kind,label,market,currency,unit,value,change,change_percent,updated_at')
    .order('kind', { ascending: true })
    .order('label', { ascending: true })

  return {
    prices: (data ?? []) as MarketPriceRow[],
    error: error?.message ?? null,
  }
}

export default async function PreciosPage() {
  const { prices, error } = await loadPrices()
  const cattle = prices.filter((p) => p.kind === 'cattle')
  const international = prices.filter((p) => p.kind === 'international')

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-white">Precios</h1>
        <p className="text-muted text-sm mt-0.5">
          Precios ganaderos (PYG) y de commodities internacionales (USD) que se ven en la app y la web pública.
        </p>
      </div>

      {error && (
        <div className="card mb-6 border-danger/40 text-danger text-sm">
          No se pudo leer `market_prices`: {error}
        </div>
      )}

      <form action={createMarketPrice} className="card space-y-3 mb-6">
        <h2 className="font-display font-semibold text-base text-foreground">Nuevo precio</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select name="kind" required className="input" defaultValue="cattle">
            <option value="cattle">Ganadero</option>
            <option value="international">Internacional</option>
          </select>
          <input name="label" required className="input" placeholder="Ej: Novillo Gordo" />
          <input name="market" required className="input" placeholder="Ej: Mercado de Asunción" />
          <input name="unit" required className="input" placeholder="Ej: kg / bushel" />
          <select name="currency" required className="input" defaultValue="PYG">
            <option value="PYG">₲ PYG</option>
            <option value="USD">$ USD</option>
          </select>
          <input name="value" type="number" step="0.01" required className="input" placeholder="Valor" />
          <input name="change" type="number" step="0.01" className="input" placeholder="Cambio (opcional)" />
          <input name="change_percent" type="number" step="0.001" className="input" placeholder="Cambio % (opcional)" />
        </div>
        <button type="submit" className="btn-primary text-sm">Agregar precio</button>
      </form>

      <PriceTable title="Ganaderos (₲)" rows={cattle} />
      <div className="h-6" />
      <PriceTable title="Commodities internacionales ($)" rows={international} />
    </div>
  )
}

function PriceTable({ title, rows }: { title: string; rows: MarketPriceRow[] }) {
  return (
    <div className="card p-0 overflow-hidden">
      <h2 className="font-display font-semibold text-base text-foreground px-4 pt-4 pb-2">{title}</h2>
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Mercado</th>
              <th>Valor</th>
              <th>Cambio</th>
              <th>Cambio %</th>
              <th>Actualizado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted">
                  No hay precios cargados en esta categoría.
                </td>
              </tr>
            )}
            {rows.map((price) => (
              <tr key={price.id}>
                <td>
                  <p className="font-medium">{price.label}</p>
                  <p className="text-xs text-muted">{price.unit}</p>
                </td>
                <td className="text-xs text-muted">{price.market}</td>
                <td colSpan={3} className="p-0">
                  <form action={updateMarketPrice} className="flex items-center gap-2 py-2">
                    <input type="hidden" name="id" value={price.id} />
                    <input
                      name="value"
                      type="number"
                      step="0.01"
                      required
                      defaultValue={price.value}
                      className="input w-24 text-sm"
                    />
                    <input
                      name="change"
                      type="number"
                      step="0.01"
                      defaultValue={price.change}
                      className="input w-20 text-sm"
                    />
                    <input
                      name="change_percent"
                      type="number"
                      step="0.001"
                      defaultValue={price.change_percent}
                      className="input w-20 text-sm"
                    />
                    <button type="submit" className="btn text-xs whitespace-nowrap">Guardar</button>
                  </form>
                </td>
                <td className="text-xs text-muted whitespace-nowrap">
                  {new Date(price.updated_at).toLocaleString('es-PY')}
                </td>
                <td>
                  <ConfirmSubmitButton
                    action={deleteMarketPrice}
                    fields={{ id: price.id }}
                    confirmMessage="¿Eliminar este precio?"
                    className="btn text-xs text-danger border-danger/40 hover:bg-danger/10"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
