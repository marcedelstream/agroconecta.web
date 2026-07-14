import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface Props {
  visible: boolean
  icon: IconName
  iconColor?: string
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  visible, icon, iconColor, title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel,
}: Props) {
  const C = useColors()
  const accent = iconColor ?? (destructive ? Colors.destructive : Colors.lime)

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${accent}18` }]}>
            <Ionicons name={icon} size={36} color={accent} />
          </View>

          <Text variant="subtitle" weight="bold" family="poppins" style={{ textAlign: 'center', color: C.foreground }}>
            {title}
          </Text>

          <Text variant="body" style={{ textAlign: 'center', color: C.muted, lineHeight: 22 }}>
            {message}
          </Text>

          <View style={styles.actions}>
            {cancelLabel && (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn, { borderColor: C.border }]}
                onPress={onCancel}
                activeOpacity={0.85}
              >
                <Text variant="body" weight="semibold" style={{ color: C.foreground }}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: destructive ? Colors.destructive : Colors.lime }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text variant="body" weight="bold" style={{ color: destructive ? '#fff' : '#0A0A13' }}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
  },
  card: {
    width: '100%',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[4],
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[3],
    width: '100%',
    marginTop: Spacing[2],
  },
  btn: {
    flex: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  cancelBtn: { borderWidth: 1 },
})
