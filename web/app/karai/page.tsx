import { createSupabaseServer } from '@/lib/supabase-server'
import { KaraiChatClient } from './ChatClient'
import { KaraiLanding } from './_landing/KaraiLanding'

export default async function KaraiPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <KaraiLanding />

  return <KaraiChatClient email={user.email ?? ''} />
}
