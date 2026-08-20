import { useEffect, useRef, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Stack, router, usePathname } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  useFonts,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
  NotoSans_800ExtraBold,
} from '@expo-google-fonts/noto-sans'
import { AppProvider, useApp } from '@/lib/app-context'
import { ThemeProvider, useTheme } from '@/lib/theme-context'
import { LocalAvatarProvider } from '@/lib/local-avatar-context'
import { registerPushToken, getNotificationPermissionStatus } from '@/lib/push-notifications'
import '../global.css'

const NOTIF_PROMPT_KEY = '@agroconecta:notif_prompt_shown'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'NotoSans-Regular': NotoSans_400Regular,
    'NotoSans-Medium': NotoSans_500Medium,
    'NotoSans-SemiBold': NotoSans_600SemiBold,
    'NotoSans-Bold': NotoSans_700Bold,
    'NotoSans-ExtraBold': NotoSans_800ExtraBold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppProvider>
          <LocalAvatarProvider>
            <ThemedRoot />
          </LocalAvatarProvider>
        </AppProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

const NOTIF_PROMPT_DELAY_MS = 3500

function ThemedRoot() {
  const { isDark } = useTheme()
  const { user, isLoading } = useApp()
  const pathname = usePathname()
  const bg = isDark ? '#0A0A13' : '#FAFAFA'
  const tokenRegistered = useRef(false)
  const promptArmed = useRef(false)
  const [notifModalVisible, setNotifModalVisible] = useState(false)

  // Si el permiso ya está concedido de antes, no hay nada que preguntar — solo registramos
  // el token en segundo plano, sin esperar a que llegue a Inicio (no es un prompt visible).
  useEffect(() => {
    if (isLoading || !user?.id || tokenRegistered.current) return

    ;(async () => {
      const status = await getNotificationPermissionStatus()
      if (status === 'granted') {
        tokenRegistered.current = true
        registerPushToken(user.id).catch(() => null)
      }
    })()
  }, [user?.id, isLoading])

  // El explicador propio (y el prompt nativo que dispara) recién se arma cuando el usuario
  // llega a Inicio, y con una demora — pedirlo en frío justo al registrarse/loguearse es
  // motivo de rechazo en App Store Review.
  useEffect(() => {
    if (isLoading || !user?.id || tokenRegistered.current || promptArmed.current) return
    if (!pathname?.includes('/home')) return
    promptArmed.current = true

    const timer = setTimeout(async () => {
      const [status, alreadyShown] = await Promise.all([
        getNotificationPermissionStatus(),
        AsyncStorage.getItem(NOTIF_PROMPT_KEY),
      ])
      if (status === 'granted' || status === 'denied' || alreadyShown) return
      setNotifModalVisible(true)
    }, NOTIF_PROMPT_DELAY_MS)

    return () => clearTimeout(timer)
  }, [user?.id, isLoading, pathname])

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
          animation: 'none',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="article/[id]" />
        <Stack.Screen name="publisher/[id]" />
        <Stack.Screen name="auth/callback" />
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
