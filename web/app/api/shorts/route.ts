import { NextResponse } from 'next/server'
import { loadLatestShorts } from '@/lib/youtube'

// Expone los Shorts de Agroconecta como JSON — reusado por la app mobile (galería de
// Videos) además del home de la web, así la YOUTUBE_API_KEY sigue viviendo solo acá del
// lado servidor en vez de tener que duplicarla como env var pública en el cliente mobile.
export async function GET() {
  const shorts = await loadLatestShorts(8)
  return NextResponse.json(
    { shorts },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
  )
}
