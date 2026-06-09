import { View, StyleSheet, type ViewStyle } from 'react-native'
import { Text } from './Text'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'

interface Props {
  segment?: unknown
  style?: ViewStyle
}

export function AdBanner({ style }: Props) {
  const C = useColors()
  return (
    <View style={[styles.container, style]}>
      <View style={styles.label}>
        <Text variant="label" style={[styles.labelText, { color: C.muted }]}>Publicidad</Text>
      </View>
      <View style={[styles.placeholder, { backgroundColor: C.secondary, borderColor: C.border }]}>
        <Text variant="body" weight="semibold" style={{ color: C.muted }}>Espacio disponible</Text>
        <Text variant="caption" style={{ color: C.muted }}>Banner 320 × 100 px</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  label: { alignSelf: 'flex-end', marginBottom: 3 },
  labelText: { fontSize: 9, letterSpacing: 0.5 },
  placeholder: {
    height: 100,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
  },
})
