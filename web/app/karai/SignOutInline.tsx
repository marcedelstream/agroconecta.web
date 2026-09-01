'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

export function SignOutInline() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/karai/login')
    router.refresh()
  }

  return (
    <button onClick={handleSignOut} className="text-muted text-sm hover:text-foreground transition-colors">
      Cerrar sesión
    </button>
  )
}
