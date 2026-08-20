import { ScrollView, View, Image, TouchableOpacity, StyleSheet, type ImageSourcePropType } from 'react-native'
import { router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

const R = Colors.redesign

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
  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Nosotros</Text>
          <View style={{ width: 20 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.eyebrow}>QUIÉNES SOMOS</Text>
        <Text family="noto-sans" weight="extrabold" size={22} lineHeight={29} color={R.foreground}>
          Los fundadores del ecosistema digital agropecuario de Paraguay
        </Text>
        <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={styles.intro}>
          Agroconecta nace para crear tecnología propia para el campo paraguayo: plataformas simples,
          útiles y pensadas desde las necesidades reales del sector.
        </Text>

        <View style={styles.missionCard}>
          <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.eyebrow}>NUESTRA MISIÓN</Text>
          <Text family="noto-sans" weight="semibold" size={15} color={R.foreground} style={{ marginTop: 4 }}>
            Tecnología construida desde adentro del campo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.eyebrow}>VISIÓN</Text>
          <Text family="noto-sans" weight="semibold" size={15} color={R.foreground} style={{ marginTop: 4 }}>
            Soluciones digitales propias para el agro
          </Text>
          <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={{ marginTop: 8 }}>
            El sector agropecuario paraguayo es uno de los motores de la economía nacional. Agroconecta
            busca darle herramientas digitales diseñadas para su forma de trabajar, comunicarse y tomar
            decisiones.
          </Text>
          <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={{ marginTop: 8 }}>
            Desarrollamos productos que ayudan a ordenar la información, amplificar instituciones,
            acercar eventos y conectar mejor a productores, profesionales, marcas y organizaciones.
          </Text>
        </View>

        <View style={styles.section}>
          <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.eyebrow}>EQUIPO</Text>
          <Text family="noto-sans" weight="semibold" size={15} color={R.foreground} style={{ marginTop: 4, marginBottom: 12 }}>
            Equipo directivo
          </Text>
          <View style={{ gap: 12 }}>
            {FOUNDERS.map((founder) => (
              <View key={founder.name} style={styles.card}>
                <View style={styles.founderRow}>
                  <Image source={typeof founder.image === 'string' ? { uri: founder.image } : founder.image} style={styles.founderPhoto} />
                  <View style={{ flex: 1 }}>
                    <Text family="noto-sans" weight="semibold" size={14} color={R.foreground}>{founder.name}</Text>
                    <Text family="noto-sans" weight="semibold" size={11.5} color={Colors.lime} style={{ marginTop: 2 }}>{founder.role}</Text>
                  </View>
                </View>
                <Text family="noto-sans" size={12.5} lineHeight={19} color={R.mutedForeground} style={{ marginTop: 12 }}>{founder.bio}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.eyebrow}>VALORES</Text>
          <Text family="noto-sans" weight="semibold" size={15} color={R.foreground} style={{ marginTop: 4, marginBottom: 12 }}>
            Lo que nos guía
          </Text>
          <View style={{ gap: 10 }}>
            {VALUES.map((value) => (
              <View key={value.number} style={styles.card}>
                <Text family="noto-sans" weight="bold" size={10.5} color={R.limeSoftText} style={styles.eyebrow}>{value.number}</Text>
                <Text family="noto-sans" weight="semibold" size={14} color={R.foreground} style={{ marginTop: 6 }}>{value.title}</Text>
                <Text family="noto-sans" size={12.5} lineHeight={19} color={R.mutedForeground} style={{ marginTop: 4 }}>{value.description}</Text>
              </View>
            ))}
          </View>
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
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  eyebrow: { letterSpacing: 0.6 },
  intro: { marginTop: 2 },
  missionCard: { borderRadius: 16, padding: 16, backgroundColor: R.limeSoftBg, marginTop: 8 },
  section: { marginTop: 6 },
  card: { backgroundColor: R.secondary, borderRadius: 16, padding: 16 },
  founderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  founderPhoto: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: `${Colors.lime}60` },
})
