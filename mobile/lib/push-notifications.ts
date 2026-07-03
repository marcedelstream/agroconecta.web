import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { supabase } from './supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function getNotificationPermissionStatus() {
  return (await Notifications.getPermissionsAsync()).status
}

export async function registerPushToken(userId: string) {
  const permissions = await Notifications.getPermissionsAsync()
  const finalStatus = permissions.granted
    ? permissions.status
    : (await Notifications.requestPermissionsAsync()).status

  if (finalStatus !== 'granted') return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('important-posts', {
      name: 'Avisos importantes',
      importance: Notifications.AndroidImportance.HIGH,
    })
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data
  await supabase.from('push_tokens').upsert({
    user_id: userId,
    expo_token: token,
    platform: Platform.OS,
    enabled: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'expo_token' })

  return token
}
