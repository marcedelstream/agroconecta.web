import { router } from 'expo-router'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { ECOSYSTEM_PLATFORMS } from '@/lib/ecosystem-data'

const R = Colors.redesign

// Card de filas con las plataformas del ecosistema — usada en Inicio
// (banda "El ecosistema del agro") y en la tab Ecosistema.
export function PlatformList() {
  return (
    <View style={styles.card}>
      {ECOSYSTEM_PLATFORMS.map((platform, i) => (
        <TouchableOpacity
          key={platform.id}
          style={[styles.row, i < ECOSYSTEM_PLATFORMS.length - 1 && styles.rowDivider]}
          activeOpacity={0.75}
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
          <View style={styles.iconBox}>
            <Ionicons name={platform.icon} size={19} color={R.foreground} />
          </View>
          <View style={styles.text}>
            <Text family="noto-sans" weight="semibold" size={13.5} color={R.foreground}>{platform.name}</Text>
            <Text family="noto-sans" size={11.5} color={R.mutedForeground} numberOfLines={1}>
              {platform.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color="#A8A8B2" />
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: R.surface, borderRadius: 16, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: R.divider },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: R.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
})
