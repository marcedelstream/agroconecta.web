import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

interface Props {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  /** Botón fijo abajo (ej. "Guardar"), fuera del scroll para que siempre se vea. */
  footer?: ReactNode
}

// Hoja inferior con la línea v2 (fondo claro, bordes de 28, manija, título grande). Reemplaza al
// SettingsSheet oscuro de la v1 en las pantallas rediseñadas.
export function V2Sheet({ title, subtitle, onClose, children, footer }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={styles.flex}>
              <Text family="noto-sans" weight="extrabold" size={22} color={Colors.v2.navy}>{title}</Text>
              {subtitle ? <Text family="noto-sans" size={14} lineHeight={20} color={Colors.v2.muted}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
              <Ionicons name="close" size={20} color={Colors.v2.navy} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, gap: 4 },
  backdrop: { flex: 1, backgroundColor: Colors.v2.sheet.backdrop },
  sheet: { maxHeight: '88%', backgroundColor: Colors.v2.ground, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.v2.sheet.border, marginBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.v2.surface, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 12, gap: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 8 },
})
