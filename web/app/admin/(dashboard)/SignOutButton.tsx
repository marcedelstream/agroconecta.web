'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button onClick={handleSignOut} className="btn w-full text-xs">
      Cerrar sesión
    </button>
  )
}
