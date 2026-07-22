import { NextRequest, NextResponse } from 'next/server'
import { runSyndication } from '@/lib/syndication'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const configuredToken = process.env.SYNDICATION_RUN_TOKEN

  if (!configuredToken) {
    return process.env.NODE_ENV !== 'production'
  }

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const queryToken = request.nextUrl.searchParams.get('token')
  return bearer === configuredToken || queryToken === configuredToken
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    )
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'

  try {
    const result = await runSyndication({ dryRun })
    return NextResponse.json({ ok: true, ...result })
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
