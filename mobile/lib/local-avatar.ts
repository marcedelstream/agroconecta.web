import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import * as ImagePicker from 'expo-image-picker'

// Foto de perfil 100% local: nunca se sube a Supabase ni a ningún backend. Se copia a un
// archivo permanente en el dispositivo (documentDirectory) y la ruta se guarda en
// AsyncStorage — así sobrevive a reinicios de la app, a diferencia de la URI temporal que
// devuelve el picker.
const AVATAR_KEY = '@agroconecta:local_avatar_uri'
const AVATAR_FILENAME = 'profile-photo.jpg'

export async function getLocalAvatarUri(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AVATAR_KEY)
  } catch {
    return null
  }
}

/** Abre el selector de fotos, copia la elegida a almacenamiento permanente y devuelve su URI. `null` si el usuario canceló o no dio permiso. */
export async function pickAndSaveLocalAvatar(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  })
  if (result.canceled || !result.assets[0]) return null

  const destUri = `${FileSystem.documentDirectory}${AVATAR_FILENAME}`
  await FileSystem.copyAsync({ from: result.assets[0].uri, to: destUri }).catch(async () => {
    // Si ya existía un archivo previo, copyAsync puede fallar — lo borramos y reintentamos.
    await FileSystem.deleteAsync(destUri, { idempotent: true })
    await FileSystem.copyAsync({ from: result.assets[0].uri, to: destUri })
  })

  // Cache-busting: sin esto <Image> puede seguir mostrando la foto vieja porque la URI no cambió.
  const uriWithBuster = `${destUri}?t=${Date.now()}`
  await AsyncStorage.setItem(AVATAR_KEY, uriWithBuster)
  return uriWithBuster
}

export async function removeLocalAvatar(): Promise<void> {
  await AsyncStorage.removeItem(AVATAR_KEY).catch(() => {})
  const destUri = `${FileSystem.documentDirectory}${AVATAR_FILENAME}`
  await FileSystem.deleteAsync(destUri, { idempotent: true }).catch(() => {})
}
