import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'

interface Props {
  visible: boolean
  eventTitle: string
  reminderDateLabel: string
  onClose: () => void
}

export function ReminderModal({ visible, eventTitle, reminderDateLabel, onClose }: Props) {
  const C = useColors()
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          {/* Ícono */}
          <View style={[styles.iconCircle, { backgroundColor: `${Colors.lime}18` }]}>
            <Ionicons name="notifications" size={38} color={Colors.lime} />
          </View>

          {/* Título */}
          <Text variant="subtitle" weight="bold" family="poppins" style={{ textAlign: 'center', color: C.foreground }}>
            ¡Recordatorio activado!
          </Text>

          {/* Mensaje */}
          <Text variant="body" style={{ textAlign: 'center', color: C.muted, lineHeight: 22 }}>
            Te avisaremos el{' '}
            <Text variant="body" weight="semibold" style={{ color: C.foreground }}>
              {reminderDateLabel}
            </Text>
            {' '}a las 9:00 am sobre este evento.
          </Text>

          {/* Chip del evento */}
          <View style={[styles.eventChip, { backgroundColor: C.secondary, borderColor: C.border }]}>
            <Ionicons name="calendar-outline" size={14} color={Colors.lime} />
            <Text variant="caption" weight="medium" style={{ color: C.foreground, flex: 1 }} numberOfLines={2}>
              {eventTitle}
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>Perfecto</Text>
          </TouchableOpacity>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.base,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    width: '100%',
  },
  btn: {
    width: '100%',
    backgroundColor: Colors.lime,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
    alignItems: 'center',
    marginTop: Spacing[2],
  },
})
