import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { DAILY_TEXT_LIMIT, getUsageToday } from '@/lib/karai/quota'

export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const used = await getUsageToday(auth.admin, auth.profileId)
  return NextResponse.json({ used, limit: DAILY_TEXT_LIMIT })
}
