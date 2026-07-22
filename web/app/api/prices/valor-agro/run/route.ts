import { NextRequest, NextResponse } from 'next/server'
import { importValorAgroPrices } from '@/lib/valor-agro-prices'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const configuredToken = process.env.PRICES_RUN_TOKEN || process.env.SYNDICATION_RUN_TOKEN

  if (!configuredToken) {
    return process.env.NODE_ENV !== 'production'
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const queryToken = request.nextUrl.searchParams.get('token')
  return bearer === configuredToken || queryToken === configuredToken
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const result = await importValorAgroPrices()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown_error' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
