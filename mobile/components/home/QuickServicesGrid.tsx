import { router } from 'expo-router'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { ECOSYSTEM_PLATFORMS } from '@/lib/ecosystem-data'

const R = Colors.redesign

// Vidriera acotada del Ecosistema para Inicio — no todo ECOSYSTEM_PLATFORMS (ya son 6 y
// crecerá más), solo estos 3 + un acceso a "Ver más" que lleva a la tab completa.
const HOME_PLATFORM_IDS = ['bolsa-trabajo', 'cursos', 'clasificados']

// Cuadros (no píldoras de filtro) — widget propio y reordenable, separado del tablero de precios.
export function QuickServicesGrid() {
  const platforms = ECOSYSTEM_PLATFORMS.filter((p) => HOME_PLATFORM_IDS.includes(p.id))

  return (
    <View style={styles.grid}>
      {platforms.map((platform) => (
        <TouchableOpacity
          key={platform.id}
          style={styles.tile}
          activeOpacity={0.8}
          onPress={() => router.push((platform.route ?? `/(main)/ecosistema/${platform.id}`) as any)}
        >
          <View style={styles.iconBox}>
            <Ionicons name={platform.icon} size={17} color={R.limeSoftText} />
          </View>
          <Text family="noto-sans" weight="semibold" size={11} lineHeight={14} color={R.foreground} numberOfLines={2} style={styles.tileLabel}>
            {platform.name}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.tile}
        activeOpacity={0.8}
        onPress={() => router.push('/(main)/(tabs)/ecosystem' as any)}
      >
        <View style={styles.iconBox}>
          <Ionicons name="grid-outline" size={17} color={R.limeSoftText} />
        </View>
        <Text family="noto-sans" weight="semibold" size={11} lineHeight={14} color={R.foreground} numberOfLines={2} style={styles.tileLabel}>
          Ver más
        </Text>
      </TouchableOpacity>
    </View>
  )
}

// Experimento 1x4 (una sola fila) en vez de 2x2 — pedido explícito del usuario para ver
// si ocupa menos espacio vertical en Home. Si no convence, volver a flexBasis: '47%' +
// flexWrap: 'wrap' (2 columnas), iconBox 44/20 y numberOfLines={1} tal como estaba.
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 8 },
  tile: {
    flex: 1,
    backgroundColor: R.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: R.limeSoftBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { textAlign: 'center' },
})
