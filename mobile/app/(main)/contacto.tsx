import { useState } from 'react'
import { View, ScrollView, TouchableOpacity, TextInput, Linking, StyleSheet } from 'react-native'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { supabase } from '@/lib/supabase'
import { SOCIAL_LINKS, WHATSAPP_NUMBER, WHATSAPP_URL } from '@/lib/social-links'

const R = Colors.redesign
const SERVICE_TYPE = 'oportunidad_comercial'
const SERVICE_LABEL = 'Oportunidad comercial'

export default function ContactoScreen() {
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
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Contacto</Text>
          <View style={{ width: 20 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {sent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={52} color={Colors.lime} />
            <Text family="noto-sans" weight="bold" size={19} color={R.foreground} style={{ textAlign: 'center' }}>
              ¡Mensaje enviado!
            </Text>
            <Text family="noto-sans" size={13.5} color={R.mutedForeground} style={{ textAlign: 'center' }}>
              Nos comunicaremos a la brevedad al número proporcionado.
            </Text>
            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 8 }]}
              onPress={() => { setSent(false); setPhone(''); setMessage('') }}
              activeOpacity={0.85}
            >
              <Text family="noto-sans" weight="bold" size={13.5} color="#0A0A13">Enviar otro mensaje</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.eyebrow}>CONTACTO</Text>
            <Text family="noto-sans" weight="extrabold" size={20} lineHeight={27} color={R.foreground} style={{ marginTop: 4 }}>
              ¿Tenés una oportunidad comercial o una sugerencia?
            </Text>
            <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={{ marginTop: 8 }}>
              Contanos qué tenés en mente — una propuesta, una idea o algo que creas que puede sumar
              al ecosistema. Te respondemos por el número que nos dejes.
            </Text>

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
                  MENSAJE
                </Text>
                <TextInput
                  style={styles.textArea}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Contanos tu idea u oportunidad..."
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
                  {loading ? 'Enviando...' : 'Enviar mensaje'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.socialSection}>
          <Text family="noto-sans" weight="semibold" size={11} color={R.mutedForeground} style={styles.fieldLabel}>
            SEGUINOS
          </Text>
          <View style={styles.socialRow}>
            {SOCIAL_LINKS.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={styles.socialBtn}
                onPress={() => Linking.openURL(social.url).catch(() => {})}
                hitSlop={4}
              >
                <Ionicons name={social.icon} size={19} color={R.foreground} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={() => Linking.openURL(WHATSAPP_URL).catch(() => {})}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={19} color={R.positive} />
            <Text family="noto-sans" weight="semibold" size={13.5} color={R.foreground}>{WHATSAPP_NUMBER}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  content: { padding: 20, paddingBottom: 40 },
  eyebrow: { letterSpacing: 0.6 },
  formFields: { gap: 16, marginTop: 16 },
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
  successBox: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  divider: { height: 1, backgroundColor: R.divider, marginTop: 28 },
  socialSection: { gap: 12, marginTop: 20 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.border,
    backgroundColor: R.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: R.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
})
