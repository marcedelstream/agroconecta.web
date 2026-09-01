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

const ADMIN_NAV_GROUPS = [
  {
    label: null,
    items: [{ href: '/admin', label: 'Dashboard', icon: '▦' }],
  },
  {
    label: 'Contenido',
    items: [
      { href: '/admin/publicaciones', label: 'Publicaciones', icon: '✦' },
      { href: '/admin/eventos', label: 'Eventos', icon: '▥' },
      { href: '/admin/biblioteca', label: 'Biblioteca', icon: '▤' },
      { href: '/admin/precios', label: 'Precios', icon: '▨' },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/admin/organizaciones', label: 'Organizaciones', icon: '◈' },
      { href: '/admin/banners', label: 'Banners', icon: '◎' },
    ],
  },
  {
    label: 'Ecosistema',
    items: [
      { href: '/admin/ecosistema', label: 'Listados', icon: '⬡' },
    ],
  },
  {
    label: 'Comunidad',
    items: [
      { href: '/admin/consultas', label: 'Consultas', icon: '◫' },
      { href: '/admin/notificaciones', label: 'Notificaciones', icon: '◉' },
    ],
  },
  {
    label: 'Karai',
    items: [
      { href: '/admin/karai', label: 'Uso y leads', icon: '◐' },
      { href: '/admin/karai/fuentes', label: 'Base de conocimiento', icon: '◍' },
    ],
  },
]

const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((group) => group.items)

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-bg flex" data-theme="dark">
      <aside className="w-52 shrink-0 border-r border-bdr flex-col hidden md:flex">
        <div className="p-4 border-b border-bdr">
          <Image src="/logo.png" alt="Agroconecta" width={110} height={32} className="h-6 w-auto" />
          <span className="text-xs text-muted mt-1 block">Panel Agroconecta</span>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label ?? 'root'}>
              {group.label && (
                <p className="text-[11px] text-muted uppercase tracking-wide px-2.5 pt-3 pb-1">{group.label}</p>
              )}
              {group.items.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted hover:text-white hover:bg-secondary transition-colors"
                >
                  <span className="text-sm w-4 text-center shrink-0">{icon}</span>
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-bdr">
          <p className="text-xs text-muted truncate mb-2">{user?.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden border-b border-bdr px-3 py-2.5 flex items-center justify-between gap-3">
          <Image src="/logo.png" alt="Agroconecta" width={90} height={28} className="h-5 w-auto" />
          <div className="flex items-center gap-3 overflow-x-auto">
            {ADMIN_NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="text-xs text-muted hover:text-white whitespace-nowrap">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
