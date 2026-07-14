import { useState } from 'react'
import { Switch, View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SettingsSheet } from './SettingsSheet'
import { Text } from '@/components/ui/Text'
import { useColors, useTheme, DarkPalette, LightPalette } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { newsCategories } from '@/lib/mock-data'
import type { NewsCategory } from '@/lib/types'

interface Props {
  selected: NewsCategory[]
  onClose: (updated: NewsCategory[]) => void
}

export function PersonalizationSheet({ selected, onClose }: Props) {
  const C = useColors()
  const { isDark, setTheme } = useTheme()
  const [local, setLocal] = useState<NewsCategory[]>(selected)

  function toggle(cat: NewsCategory) {
    setLocal((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <SettingsSheet title="Personalización" onClose={() => onClose(local)} heightRatio={0.78}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Apariencia */}
        <Text variant="caption" weight="semibold" style={{ color: C.muted, letterSpacing: 0.6 }}>APARIENCIA</Text>
        <View style={[styles.row, { borderColor: C.border }]}>
          <Text variant="body" weight="medium" style={{ flex: 1, color: C.foreground }}>Modo oscuro</Text>
          <Switch
            value={isDark}
            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
            trackColor={{ false: C.border, true: `${C.lime}80` }}
            thumbColor={isDark ? C.lime : C.muted}
          />
        </View>
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

        {/* Mis intereses */}
        <Text variant="caption" weight="semibold" style={{ color: C.muted, letterSpacing: 0.6, marginTop: Spacing[5] }}>
          MIS INTERESES
        </Text>
        <Text variant="body" style={{ color: C.muted }}>
          Elegí los temas que querés ver en tu feed.
        </Text>
        <View style={styles.grid}>
          {newsCategories.map((cat) => {
            const isActive = local.includes(cat.value)
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => toggle(cat.value)}
                style={[styles.option, { backgroundColor: C.surface, borderColor: C.border }, isActive && styles.optionActive]}
                activeOpacity={0.8}
              >
                <Text
                  variant="body"
                  weight="medium"
                  style={{ color: isActive ? '#0A0A13' : C.foreground }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </SettingsSheet>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing[5], paddingBottom: Spacing[10], gap: Spacing[3] },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.base, padding: Spacing[4] },
  previewRow: { flexDirection: 'row', gap: Spacing[4] },
  previewItem: { alignItems: 'center', gap: Spacing[2] },
  previewBox: { width: 100, height: 64, borderRadius: Radius.md, borderWidth: 1, padding: Spacing[2] },
  previewSurface: { height: 24, borderRadius: Radius.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  option: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.base,
    borderWidth: 1,
  },
  optionActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
})
