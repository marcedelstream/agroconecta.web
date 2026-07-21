import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { MarketPriceRow } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Precios agropecuarios',
  description: 'Referencias de precios ganaderos y commodities internacionales para el sector agropecuario paraguayo.',
  alternates: { canonical: '/precios' },
}

function formatPrice(row: MarketPriceRow) {
  if (row.currency === 'PYG') return `Gs. ${Number(row.value).toLocaleString('es-PY')}`
  return `US$ ${Number(row.value).toLocaleString('es-PY', { maximumFractionDigits: 2 })}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

async function loadPrices() {
  try {
    const supabase = await createSupabaseServer()
    const { data, error } = await supabase
      .from('market_prices')
      .select('id,kind,label,market,currency,unit,value,change,change_percent,updated_at')
      .order('kind', { ascending: true })
      .order('updated_at', { ascending: false })

    if (error) return []
    return (data ?? []) as MarketPriceRow[]
  } catch (error) {
    console.error('Prices failed', error)
    return []
  }
}

function PriceGroup({ title, rows }: { title: string; rows: MarketPriceRow[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display font-semibold text-xl text-foreground">{title}</h2>
        <span className="text-muted text-xs">{rows.length} referencias</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rows.map((row) => {
          const positive = Number(row.change_percent) >= 0
          return (
            <article key={row.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display font-semibold text-lg text-foreground">{row.label}</p>
                  <p className="text-muted text-xs mt-1">{row.market} Â· {row.unit}</p>
                </div>
                <span className={`badge text-[11px] ${positive ? 'bg-lime/15 text-lime' : 'bg-red-500/10 text-red-500'}`}>
                  {positive ? '+' : ''}{Number(row.change_percent).toFixed(2)}%
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <p className="font-display font-bold text-2xl text-foreground">{formatPrice(row)}</p>
                <p className="text-muted text-xs">Act. {formatDate(row.updated_at)}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default async function PreciosPage() {
  const prices = await loadPrices()
  const cattle = prices.filter((row) => row.kind === 'cattle')
  const international = prices.filter((row) => row.kind === 'international')

  return (
    <>
      <Header />

      <main className="site-container py-8 md:py-10">
        <section className="mb-8 max-w-3xl">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.2em] mb-3">Precios</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-tight">
            Referencias de mercado para decidir mejor
          </h1>
          <p className="text-muted text-base mt-3 leading-relaxed">
            Un resumen web de las referencias que la app organiza para productores y profesionales: ganaderÃ­a local en guaranÃ­es y commodities internacionales en dÃ³lares.
          </p>
        </section>

        <section className="mb-8 rounded-2xl border border-lime/25 bg-lime/10 p-5">
          <p className="text-lime text-xs font-semibold uppercase tracking-[0.18em] mb-2">Más detalle en la app</p>
          <h2 className="font-display font-semibold text-xl text-foreground">Descargá Agroconecta para seguir precios y alertas</h2>
          <p className="text-muted text-sm leading-relaxed mt-2 max-w-2xl">
            La app organiza estas referencias junto con notificaciones, noticias de mercado y contenido personalizado para tu perfil.
          </p>
        </section>

        {prices.length === 0 ? (
          <div className="card text-center py-12 text-muted">No hay precios publicados por ahora.</div>
        ) : (
          <div className="space-y-8">
            {cattle.length > 0 && <PriceGroup title="GanaderÃ­a" rows={cattle} />}
            {international.length > 0 && <PriceGroup title="Commodities internacionales" rows={international} />}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}

