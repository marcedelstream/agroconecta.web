import { router } from 'expo-router'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { ECOSYSTEM_PLATFORMS } from '@/lib/ecosystem-data'

const R = Colors.redesign

// Grilla de 3 columnas con las plataformas del ecosistema — usada en la tab Ecosistema,
// debajo del titular. Solo ícono + nombre, sin descripción ni estadísticas.
export function PlatformList() {
  return (
    <View style={styles.grid}>
      {ECOSYSTEM_PLATFORMS.map((platform) => (
        <TouchableOpacity
          key={platform.id}
          style={styles.tile}
          activeOpacity={0.8}
          onPress={() => {
            if (platform.externalUrl) {
              router.push({
                pathname: '/(main)/webview',
                params: { url: platform.externalUrl, title: platform.name },
              } as any)
              return
            }
            router.push((platform.route ?? `/(main)/ecosistema/${platform.id}`) as any)
          }}
        >
          <Ionicons name={platform.icon} size={19} color={R.foreground} />
          <Text family="noto-sans" weight="semibold" size={12.5} color={R.foreground} numberOfLines={1}>
            {platform.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '31.4%',
    backgroundColor: R.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 11,
    gap: 8,
  },
})
