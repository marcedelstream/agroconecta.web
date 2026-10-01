import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { AdminMobileNav, AdminSidebarNav } from '@/components/admin/AdminNav'
import { SignOutButton } from './SignOutButton'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

// Panel admin (rediseño 2026-09): tema claro fijo y Figtree (app/admin/layout.tsx), menú por tareas
// (components/admin/nav-config.ts).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  // Publicaciones que mandaron las organizaciones desde la app y esperan aprobación.
  const { count: pending } = await createSupabaseAdmin()
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('editorial_status', 'pending_review')
  const badges = { '/admin/publicaciones': pending ?? 0 }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-bdr bg-surface flex-col hidden md:flex sticky top-0 h-screen">
        <Link href="/admin" className="px-5 py-5 border-b border-bdr block">
          <Image src="/logo-light.png" alt="Agroconecta" width={140} height={32} className="h-7 w-auto" />
          <span className="text-xs text-muted mt-1.5 block">Panel de administración</span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <AdminSidebarNav badges={badges} />
        </div>
        <div className="p-4 border-t border-bdr">
          <p className="text-xs text-muted truncate mb-2">{user?.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-bdr px-3 py-2 flex items-center justify-between gap-3">
          <AdminMobileNav badges={badges} />
          <Image src="/logo-light.png" alt="Agroconecta" width={110} height={26} className="h-6 w-auto" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
