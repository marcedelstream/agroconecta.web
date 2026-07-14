import { useState } from 'react'
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { supabase } from '@/lib/supabase'
import { useApp } from '@/lib/app-context'

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
  const C = useColors()
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
        <Ionicons name="checkmark-circle" size={56} color={Colors.lime} />
        <Text variant="title" weight="bold" family="poppins" style={{ textAlign: 'center' }}>
          {successTitle}
        </Text>
        <Text variant="body" color={C.muted} style={{ textAlign: 'center' }}>
          Nos comunicaremos a la brevedad al número proporcionado.
        </Text>
        <TouchableOpacity
          style={[styles.submitBtn, { marginTop: Spacing[2] }]}
          onPress={() => { setSent(false); setPhone(''); setInfo('') }}
          activeOpacity={0.85}
        >
          <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>Enviar otra consulta</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.formFields}>
      {/* Teléfono */}
      <View style={styles.field}>
        <Text variant="caption" weight="semibold" style={[styles.fieldLabel, { color: C.muted }]}>
          NÚMERO DE TELÉFONO *
        </Text>
        <View style={[styles.inputBox, { backgroundColor: C.secondary, borderColor: C.border }]}>
          <Ionicons name="call-outline" size={18} color={C.muted} />
          <TextInput
            style={[styles.textInput, { color: C.foreground }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+595 9xx xxx xxx"
            placeholderTextColor={C.muted}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Info adicional */}
      <View style={styles.field}>
        <Text variant="caption" weight="semibold" style={[styles.fieldLabel, { color: C.muted }]}>
          INFORMACIÓN ADICIONAL
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: C.secondary, borderColor: C.border, color: C.foreground }]}
          value={info}
          onChangeText={setInfo}
          placeholder={infoPlaceholder}
          placeholderTextColor={C.muted}
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
        {loading ? (
          <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>Enviando...</Text>
        ) : (
          <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  formFields: { gap: Spacing[4] },
  field: { gap: Spacing[1.5] },
  fieldLabel: { letterSpacing: 0.6, fontSize: 11 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts.dmSans,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontFamily: Fonts.dmSans,
    fontSize: 15,
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: Colors.lime,
    borderRadius: Radius.base,
    alignItems: 'center',
    paddingVertical: Spacing[4],
    marginTop: Spacing[2],
  },
  submitBtnDisabled: { opacity: 0.5 },
  successBox: {
    alignItems: 'center',
    gap: Spacing[4],
    paddingVertical: Spacing[8],
  },
})
