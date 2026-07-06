import { Stack } from 'expo-router'

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="article/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="publisher/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="event/[slug]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="service/[slug]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="events" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="platform/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="media-subscriptions" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="noticias" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="video/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="webview" options={{ animation: 'slide_from_right' }} />
    </Stack>
  )
}
