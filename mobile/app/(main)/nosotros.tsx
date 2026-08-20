import { useState } from 'react'
import { ScrollView, View, Image, TouchableOpacity, Modal, Pressable, StyleSheet, type ImageSourcePropType } from 'react-native'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

const R = Colors.redesign

interface Founder {
  name: string
  role: string
  shortRole: string
  image: string | ImageSourcePropType
  bio: string
}

const FOUNDERS: Founder[] = [
  {
    name: 'Marcelo Escobar',
    role: 'Co-fundador y Director de Tecnología',
    shortRole: 'Tecnología',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1733840528665-XXvTjaen2eV0PgjrVk2FqdPzy3XVoD.jpeg',
    bio: 'Lidera el desarrollo tecnológico y la visión estratégica de Agroconecta, conectando producto, operación y modelo de negocio para construir herramientas útiles para el sector agropecuario paraguayo.',
  },
  {
    name: 'Marlene Fernández',
    role: 'Co-fundadora y Directora de Comunicación',
    shortRole: 'Comunicación',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-03-23%20at%2010.53.16-Q322FxX2EnEsc2L66VwEACBjsTqvsp.jpeg',
    bio: 'Encabeza la estrategia de comunicación y contenidos, acercando el ecosistema a productores, instituciones, marcas y profesionales que necesitan información clara y segmentada.',
  },
  {
    name: 'Fiorella Riveros',
    role: 'Directora de Sostenibilidad',
    shortRole: 'Sostenibilidad',
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
  const [activeFounder, setActiveFounder] = useState<Founder | null>(null)

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={[styles.headerWrap, { backgroundColor: R.header.bg }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Nosotros</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.hero}>
          <Text family="noto-sans" weight="bold" size={10} color={Colors.lime} style={styles.heroEyebrow}>
            AGROCONECTA · PARAGUAY
          </Text>
          <Text family="noto-sans" weight="extrabold" size={24} lineHeight={31} color="#FFFFFF" style={styles.heroTitle}>
            El ecosistema digital agropecuario de Paraguay
          </Text>
          <Text family="noto-sans" size={13} lineHeight={20} color={R.header.mutedText} style={styles.heroSubtitle}>
            Plataformas propias para que el agro se informe, se conecte y haga negocios.
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View>
          <Text family="noto-sans" weight="semibold" size={10} color={R.mutedForeground2} style={styles.sectionEyebrow}>MISIÓN</Text>
          <Text family="noto-sans" weight="bold" size={17} lineHeight={24} color={R.foreground} style={styles.sectionHeading}>
            Tecnología construida desde adentro del campo.
          </Text>
          <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={styles.paragraph}>
            Buscamos conectar a todo el sector agropecuario paraguayo — productores, técnicos,
            instituciones y marcas — en un mismo lugar, simple y pensado para el día a día del campo.
          </Text>
        </View>

        <View style={styles.divider} />

        <View>
          <Text family="noto-sans" weight="semibold" size={10} color={R.mutedForeground2} style={styles.sectionEyebrow}>VISIÓN</Text>
          <Text family="noto-sans" weight="bold" size={17} lineHeight={24} color={R.foreground} style={styles.sectionHeading}>
            Ser la plataforma oficial del agro paraguayo
          </Text>
          <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={styles.paragraph}>
            Soñamos con ser el punto de encuentro natural de todo el sector: un espacio confiable donde
            cualquiera que trabaje en el campo pueda informarse, conectarse y crecer.
          </Text>
          <Text family="noto-sans" size={13.5} lineHeight={21} color={R.mutedForeground} style={styles.paragraphSecond}>
            Lo hacemos ordenando la información, amplificando instituciones, acercando eventos y
            conectando mejor a productores, profesionales, marcas y organizaciones.
          </Text>
        </View>

        <View style={styles.divider} />

        <View>
          <Text family="noto-sans" weight="semibold" size={10} color={R.mutedForeground2} style={styles.sectionEyebrow}>EQUIPO DIRECTIVO</Text>
          <View style={styles.founderGrid}>
            {FOUNDERS.map((founder) => (
              <View key={founder.name} style={styles.founderTile}>
                <View style={styles.founderPhotoWrap}>
                  <Image
                    source={typeof founder.image === 'string' ? { uri: founder.image } : founder.image}
                    style={styles.founderPhoto}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.founderInfoBtn}
                    onPress={() => setActiveFounder(founder)}
                    hitSlop={8}
                  >
                    <Ionicons name="information-circle" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text family="noto-sans" weight="bold" size={12.5} lineHeight={16} color={R.foreground} style={styles.founderName}>
                  {founder.name}
                </Text>
                <Text family="noto-sans" size={11} lineHeight={15} color={R.mutedForeground}>{founder.shortRole}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View>
          <Text family="noto-sans" weight="semibold" size={10} color={R.mutedForeground2} style={styles.sectionEyebrow}>LO QUE NOS GUÍA</Text>
          <View style={styles.valuesList}>
            {VALUES.map((value, i) => (
              <View key={value.number} style={[styles.valueRow, i === VALUES.length - 1 && styles.valueRowLast]}>
                <Text family="noto-sans" weight="bold" size={11.5} color={R.limeSoftText} style={styles.valueNumber}>{value.number}</Text>
                <View style={{ flex: 1 }}>
                  <Text family="noto-sans" weight="bold" size={13.5} color={R.foreground}>{value.title}</Text>
                  <Text family="noto-sans" size={12.5} lineHeight={19} color={R.mutedForeground} style={{ marginTop: 3 }}>
                    {value.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={!!activeFounder} transparent animationType="fade" onRequestClose={() => setActiveFounder(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setActiveFounder(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {activeFounder && (
              <View style={styles.modalBody}>
                <View style={styles.modalHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text family="noto-sans" weight="bold" size={16} color={R.foreground}>{activeFounder.name}</Text>
                    <Text family="noto-sans" weight="semibold" size={12} color={Colors.lime} style={{ marginTop: 2 }}>
                      {activeFounder.role}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setActiveFounder(null)} hitSlop={10}>
                    <Ionicons name="close" size={22} color={R.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <Text family="noto-sans" size={13} lineHeight={20} color={R.mutedForeground} style={{ marginTop: 12 }}>
                  {activeFounder.bio}
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: { borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  hero: { padding: 20, paddingTop: 22 },
  heroEyebrow: { letterSpacing: 1 },
  heroTitle: { marginTop: 10 },
  heroSubtitle: { marginTop: 10 },
  content: { padding: 20, paddingBottom: 40 },
  sectionEyebrow: { letterSpacing: 0.7 },
  sectionHeading: { marginTop: 8 },
  paragraph: { marginTop: 10 },
  paragraphSecond: { marginTop: 8 },
  divider: { height: 1, backgroundColor: R.divider, marginVertical: 24 },
  founderGrid: { flexDirection: 'row', gap: 12, marginTop: 14 },
  founderTile: { width: 108 },
  founderPhotoWrap: { width: 108, height: 108, borderRadius: 12, overflow: 'hidden' },
  founderPhoto: { width: 108, height: 108, backgroundColor: R.secondary },
  founderInfoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(10,10,19,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  founderName: { marginTop: 8 },
  valuesList: { marginTop: 14 },
  valueRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: R.divider,
  },
  valueRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  valueNumber: { width: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: R.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalBody: { padding: 20 },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
})
