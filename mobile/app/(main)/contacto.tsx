import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { supabase } from '@/lib/supabase'

const SERVICE_TYPE = 'oportunidad_comercial'
const SERVICE_LABEL = 'Oportunidad comercial'

export default function ContactoScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()
  const { user } = useApp()

  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!phone.trim()) return
    setLoading(true)
    try {
      await supabase.from('service_leads').insert({
        user_id: user?.id ?? null,
        service_type: SERVICE_TYPE,
        phone: phone.trim(),
        additional_info: message.trim(),
        created_at: new Date().toISOString(),
      })
    } catch {
      // Silently fail
    }
    try {
      await fetch('https://agroconecta.com.py/api/service-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceLabel: SERVICE_LABEL, phone: phone.trim(), additionalInfo: message.trim() }),
      })
    } catch {
      // El registro en Supabase ya se guardó; el email es un aviso adicional, no bloquea el flujo
    }
    setLoading(false)
    setSent(true)
  }

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>Contacto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing[8] }]}
        keyboardShouldPersistTaps="handled"
      >
        {sent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.lime} />
            <Text variant="title" weight="bold" family="poppins" style={{ textAlign: 'center' }}>
              ¡Mensaje enviado!
            </Text>
            <Text variant="body" color={C.muted} style={{ textAlign: 'center' }}>
              Nos comunicaremos a la brevedad al número proporcionado.
            </Text>
            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: Spacing[2] }]}
              onPress={() => { setSent(false); setPhone(''); setMessage('') }}
              activeOpacity={0.85}
            >
              <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>Enviar otro mensaje</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>CONTACTO</Text>
            <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground, lineHeight: 30 }}>
              ¿Tenés una oportunidad comercial o una sugerencia?
            </Text>
            <Text variant="body" style={{ color: C.muted, lineHeight: 22 }}>
              Contanos qué tenés en mente — una propuesta, una idea o algo que creas que puede sumar
              al ecosistema. Te respondemos por el número que nos dejes.
            </Text>

            <View style={styles.formFields}>
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

              <View style={styles.field}>
                <Text variant="caption" weight="semibold" style={[styles.fieldLabel, { color: C.muted }]}>
                  MENSAJE
                </Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: C.secondary, borderColor: C.border, color: C.foreground }]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Contanos tu idea u oportunidad..."
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
                  <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>Enviar mensaje</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  content: { padding: Spacing[5], gap: Spacing[3] },
  formFields: { gap: Spacing[4], marginTop: Spacing[2] },
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
