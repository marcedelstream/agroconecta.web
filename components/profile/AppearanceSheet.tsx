import { Switch, View, StyleSheet } from 'react-native'
import { SettingsSheet } from './SettingsSheet'
import { Text } from '@/components/ui/Text'
import { useColors, DarkPalette, LightPalette } from '@/lib/theme-context'
import { useTheme } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'

interface Props { onClose: () => void }

export function AppearanceSheet({ onClose }: Props) {
  const C = useColors()
  const { isDark, setTheme } = useTheme()

  return (
    <SettingsSheet title="Apariencia" onClose={onClose} heightRatio={0.45}>
      <View style={styles.content}>
        {/* Toggle */}
        <View style={[styles.row, { borderColor: C.border }]}>
          <Text variant="body" weight="medium" style={{ flex: 1, color: C.foreground }}>Modo oscuro</Text>
          <Switch
            value={isDark}
            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
            trackColor={{ false: C.border, true: `${C.lime}80` }}
            thumbColor={isDark ? C.lime : C.muted}
          />
        </View>

        {/* Preview */}
        <Text variant="caption" style={{ color: C.muted }}>Vista previa</Text>
        <View style={styles.previewRow}>
          <View style={styles.previewItem}>
            <View style={[styles.previewBox, { backgroundColor: DarkPalette.background, borderColor: DarkPalette.border }]}>
              <View style={[styles.previewSurface, { backgroundColor: DarkPalette.surface }]} />
            </View>
            <Text variant="label" style={{ color: C.muted }}>Oscuro</Text>
          </View>
          <View style={styles.previewItem}>
            <View style={[styles.previewBox, { backgroundColor: LightPalette.background, borderColor: LightPalette.border }]}>
              <View style={[styles.previewSurface, { backgroundColor: LightPalette.surface }]} />
            </View>
            <Text variant="label" style={{ color: C.muted }}>Claro</Text>
          </View>
        </View>
      </View>
    </SettingsSheet>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing[5], gap: Spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.base, padding: Spacing[4] },
  previewRow: { flexDirection: 'row', gap: Spacing[4] },
  previewItem: { alignItems: 'center', gap: Spacing[2] },
  previewBox: { width: 100, height: 64, borderRadius: Radius.md, borderWidth: 1, padding: Spacing[2] },
  previewSurface: { height: 24, borderRadius: Radius.sm },
})
