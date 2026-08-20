import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { Colors } from '@/constants/colors'

// `signInWithGoogle` en app-context.tsx arma el redirectTo de OAuth apuntando acá
// (`Linking.createURL('auth/callback')`) y captura el resultado con
// `WebBrowser.openAuthSessionAsync` antes de que llegue a navegar. Pero en algunos
// dispositivos/tiempos el linking system de Expo Router igual llega a montar esta ruta
// un instante — sin este archivo, expo-router mostraba su pantalla de "no encontrado"
// (flash de error) hasta que el índice resolvía la sesión y redirigía. Este archivo solo
// existe para que, si se monta, rebote inmediato y en silencio a la raíz.
export default function AuthCallbackScreen() {
  useEffect(() => {
    router.replace('/')
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={Colors.lime} />
    </View>
  )
}
