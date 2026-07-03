import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import { SignOutButton } from './SignOutButton'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/publicaciones', label: 'Publicaciones', icon: '✦' },
  { href: '/admin/organizaciones', label: 'Organizaciones', icon: '◈' },
  { href: '/admin/banners', label: 'Banners', icon: '◎' },
  { href: '/admin/eventos', label: 'Eventos', icon: '📅' },
  { href: '/admin/notificaciones', label: 'Notificaciones', icon: '◉' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-bg flex" data-theme="dark">
      <aside className="w-60 shrink-0 border-r border-bdr flex-col hidden md:flex">
        <div className="p-5 border-b border-bdr">
          <Image src="/logo.png" alt="Agroconecta" width={120} height={36} className="h-7 w-auto" />
          <span className="text-xs text-muted mt-1 block">Panel Agroconecta</span>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {ADMIN_NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-white hover:bg-secondary transition-colors"
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-bdr">
          <p className="text-xs text-muted truncate mb-2">{user?.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden border-b border-bdr px-4 py-3 flex items-center justify-between gap-3">
          <Image src="/logo.png" alt="Agroconecta" width={100} height={30} className="h-6 w-auto" />
          <div className="flex items-center gap-3 overflow-x-auto">
            {ADMIN_NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs text-muted hover:text-white whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  )
}
