import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { runSyndication } from '@/lib/syndication'

export const dynamic = 'force-dynamic'
// Con todas las fuentes puede pasar el minuto: se le da el máximo del plan.
export const maxDuration = 300

async function handle(request: NextRequest) {
  if (!isCronAuthorized(request)) {
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
