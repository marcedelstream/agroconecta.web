import { router } from 'expo-router'

// router.back() explota con "GO_BACK was not handled by any navigator" cuando la pantalla
// se llegó sin historial de push (p. ej. después de un cambio de tab + replace, o por deep
// link directo). Los botones "atrás" de las pantallas rediseñadas usan esto en vez de
// router.back() a secas.
export function goBack(fallback: string = '/(main)/(tabs)/home') {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace(fallback as any)
  }
}
