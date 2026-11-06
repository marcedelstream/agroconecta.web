import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { importPrices } from '@/lib/price-import/run'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Carga diaria de precios externos (Valor Agro) a market_price_imports, que todavía no se muestra. ?dryRun=1 lee y
// devuelve los precios sin guardar.
async function handle(request: NextRequest) {
  if (!isCronAuthorized(request)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  try {
    const result = await importPrices({ dryRun: request.nextUrl.searchParams.get('dryRun') === '1' })
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'unknown_error' }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
