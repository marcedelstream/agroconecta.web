import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { KaraiChatClient } from './ChatClient'
import { MembershipRequired } from './MembershipRequired'

export default async function KaraiPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/karai/login')

  const { data: profile } = await supabase.from('profiles').select('is_member').eq('id', user.id).maybeSingle()
  if (!profile?.is_member) return <MembershipRequired email={user.email ?? ''} />

  return <KaraiChatClient email={user.email ?? ''} />
}
