import type { Ionicons } from '@expo/vector-icons'

// Los 5 destinos de la v2 (README §2). Lo comparten la barra flotante (iOS) y la de Material You (Android).
type IconName = React.ComponentProps<typeof Ionicons>['name']

// 2026-09-30 (pedido de Marle): Inicio = bloques con saludo (inicio.tsx); el feed vertical pasó a Explorar.
export const V2_TAB_ROUTES = ['inicio', 'feed', 'karai', 'guardados', 'profile'] as const
export type V2TabRoute = (typeof V2_TAB_ROUTES)[number]

export const TAB_META: Record<Exclude<V2TabRoute, 'karai'>, { label: string; icon: IconName; activeIcon: IconName }> = {
  inicio: { label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  feed: { label: 'Explorar', icon: 'compass-outline', activeIcon: 'compass' },
  guardados: { label: 'Guardados', icon: 'bookmark-outline', activeIcon: 'bookmark' },
  profile: { label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
}
