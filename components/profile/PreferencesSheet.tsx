import { useState } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SettingsSheet } from './SettingsSheet'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { newsCategories } from '@/lib/mock-data'
import type { NewsCategory } from '@/lib/types'

interface Props {
  selected: NewsCategory[]
  onClose: (updated: NewsCategory[]) => void
}

export function PreferencesSheet({ selected, onClose }: Props) {
  const C = useColors()
  const [local, setLocal] = useState<NewsCategory[]>(selected)

  function toggle(cat: NewsCategory) {
    setLocal((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <SettingsSheet title="Mis intereses" onClose={() => onClose(local)} heightRatio={0.62}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="body" style={{ color: C.muted, marginBottom: Spacing[3] }}>
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
  content: { padding: Spacing[5], paddingBottom: Spacing[10] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  option: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.base,
    borderWidth: 1,
  },
  optionActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
})
