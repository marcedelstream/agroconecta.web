import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { V2Layout } from '@/constants/spacing'

// Posiciones verticales del item del feed, derivadas de la barra flotante (en el prototipo de
// 844 px: botón a 104 px del borde, info y barra lateral a 176 px, cabecera a 58 px).
export function useFeedInsets() {
  const insets = useSafeAreaInsets()
  const ctaBottom = V2Layout.navBottom + insets.bottom + V2Layout.navHeight + 16
  return {
    headerTop: insets.top + 8,
    ctaBottom,
    contentBottom: ctaBottom + V2Layout.ctaHeight + 20,
    side: 18,
  }
}
