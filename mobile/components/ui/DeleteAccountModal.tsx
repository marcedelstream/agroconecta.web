import { useState } from 'react'
import { Modal, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from './Text'
import { Colors } from '@/constants/colors'

const R = Colors.redesign
const CONFIRM_WORD = 'ELIMINAR'

interface Props {
  visible: boolean
  deleting: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

// Eliminar la cuenta es irreversible — a diferencia de ConfirmModal (usado para cerrar
// sesión y demás), acá pedimos escribir una palabra exacta para habilitar el botón. Un
// solo tap sobre un botón de confirmación es muy fácil de apretar por error.
export function DeleteAccountModal({ visible, deleting, error, onConfirm, onCancel }: Props) {
  const [input, setInput] = useState('')
  const canConfirm = input.trim().toUpperCase() === CONFIRM_WORD

  function handleCancel() {
    setInput('')
    onCancel()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="trash-outline" size={34} color={Colors.destructive} />
          </View>

          <Text family="noto-sans" weight="bold" size={18} color={R.foreground} style={styles.title}>
            Eliminar cuenta
          </Text>

          <Text family="noto-sans" size={13.5} lineHeight={20} color={R.mutedForeground} style={styles.message}>
            {error ?? 'Esta acción es permanente: se borran tu perfil, preferencias y suscripciones. No se puede deshacer.'}
          </Text>

          <Text family="noto-sans" size={12.5} color={R.mutedForeground} style={styles.instructions}>
            Escribí <Text family="noto-sans" weight="bold" size={12.5} color={R.foreground}>{CONFIRM_WORD}</Text> para confirmar
          </Text>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={CONFIRM_WORD}
            placeholderTextColor={R.mutedForeground}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.85}>
              <Text family="noto-sans" weight="semibold" size={14} color={R.foreground}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={!canConfirm || deleting}
              activeOpacity={0.85}
            >
              <Text family="noto-sans" weight="bold" size={14} color="#FFFFFF">
                {deleting ? 'Eliminando…' : 'Eliminar cuenta'}
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
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: R.surface,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: `${Colors.destructive}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', marginTop: 6 },
  instructions: { marginTop: 16 },
  input: {
    width: '100%',
    marginTop: 10,
    borderRadius: 13,
    backgroundColor: R.secondary,
    borderWidth: 1,
    borderColor: R.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'NotoSans-Bold',
    fontSize: 14,
    color: R.foreground,
    textAlign: 'center',
    letterSpacing: 1,
  },
  actions: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 18 },
  cancelBtn: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: R.border,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: Colors.destructive,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
})
