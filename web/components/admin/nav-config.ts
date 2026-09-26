import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Gift,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Megaphone,
  Newspaper,
  Radio,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Otras rutas que también marcan este ítem como activo (ej. pestañas de la misma sección). */
  also?: string[]
}

export interface NavGroup {
  label: string | null
  items: NavItem[]
}

// Menú del panel ordenado por tareas (rediseño 2026-09), pensado para quien recién empieza.
export const ADMIN_NAV: NavGroup[] = [
  { label: null, items: [{ href: '/admin', label: 'Inicio', icon: LayoutDashboard }] },
  {
    label: 'Contenido',
    items: [
      { href: '/admin/publicaciones', label: 'Publicaciones', icon: Newspaper },
      { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
      { href: '/admin/biblioteca', label: 'Biblioteca', icon: BookOpen },
      { href: '/admin/precios', label: 'Precios', icon: TrendingUp },
      { href: '/admin/ecosistema', label: 'Ecosistema', icon: LayoutGrid },
    ],
  },
  {
    label: 'La app',
    items: [
      { href: '/admin/encuestas', label: 'Encuestas y quiz', icon: ListChecks },
      { href: '/admin/en-vivo', label: 'En vivo', icon: Radio },
      { href: '/admin/notificaciones', label: 'Notificaciones', icon: Bell },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/admin/organizaciones', label: 'Organizaciones', icon: Building2 },
      { href: '/admin/banners', label: 'Publicidad', icon: Megaphone, also: ['/admin/publicidad'] },
      { href: '/admin/premios', label: 'Premios y canjes', icon: Gift },
    ],
  },
  {
    label: 'Personas',
    items: [
      { href: '/admin/consultas', label: 'Consultas', icon: Inbox },
      { href: '/admin/karai', label: 'Karai', icon: Sparkles },
    ],
  },
  { label: 'Resultados', items: [{ href: '/admin/metricas', label: 'Métricas', icon: BarChart3 }] },
  { label: 'Ayuda', items: [{ href: '/admin/guia', label: 'Guía del panel', icon: LifeBuoy }] },
]

export function isActive(item: NavItem, pathname: string): boolean {
  const match = (href: string) => (href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))
  return match(item.href) || (item.also ?? []).some(match)
}
