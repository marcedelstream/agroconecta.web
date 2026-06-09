import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'

interface Props {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: Props) {
  const C = useColors()
  return (
    <View style={[styles.container, { borderTopColor: C.border }]}>
      <View style={styles.accent} />
      <View style={styles.text}>
        <Text variant="subtitle" weight="semibold" family="poppins">{title}</Text>
        {subtitle && <Text variant="caption" style={{ color: C.muted }}>{subtitle}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
    borderTopWidth: 1,
    marginTop: Spacing[2],
  },
  accent: { width: 3, height: 28, borderRadius: 2, backgroundColor: Colors.lime },
  text: { gap: 1 },
})
