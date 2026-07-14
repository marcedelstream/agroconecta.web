import { ScrollView, View, Image, TouchableOpacity, StyleSheet, type ImageSourcePropType } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/card'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'

const FOUNDERS: { name: string; role: string; image: string | ImageSourcePropType; bio: string }[] = [
  {
    name: 'Marcelo Escobar',
    role: 'Co-fundador y Director de Tecnología',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1733840528665-XXvTjaen2eV0PgjrVk2FqdPzy3XVoD.jpeg',
    bio: 'Lidera el desarrollo tecnológico y la visión estratégica de Agroconecta, conectando producto, operación y modelo de negocio para construir herramientas útiles para el sector agropecuario paraguayo.',
  },
  {
    name: 'Marlene Fernández',
    role: 'Co-fundadora y Directora de Comunicación',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-03-23%20at%2010.53.16-Q322FxX2EnEsc2L66VwEACBjsTqvsp.jpeg',
    bio: 'Encabeza la estrategia de comunicación y contenidos, acercando el ecosistema a productores, instituciones, marcas y profesionales que necesitan información clara y segmentada.',
  },
  {
    name: 'Fiorella Riveros',
    role: 'Directora de Sostenibilidad',
    image: require('@/assets/images/fiorella-riveros.jpeg'),
    bio: 'Lidera la visión socioambiental y de sostenibilidad, conectando gestión ambiental, comunicación e innovación para desarrollar soluciones que respondan a los desafíos actuales y futuros.',
  },
]

const VALUES = [
  {
    number: '01',
    title: 'Tecnología con propósito',
    description: 'Construimos herramientas para resolver problemas reales del agro, con foco en comunicación, difusión y conexión.',
  },
  {
    number: '02',
    title: 'Pioneros por convicción',
    description: 'Impulsamos soluciones digitales propias para un sector que merecía plataformas pensadas desde Paraguay.',
  },
  {
    number: '03',
    title: 'Ecosistema, no agencia',
    description: 'Creamos productos conectados entre sí, con visión de largo plazo y compromiso directo con el resultado.',
  },
]

export default function NosotrosScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>Nosotros</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing[8] }]}
      >
        <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>QUIÉNES SOMOS</Text>
        <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground, lineHeight: 32 }}>
          Los fundadores del ecosistema digital agropecuario de Paraguay
        </Text>
        <Text variant="body" style={{ color: C.muted, lineHeight: 22 }}>
          Agroconecta nace para crear tecnología propia para el campo paraguayo: plataformas simples,
          útiles y pensadas desde las necesidades reales del sector.
        </Text>

        <Card style={styles.missionCard} padding={4}>
          <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>NUESTRA MISIÓN</Text>
          <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground, marginTop: Spacing[1] }}>
            Tecnología construida desde adentro del campo.
          </Text>
        </Card>

        <View style={styles.section}>
          <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>VISIÓN</Text>
          <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground, marginTop: Spacing[1] }}>
            Soluciones digitales propias para el agro
          </Text>
          <Text variant="body" style={{ color: C.muted, lineHeight: 22, marginTop: Spacing[2] }}>
            El sector agropecuario paraguayo es uno de los motores de la economía nacional. Agroconecta
            busca darle herramientas digitales diseñadas para su forma de trabajar, comunicarse y tomar
            decisiones.
          </Text>
          <Text variant="body" style={{ color: C.muted, lineHeight: 22, marginTop: Spacing[2] }}>
            Desarrollamos productos que ayudan a ordenar la información, amplificar instituciones,
            acercar eventos y conectar mejor a productores, profesionales, marcas y organizaciones.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>EQUIPO</Text>
          <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground, marginTop: Spacing[1], marginBottom: Spacing[3] }}>
            Equipo directivo
          </Text>
          <View style={{ gap: Spacing[3] }}>
            {FOUNDERS.map((founder) => (
              <Card key={founder.name} padding={4}>
                <View style={styles.founderRow}>
                  <Image source={typeof founder.image === 'string' ? { uri: founder.image } : founder.image} style={styles.founderPhoto} />
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>{founder.name}</Text>
                    <Text variant="caption" weight="semibold" style={{ color: Colors.lime, marginTop: 2 }}>{founder.role}</Text>
                  </View>
                </View>
                <Text variant="body" style={{ color: C.muted, lineHeight: 21, marginTop: Spacing[3] }}>{founder.bio}</Text>
              </Card>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>VALORES</Text>
          <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground, marginTop: Spacing[1], marginBottom: Spacing[3] }}>
            Lo que nos guía
          </Text>
          <View style={{ gap: Spacing[2.5] }}>
            {VALUES.map((value) => (
              <Card key={value.number} padding={4}>
                <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>{value.number}</Text>
                <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground, marginTop: Spacing[1.5] }}>{value.title}</Text>
                <Text variant="body" style={{ color: C.muted, lineHeight: 21, marginTop: Spacing[1] }}>{value.description}</Text>
              </Card>
            ))}
          </View>
        </View>
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
  missionCard: { borderColor: `${Colors.lime}40`, backgroundColor: `${Colors.lime}0f` },
  section: { marginTop: Spacing[3] },
  founderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  founderPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: `${Colors.lime}60`,
  },
})
