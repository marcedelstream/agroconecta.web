import { View, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface PlatformInfo {
  label: string
  icon: IoniconName
  tagline: string
  description: string
  available: boolean
  url?: string
  features: string[]
}

const PLATFORM_DATA: Record<string, PlatformInfo> = {
  agrojuego: {
    label: 'AgroJuego',
    icon: 'game-controller-outline',
    tagline: 'Aprendé el agro jugando',
    description: 'El primer juego educativo del sector agropecuario paraguayo. Poné a prueba tus conocimientos sobre ganadería, agricultura, clima y mercados de forma dinámica e interactiva.',
    available: true,
    url: 'https://agrojuego.com',
    features: ['Trivia agropecuaria', 'Rankings semanales', 'Modo multijugador', 'Temáticas por categoría'],
  },
  agrostore: {
    label: 'AgroStore',
    icon: 'storefront-outline',
    tagline: 'El marketplace del campo paraguayo',
    description: 'Plataforma de comercio electrónico especializada en insumos, maquinaria y productos agropecuarios.',
    available: false,
    features: ['Insumos agrícolas', 'Maquinaria', 'Semillas', 'Agroquímicos'],
  },
  agrojobs: {
    label: 'Agro Jobs',
    icon: 'briefcase-outline',
    tagline: 'Empleo agropecuario en un solo lugar',
    description: 'Bolsa de trabajo especializada en el sector agro. Conectamos talento con empresas del campo.',
    available: false,
    features: ['Ofertas laborales', 'Perfiles profesionales', 'Empresas del sector', 'Postulaciones online'],
  },
  inmuebles: {
    label: 'Inmuebles',
    icon: 'home-outline',
    tagline: 'Propiedades rurales del Paraguay',
    description: 'Portal de compra, venta y alquiler de campos, estancias y propiedades rurales en todo el país.',
    available: false,
    features: ['Campos y estancias', 'Propiedades rurales', 'Búsqueda por departamento', 'Contacto directo'],
  },
}

export default function PlatformScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const C = useColors()
  const insets = useSafeAreaInsets()
  const platform = PLATFORM_DATA[id ?? '']

  if (!platform) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Text variant="body" style={{ color: C.muted }}>Plataforma no encontrada.</Text>
        <TouchableOpacity onPress={() => router.navigate('/(main)/ecosystem' as any)} style={{ marginTop: Spacing[3] }}>
          <Text variant="body" style={{ color: Colors.lime }}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.navigate('/(main)/ecosystem' as any)} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={{ color: C.foreground }}>{platform.label}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing[8] }]}
      >
        {/* Icono + nombre */}
        <View style={styles.heroSection}>
          <View style={[styles.bigIcon, { backgroundColor: platform.available ? `${Colors.lime}18` : `${C.muted}10` }]}>
            <Ionicons name={platform.icon} size={52} color={platform.available ? Colors.lime : C.muted} />
          </View>
          <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground, textAlign: 'center' }}>
            {platform.label}
          </Text>
          <Text variant="body" style={{ color: C.muted, textAlign: 'center' }}>
            {platform.tagline}
          </Text>
          {!platform.available && (
            <View style={styles.proximoBadge}>
              <Text style={styles.proximoText}>PRÓXIMAMENTE</Text>
            </View>
          )}
        </View>

        {/* Descripción */}
        <Text variant="body" style={{ color: C.foreground, lineHeight: 24 }}>
          {platform.description}
        </Text>

        {/* Features */}
        <View style={[styles.featuresCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text variant="body" weight="semibold" style={{ color: C.foreground }}>Características</Text>
          {platform.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.lime} />
              <Text variant="body" style={{ color: C.foreground }}>{f}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        {platform.available && platform.url ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(platform.url!)}
          >
            <Ionicons name="open-outline" size={20} color="#0A0A13" />
            <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>
              Abrir {platform.label}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.ctaBtnDisabled, { borderColor: C.border }]}>
            <Ionicons name="time-outline" size={20} color={C.muted} />
            <Text variant="body" weight="semibold" style={{ color: C.muted }}>
              Disponible próximamente
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  content: { padding: Spacing[5], gap: Spacing[5] },
  heroSection: { alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[4] },
  bigIcon: {
    width: 100,
    height: 100,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  proximoBadge: {
    backgroundColor: 'rgba(139,139,154,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  proximoText: { fontSize: 11, color: '#8B8B9A', fontWeight: '700', letterSpacing: 1 },
  featuresCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.lime,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
  },
  ctaBtnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
  },
})
