import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'

interface Props {
  title: string
  subtitle?: string
  action?: { label: string; onPress: () => void }
}

export function SectionHeader({ title, subtitle, action }: Props) {
  const C = useColors()
  return (
    <View style={[styles.container, { borderTopColor: C.border }]}>
      <View style={styles.text}>
        <Text variant="subtitle" weight="semibold" family="poppins">{title}</Text>
        {subtitle && <Text variant="caption" style={{ color: C.muted }}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} hitSlop={8} style={styles.actionBtn}>
          <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  text: { flex: 1, gap: 1 },
  actionBtn: { paddingLeft: Spacing[2] },
})
