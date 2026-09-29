import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { PUBLISH_INFO_TEXT as T } from '@/lib/feed-v2/labels'

const V = Colors.v2

// Botón "+" para quien todavía no es una organización con plan: qué es publicar en Agroconecta y cómo
// sumarse. El plan de organizaciones se contrata con el equipo, por fuera de la app.
export default function PublicarInfoScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <V2ScreenHeader title={T.title} subtitle={T.subtitle} />
        <View style={styles.body}>
          <View style={styles.card}>
            {T.points.map((p) => (
              <View key={p.title} style={styles.point}>
                <View style={styles.icon}>
                  <Ionicons name={p.icon} size={20} color={V.limeTintText} />
                </View>
                <View style={styles.flex}>
                  <Text family="noto-sans" weight="bold" size={16} color={V.navy}>{p.title}</Text>
                  <Text family="noto-sans" size={14} lineHeight={20} color={V.muted}>{p.body}</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => router.replace('/(main)/contacto' as never)} accessibilityRole="button" style={styles.cta}>
            <Text family="noto-sans" weight="bold" size={16} color={V.white}>{T.cta}</Text>
          </TouchableOpacity>
          <Text family="noto-sans" size={13} lineHeight={19} color={V.muted} style={styles.center}>{T.already}</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  flex: { flex: 1, gap: 2 },
  center: { textAlign: 'center' },
  body: { paddingHorizontal: 18, gap: 16 },
  card: { backgroundColor: V.surface, borderRadius: 22, padding: 18, gap: 18 },
  point: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: V.limeTint, alignItems: 'center', justifyContent: 'center' },
  cta: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: V.navy, alignItems: 'center', justifyContent: 'center' },
})
