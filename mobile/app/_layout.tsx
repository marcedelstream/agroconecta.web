import { useEffect, useRef, useState } from 'react'
import { Stack, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import { AppProvider, useApp } from '@/lib/app-context'
import { ThemeProvider, useTheme } from '@/lib/theme-context'
import { registerPushToken, getNotificationPermissionStatus } from '@/lib/push-notifications'
import '../global.css'

const NOTIF_PROMPT_KEY = '@agroconecta:notif_prompt_shown'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Light': Poppins_300Light,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-SemiBold': DMSans_700Bold,
    'DMSans-Bold': DMSans_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <ThemeProvider>
      <AppProvider>
        <ThemedRoot />
      </AppProvider>
    </ThemeProvider>
  )
}

function ThemedRoot() {
  const { isDark } = useTheme()
  const { user, isLoading } = useApp()
  const bg = isDark ? '#0A0A13' : '#FAFAFA'
  const tokenRegistered = useRef(false)
  const [notifModalVisible, setNotifModalVisible] = useState(false)

  // Al tener usuario disponible: si el permiso de notificaciones todavía no se pidió
  // ni se le mostró el aviso propio, mostramos un explicador antes del prompt nativo.
  useEffect(() => {
    if (isLoading || !user?.id || tokenRegistered.current) return
    tokenRegistered.current = true

    ;(async () => {
      const [status, alreadyShown] = await Promise.all([
        getNotificationPermissionStatus(),
        AsyncStorage.getItem(NOTIF_PROMPT_KEY),
      ])

      if (status === 'granted') {
        registerPushToken(user.id).catch(() => null)
        return
      }
      if (status === 'denied' || alreadyShown) return

      setNotifModalVisible(true)
    })()
  }, [user?.id, isLoading])

  async function acceptNotifications() {
    setNotifModalVisible(false)
    await AsyncStorage.setItem(NOTIF_PROMPT_KEY, '1')
    if (user?.id) registerPushToken(user.id).catch(() => null)
  }

  async function declineNotifications() {
    setNotifModalVisible(false)
    await AsyncStorage.setItem(NOTIF_PROMPT_KEY, '1')
  }

  // Navegar al artículo cuando el usuario toca una notificación (app en background/cerrada)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | null
      if (data?.articleId) {
        router.push({ pathname: '/article/[id]', params: { id: data.articleId } })
      }
    })
    return () => sub.remove()
  }, [])

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bg },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(main)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="article/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="publisher/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>

      <ConfirmModal
        visible={notifModalVisible}
        icon="notifications-outline"
        title="Activar notificaciones"
        message="Te avisamos cuando haya noticias importantes, precios que cambian fuerte o eventos que te pueden interesar. Podés desactivarlas cuando quieras desde tu perfil."
        confirmLabel="Activar"
        cancelLabel="Ahora no"
        onConfirm={acceptNotifications}
        onCancel={declineNotifications}
      />
    </>
  )
}
