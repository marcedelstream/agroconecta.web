import { Image, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useLocalAvatar } from '@/lib/local-avatar-context'

const R = Colors.redesign

interface Props {
  name: string
}

// Avatar de la cabecera oscura del rediseño — Inicio, Mercado y el resto de las pantallas
// rediseñadas lo usan igual, siempre abre Perfil. Muestra la foto local si el usuario tiene
// una guardada (mismo estado compartido que Perfil y el menú lateral); si no, la inicial.
export function HeaderAvatar({ name }: Props) {
  const { avatarUri } = useLocalAvatar()
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <TouchableOpacity
      onPress={() => router.push('/(main)/(tabs)/profile' as any)}
      style={styles.avatar}
      activeOpacity={0.8}
    >
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
      ) : (
        <Text family="noto-sans" weight="bold" size={13} color={Colors.lime}>{initial}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: R.header.chip,
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 36, height: 36 },
})
