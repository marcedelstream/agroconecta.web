import { useEffect } from 'react'
import { View } from 'react-native'
import { router } from 'expo-router'
import { useApp } from '@/lib/app-context'
import { Colors } from '@/constants/colors'

// El botón "+" de la tab bar entra acá. No tiene UI propia: solo decide a dónde mandar
// según si el usuario ya tiene membresía activa (ver isMember en lib/types.ts).
export default function PublishGateScreen() {
  const { user } = useApp()

  useEffect(() => {
    if (!user) return
    if (user.isMember) {
      router.replace('/(main)/publish-form' as any)
    } else {
      router.replace('/(main)/sumate' as any)
    }
  }, [user])

  return <View style={{ flex: 1, backgroundColor: Colors.redesign.background }} />
}
