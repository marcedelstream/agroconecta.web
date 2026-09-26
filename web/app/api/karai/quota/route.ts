import { NextResponse } from 'next/server'
import { authenticateKaraiRequest } from '@/lib/karai/auth'
import { dailyLimitFor, getUsageToday, isActiveMember } from '@/lib/karai/quota'

export async function GET(request: Request) {
  const auth = await authenticateKaraiRequest(request)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [used, member] = await Promise.all([getUsageToday(auth.admin, auth.profileId), isActiveMember(auth.admin, auth.profileId)])
  return NextResponse.json({ used, limit: dailyLimitFor(member), plan: member ? 'member' : 'free' })
}
