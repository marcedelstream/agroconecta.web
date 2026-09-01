import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { KaraiChatClient } from './ChatClient'

export default async function KaraiPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/karai/login')

  return <KaraiChatClient email={user.email ?? ''} />
}
