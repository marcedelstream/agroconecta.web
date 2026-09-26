import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { PRICES_TEXT } from '@/lib/feed-v2/labels'

interface Props {
  updated: Date | null
  sharing: boolean
  canShare: boolean
  onBack: () => void
  onShare: () => void
}

function CircleButton({ icon, label, onPress, disabled, children }: {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  onPress: () => void
  disabled?: boolean
  children?: React.ReactNode
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.circle, disabled && styles.disabled]}
    >
      {children ?? <Ionicons name={icon} size={20} color={Colors.v2.navy} />}
    </TouchableOpacity>
  )
}

export function PricesHeader({ updated, sharing, canShare, onBack, onShare }: Props) {
  const updatedText = updated
    ? `${PRICES_TEXT.updatedToday} ${updated.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`
    : PRICES_TEXT.noUpdates
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <CircleButton icon="chevron-back" label={PRICES_TEXT.back} onPress={onBack} />
        <CircleButton icon="share-outline" label={PRICES_TEXT.share} onPress={onShare} disabled={!canShare || sharing}>
          {sharing ? <ActivityIndicator size="small" color={Colors.v2.navy} /> : undefined}
        </CircleButton>
      </View>
      <Text family="noto-sans" weight="extrabold" size={32} lineHeight={35} color={Colors.v2.navy} style={styles.h1}>
        {PRICES_TEXT.title}
      </Text>
      <Text family="noto-sans" size={14} color={Colors.v2.muted}>
        {updatedText}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  circle: {
    width: V2Layout.minTouch,
    height: V2Layout.minTouch,
    borderRadius: V2Layout.minTouch / 2,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  h1: { letterSpacing: -0.8 },
})
