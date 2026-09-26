import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { V2Layout } from '@/constants/spacing'

/** Alto y radio del botón de acción: 52/26 en iOS, 56/28 en Android (Material You). */
export const CTA_HEIGHT = Platform.OS === 'android' ? V2Layout.android.ctaHeight : V2Layout.ctaHeight
export const CTA_RADIUS = Platform.OS === 'android' ? V2Layout.android.ctaRadius : V2Layout.ctaRadius

// Posiciones verticales del item del feed, derivadas de la barra flotante (en el prototipo de
// 844 px: botón a 104 px del borde, info y barra lateral a 176 px, cabecera a 58 px).
export function useFeedInsets() {
  const insets = useSafeAreaInsets()
  const ctaBottom = useFloatingTabBarSpace() + 16
  return {
    headerTop: insets.top + 8,
    ctaBottom,
    contentBottom: ctaBottom + CTA_HEIGHT + 20,
    side: 18,
  }
}
