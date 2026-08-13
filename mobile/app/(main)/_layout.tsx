import { Stack } from 'expo-router'

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true, animation: 'none' }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="article/[id]" />
      <Stack.Screen name="publisher/[id]" />
      <Stack.Screen name="event/[slug]" />
      <Stack.Screen name="service/[slug]" />
      <Stack.Screen name="ecosistema/[slug]" />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="sumate" />
      <Stack.Screen name="publish-form" />
      <Stack.Screen name="events" />
      <Stack.Screen name="media-subscriptions" />
      <Stack.Screen name="videos" />
      <Stack.Screen name="video/[id]" />
      <Stack.Screen name="aliados" />
      <Stack.Screen name="nosotros" />
      <Stack.Screen name="contacto" />
      <Stack.Screen name="library" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="webview" />
    </Stack>
  )
}
