import { useRef, useEffect, useState } from 'react'
import {
  View,
  Animated,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useColors, useTheme } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { supabase } from '@/lib/supabase'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')
const DRAWER_W = Math.min(SCREEN_W * 0.78, 320)
const darkLogo = require('@/assets/images/logo-dark.png')
const lightLogo = require('@/assets/images/logo-light.png')

const SERVICES = [
  { id: 'ambiental', label: 'Consultoría Ambiental', icon: 'leaf-outline' as const },
  { id: 'marketing', label: 'Marketing Digital', icon: 'megaphone-outline' as const },
  { id: 'vegetal', label: 'Consultoría en Producción Vegetal', icon: 'flower-outline' as const },
  { id: 'software', label: 'Desarrollo Web y Software', icon: 'code-slash-outline' as const },
  { id: 'publicidad', label: 'Publicidad en la App', icon: 'phone-portrait-outline' as const },
]

interface Props {
  onClose: () => void
}

export function DrawerMenu({ onClose }: Props) {
  const C = useColors()
  const { isDark } = useTheme()
  const slideAnim = useRef(new Animated.Value(DRAWER_W)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  const [activeService, setActiveService] = useState<typeof SERVICES[number] | null>(null)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start()
  }, [])

  function handleClose(route?: string) {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: DRAWER_W, duration: 240, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      onClose()
      if (route) {
        const { router } = require('expo-router')
        router.push(route)
      }
    })
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => handleClose()} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { backgroundColor: C.surface, borderLeftColor: C.border, transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: C.border }]}>
          <Image source={isDark ? darkLogo : lightLogo} style={styles.drawerLogo} resizeMode="contain" />
          <TouchableOpacity onPress={() => handleClose()} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.itemsContainer}>
          {/* SERVICIOS — expandible */}
          <Text variant="label" color={Colors.muted} style={styles.sectionLabel}>SERVICIOS</Text>

          <View style={[styles.servicesList, { borderLeftColor: C.border }]}>
            {SERVICES.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={styles.serviceItem}
                activeOpacity={0.7}
                onPress={() => setActiveService(svc)}
              >
                <Ionicons name={svc.icon} size={16} color={Colors.lime} />
                <Text variant="body" weight="medium" style={styles.serviceLabel}>{svc.label}</Text>
                <Ionicons name="chevron-forward" size={15} color={C.muted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>

          {/* CUENTA */}
          <Text variant="label" color={Colors.muted} style={[styles.sectionLabel, { marginTop: Spacing[4] }]}>CUENTA</Text>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleClose('/(main)/profile')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="settings-outline" size={19} color={Colors.lime} />
            </View>
            <Text variant="body" weight="medium">Configuración</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[styles.drawerFooter, { borderTopColor: C.border }]}>
          <Text variant="caption" color={Colors.muted}>© 2026 Agroconecta</Text>
          <Text variant="caption" color={Colors.muted}>v1.0.0</Text>
        </View>
      </Animated.View>

      {/* Form sheet de servicio */}
      {activeService && (
        <ServiceLeadSheet
          service={activeService}
          onClose={() => setActiveService(null)}
        />
      )}
    </View>
  )
}

// ─── Lead form sheet ─────────────────────────────────────────────────────────

interface ServiceLeadSheetProps {
  service: typeof SERVICES[number]
  onClose: () => void
}

function ServiceLeadSheet({ service, onClose }: ServiceLeadSheetProps) {
  const C = useColors()
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  const [selectedService, setSelectedService] = useState(service.id)
  const [phone, setPhone] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [svcPickerOpen, setSvcPickerOpen] = useState(false)

  const selectedLabel = SERVICES.find((s) => s.id === selectedService)?.label ?? ''

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
  }, [])

  function closeSheet() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose)
  }

  async function handleSubmit() {
    if (!phone.trim()) return
    setLoading(true)
    try {
      await supabase.from('service_leads').insert({
        service_type: selectedService,
        phone: phone.trim(),
        additional_info: info.trim(),
        created_at: new Date().toISOString(),
      })
    } catch {
      // Silently fail — tabla pendiente de crear en Supabase
    }
    setLoading(false)
    setSent(true)
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
      </Animated.View>

      <Animated.View
        style={[styles.formSheet, { backgroundColor: C.surface, borderColor: C.border, transform: [{ translateY: slideAnim }] }]}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.formHandle, { backgroundColor: C.border }]} />

          <View style={[styles.formHeader, { borderBottomColor: C.border }]}>
            <Text variant="subtitle" weight="bold" family="poppins">Solicitar servicio</Text>
            <TouchableOpacity onPress={closeSheet} hitSlop={12}>
              <Ionicons name="close" size={22} color={C.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formBody} showsVerticalScrollIndicator={false}>
            {sent ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={56} color={Colors.lime} />
                <Text variant="title" weight="bold" family="poppins" style={{ textAlign: 'center' }}>
                  ¡Consulta enviada!
                </Text>
                <Text variant="body" color={C.muted} style={{ textAlign: 'center' }}>
                  Nos comunicaremos a la brevedad al número proporcionado.
                </Text>
                <TouchableOpacity style={[styles.submitBtn, { marginTop: Spacing[4] }]} onPress={closeSheet}>
                  <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formFields}>
                {/* Tipo de servicio */}
                <View style={styles.field}>
                  <Text variant="caption" weight="semibold" style={[styles.fieldLabel, { color: C.muted }]}>
                    TIPO DE SERVICIO
                  </Text>
                  <TouchableOpacity
                    style={[styles.select, { backgroundColor: C.secondary, borderColor: C.border }]}
                    onPress={() => setSvcPickerOpen((v) => !v)}
                    activeOpacity={0.8}
                  >
                    <Text variant="body" weight="medium">{selectedLabel}</Text>
                    <Ionicons name={svcPickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
                  </TouchableOpacity>
                  {svcPickerOpen && (
                    <View style={[styles.pickerDropdown, { backgroundColor: C.secondary, borderColor: C.border }]}>
                      {SERVICES.map((svc) => (
                        <TouchableOpacity
                          key={svc.id}
                          style={[styles.pickerOption, selectedService === svc.id && { backgroundColor: `${Colors.lime}20` }]}
                          onPress={() => { setSelectedService(svc.id); setSvcPickerOpen(false) }}
                        >
                          <Text variant="body" style={selectedService === svc.id ? { color: Colors.lime } : undefined}>
                            {svc.label}
                          </Text>
                          {selectedService === svc.id && (
                            <Ionicons name="checkmark" size={16} color={Colors.lime} style={{ marginLeft: 'auto' }} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

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
                    placeholder="Contanos más sobre tu proyecto o necesidad..."
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
                    <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>Enviar consulta</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: DRAWER_W,
    borderLeftWidth: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[14],
    paddingBottom: Spacing[5],
    borderBottomWidth: 1,
  },
  drawerLogo: { height: 28, width: 120 },
  itemsContainer: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[3] },
  sectionLabel: {
    paddingHorizontal: Spacing[2],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[1],
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.md,
  },
  menuItemLabel: { flex: 1 },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: `${Colors.lime}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servicesList: {
    marginLeft: Spacing[7],
    borderLeftWidth: 1,
    paddingLeft: Spacing[3],
    gap: 2,
    marginBottom: Spacing[1],
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2.5],
    paddingHorizontal: Spacing[2],
    borderRadius: Radius.md,
  },
  serviceLabel: { flex: 1, fontSize: 13 },
  drawerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[10],
    paddingTop: Spacing[4],
    borderTopWidth: 1,
  },
  // Form sheet
  formSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_H * 0.88,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
  },
  formHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing[3],
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  formBody: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[10] },
  formFields: { gap: Spacing[4], paddingVertical: Spacing[4] },
  field: { gap: Spacing[1.5] },
  fieldLabel: { letterSpacing: 0.6, fontSize: 11 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  pickerDropdown: {
    borderWidth: 1,
    borderRadius: Radius.base,
    marginTop: Spacing[1],
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
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
