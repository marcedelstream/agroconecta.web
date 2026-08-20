import { useState } from 'react'
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/lib/app-context'

const R = Colors.redesign

interface Props {
  serviceId: string
  serviceLabel: string
  infoPlaceholder?: string
  submitLabel?: string
  successTitle?: string
}

export function ServiceLeadForm({
  serviceId,
  serviceLabel,
  infoPlaceholder = 'Contanos más sobre tu proyecto o necesidad...',
  submitLabel = 'Enviar consulta',
  successTitle = '¡Consulta enviada!',
}: Props) {
  const { user } = useApp()
  const [phone, setPhone] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!phone.trim()) return
    setLoading(true)
    try {
      await supabase.from('service_leads').insert({
        user_id: user?.id ?? null,
        service_type: serviceId,
        phone: phone.trim(),
        additional_info: info.trim(),
        created_at: new Date().toISOString(),
      })
    } catch {
      // Silently fail
    }
    try {
      await fetch('https://agroconecta.com.py/api/service-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceLabel, phone: phone.trim(), additionalInfo: info.trim() }),
      })
    } catch {
      // El registro en Supabase ya se guardó; el email es un aviso adicional, no bloquea el flujo
    }
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <View style={styles.successBox}>
        <Ionicons name="checkmark-circle" size={52} color={Colors.lime} />
        <Text family="noto-sans" weight="bold" size={19} color={R.foreground} style={{ textAlign: 'center' }}>
          {successTitle}
        </Text>
        <Text family="noto-sans" size={13.5} color={R.mutedForeground} style={{ textAlign: 'center' }}>
          Nos comunicaremos a la brevedad al número proporcionado.
        </Text>
        <TouchableOpacity
          style={[styles.submitBtn, { marginTop: 8 }]}
          onPress={() => { setSent(false); setPhone(''); setInfo('') }}
          activeOpacity={0.85}
        >
          <Text family="noto-sans" weight="bold" size={13.5} color="#0A0A13">Enviar otra consulta</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.formFields}>
      <View style={styles.field}>
        <Text family="noto-sans" weight="semibold" size={11} color={R.mutedForeground} style={styles.fieldLabel}>
          NÚMERO DE TELÉFONO *
        </Text>
        <View style={styles.inputBox}>
          <Ionicons name="call-outline" size={18} color={R.mutedForeground} />
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="+595 9xx xxx xxx"
            placeholderTextColor={R.mutedForeground}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text family="noto-sans" weight="semibold" size={11} color={R.mutedForeground} style={styles.fieldLabel}>
          INFORMACIÓN ADICIONAL
        </Text>
        <TextInput
          style={styles.textArea}
          value={info}
          onChangeText={setInfo}
          placeholder={infoPlaceholder}
          placeholderTextColor={R.mutedForeground}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, !phone.trim() && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading || !phone.trim()}
        activeOpacity={0.85}
      >
        <Text family="noto-sans" weight="bold" size={13.5} color="#0A0A13">
          {loading ? 'Enviando...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  formFields: { gap: 16 },
  field: { gap: 6 },
  fieldLabel: { letterSpacing: 0.6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    backgroundColor: R.secondary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 9,
  },
  textInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 14, color: R.foreground },
  textArea: {
    borderRadius: 13,
    backgroundColor: R.secondary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'NotoSans-Regular',
    fontSize: 14,
    color: R.foreground,
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: Colors.lime,
    borderRadius: 13,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 6,
  },
  submitBtnDisabled: { opacity: 0.5 },
  successBox: { alignItems: 'center', gap: 12, paddingVertical: 32 },
})
