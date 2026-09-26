import type { Ionicons } from '@expo/vector-icons'

// Los 5 destinos de la v2 (README §2). Lo comparten la barra flotante (iOS) y la de Material You (Android).
type IconName = React.ComponentProps<typeof Ionicons>['name']

export const V2_TAB_ROUTES = ['feed', 'explorar', 'karai', 'guardados', 'profile'] as const
export type V2TabRoute = (typeof V2_TAB_ROUTES)[number]

export const TAB_META: Record<Exclude<V2TabRoute, 'karai'>, { label: string; icon: IconName; activeIcon: IconName }> = {
  feed: { label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  explorar: { label: 'Explorar', icon: 'compass-outline', activeIcon: 'compass' },
  guardados: { label: 'Guardados', icon: 'bookmark-outline', activeIcon: 'bookmark' },
  profile: { label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
}
