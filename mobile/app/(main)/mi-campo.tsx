import { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Redirect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { FarmRowsEditor, type FarmRow } from '@/components/v2/karai/FarmRowsEditor'
import { ToastHost } from '@/components/v2/ToastHost'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useApp } from '@/lib/app-context'
import { fetchFarmData, saveFarmData, type FarmData } from '@/lib/farm-profile'
import { MI_CAMPO_TEXT as T } from '@/lib/feed-v2/labels'
import { showToast } from '@/lib/feed-v2/toast'
import { goBack } from '@/lib/navigation'

const V = Colors.v2
const num = (s: string) => {
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : undefined
}
const toRows = (list: { tipo: string; n?: number }[] | undefined): FarmRow[] => (list ?? []).map((r) => ({ tipo: r.tipo, valor: r.n ? String(r.n) : '' }))

// "Mi campo" (Karai Campo): los datos del establecimiento que Karai usa para responder. Solo miembros.
export default function MiCampoScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useApp()
  const [data, setData] = useState<FarmData | null>(null)
  const [nombre, setNombre] = useState('')
  const [distrito, setDistrito] = useState('')
  const [hectareas, setHectareas] = useState('')
  const [animales, setAnimales] = useState<FarmRow[]>([])
  const [cultivos, setCultivos] = useState<FarmRow[]>([])
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetchFarmData(user.id)
      .catch(() => ({}) as FarmData)
      .then((d) => {
        setData(d)
        setNombre(d.nombre ?? '')
        setDistrito(d.distrito ?? '')
        setHectareas(d.hectareas ? String(d.hectareas) : '')
        setAnimales(toRows(d.animales?.map((a) => ({ tipo: a.tipo, n: a.cantidad }))))
        setCultivos(toRows(d.cultivos?.map((c) => ({ tipo: c.tipo, n: c.hectareas }))))
        setNotas(d.notas ?? '')
      })
  }, [user?.id])

  if (!user?.isMember) return <Redirect href={'/(main)/karai-campo' as never} />

  async function save() {
    if (!user?.id || !data || saving) return
    setSaving(true)
    const next: FarmData = {
      ...data,
      nombre: nombre.trim() || undefined,
      distrito: distrito.trim() || undefined,
      hectareas: num(hectareas),
      animales: animales.filter((r) => r.tipo.trim()).map((r) => ({ tipo: r.tipo.trim(), cantidad: num(r.valor) ?? 0 })),
      cultivos: cultivos.filter((r) => r.tipo.trim()).map((r) => ({ tipo: r.tipo.trim(), hectareas: num(r.valor) ?? 0 })),
      notas: notas.trim() || undefined,
    }
    const ok = await saveFarmData(user.id, next)
    setSaving(false)
    showToast(ok ? T.saved : T.error)
    if (ok) goBack()
  }

  const field = (label: string, value: string, onChange: (v: string) => void, placeholder: string, numeric = false) => (
    <View style={styles.field}>
      <Text family="noto-sans" weight="bold" size={13} color={V.muted} style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={V.light.placeholder}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        style={styles.input}
      />
    </View>
  )

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <V2ScreenHeader title={T.title} subtitle={T.subtitle} />
        {!data ? (
          <ActivityIndicator color={V.limeText} style={styles.loading} />
        ) : (
          <View style={styles.body}>
            <View style={styles.privacy}>
              <Ionicons name="lock-closed" size={18} color={V.limeTintText} />
              <Text family="noto-sans" size={14} lineHeight={20} color={V.limeTintText} style={styles.flex}>{T.privacy}</Text>
            </View>

            <View style={styles.card}>
              {field(T.name, nombre, setNombre, T.namePlaceholder)}
              {field(T.district, distrito, setDistrito, T.districtPlaceholder)}
              {field(T.hectares, hectareas, (v) => setHectareas(v.replace(/[^0-9.,]/g, '')), T.hectaresPlaceholder, true)}
            </View>

            <View style={styles.card}>
              <Text family="noto-sans" weight="extrabold" size={17} color={V.navy}>{T.animals}</Text>
              <FarmRowsEditor rows={animales} onChange={setAnimales} typePlaceholder={T.animalType} valuePlaceholder={T.animalCount} addLabel={T.addAnimal} />
            </View>

            <View style={styles.card}>
              <Text family="noto-sans" weight="extrabold" size={17} color={V.navy}>{T.crops}</Text>
              <FarmRowsEditor rows={cultivos} onChange={setCultivos} typePlaceholder={T.cropType} valuePlaceholder={T.cropHa} addLabel={T.addCrop} />
            </View>

            <View style={styles.card}>
              <Text family="noto-sans" weight="extrabold" size={17} color={V.navy}>{T.notes}</Text>
              <TextInput
                value={notas}
                onChangeText={setNotas}
                placeholder={T.notesPlaceholder}
                placeholderTextColor={V.light.placeholder}
                multiline
                textAlignVertical="top"
                style={[styles.input, styles.textarea]}
              />
            </View>

            <TouchableOpacity onPress={save} disabled={saving} accessibilityRole="button" style={[styles.save, saving && styles.off]}>
              <Text family="noto-sans" weight="bold" size={16} color={V.white}>{saving ? T.saving : T.save}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <ToastHost />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  flex: { flex: 1 },
  loading: { marginTop: 40 },
  body: { paddingHorizontal: 18, gap: 14 },
  privacy: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 18, backgroundColor: V.limeTint },
  card: { backgroundColor: V.surface, borderRadius: 20, padding: 16, gap: 12 },
  field: { gap: 6 },
  label: { letterSpacing: 1 },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: V.light.inputBorder,
    backgroundColor: V.ground,
    paddingHorizontal: 14,
    fontFamily: Fonts.dmSans,
    fontSize: 15,
    color: V.navy,
  },
  textarea: { minHeight: 96, paddingTop: 12 },
  save: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: V.navy, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  off: { opacity: 0.4 },
})
