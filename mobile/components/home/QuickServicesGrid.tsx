import { router } from 'expo-router'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { ECOSYSTEM_PLATFORMS } from '@/lib/ecosystem-data'

const R = Colors.redesign

// Cuadros (no píldoras de filtro) para Remates/Empleos/Clasificados/Cursos — widget
// propio y reordenable, separado del tablero de precios.
export function QuickServicesGrid() {
  return (
    <View style={styles.grid}>
      {ECOSYSTEM_PLATFORMS.map((platform) => (
        <TouchableOpacity
          key={platform.id}
          style={styles.tile}
          activeOpacity={0.8}
          onPress={() => router.push((platform.route ?? `/(main)/ecosistema/${platform.id}`) as any)}
        >
          <View style={styles.iconBox}>
            <Ionicons name={platform.icon} size={20} color={R.limeSoftText} />
          </View>
          <Text family="noto-sans" weight="semibold" size={12.5} color={R.foreground} numberOfLines={1}>
            {platform.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: R.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: R.limeSoftBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
