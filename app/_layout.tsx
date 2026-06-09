import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
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
import { AppProvider } from '@/lib/app-context'
import { ThemeProvider, useTheme } from '@/lib/theme-context'
import '../global.css'

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
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
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
  const bg = isDark ? '#0A0A13' : '#FAFAFA'
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
    </>
  )
}
