import { Stack } from 'expo-router'

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true, animation: 'none' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="article/[id]" />
      <Stack.Screen name="publisher/[id]" />
      <Stack.Screen name="event/[slug]" />
      <Stack.Screen name="service/[slug]" />
      <Stack.Screen name="events" />
      <Stack.Screen name="platform/[id]" />
      <Stack.Screen name="media-subscriptions" />
      <Stack.Screen name="noticias" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="video/[id]" />
      <Stack.Screen name="webview" />
    </Stack>
  )
}
