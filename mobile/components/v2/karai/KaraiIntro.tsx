import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { KARAI_TEXT } from '@/lib/feed-v2/labels'

const RING = 130

// Pantalla inicial de Karai (sin mensajes): sugerencias + tarjeta KARAI Campo (README §3.4).
export function KaraiIntro({ onAsk }: { onAsk: (text: string) => void }) {
  const { user } = useApp()
  const member = !!user?.isMember
  const campo = () => router.push((member ? '/(main)/mi-campo' : '/(main)/karai-campo') as never)

  return (
    <View style={styles.wrap}>
      {KARAI_TEXT.suggestions.map((s) => (
        <TouchableOpacity key={s} onPress={() => onAsk(s)} activeOpacity={0.85} accessibilityRole="button" style={styles.suggestion}>
          <Ionicons name="sparkles-outline" size={18} color={Colors.v2.limeText} />
          <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy} style={styles.flex}>{s}</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.v2.muted} />
        </TouchableOpacity>
      ))}
      <View style={styles.campo}>
        <View style={styles.ring} />
        <Text family="noto-sans" weight="bold" size={11} color={Colors.v2.lime} style={styles.eyebrow}>{KARAI_TEXT.campoEyebrow}</Text>
        <Text family="noto-sans" weight="extrabold" size={21} lineHeight={25} color={Colors.v2.white} style={styles.campoTitle}>{member ? KARAI_TEXT.campoMemberTitle : KARAI_TEXT.campoTitle}</Text>
        <TouchableOpacity onPress={campo} accessibilityRole="button" style={styles.campoBtn}>
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy}>{member ? KARAI_TEXT.campoMemberCta : KARAI_TEXT.campoCta}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  flex: { flex: 1 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingHorizontal: 16, borderRadius: 18, backgroundColor: Colors.v2.surface },
  campo: { marginTop: 10, borderRadius: 24, backgroundColor: Colors.v2.navy, padding: 22, gap: 10, overflow: 'hidden' },
  ring: { position: 'absolute', right: -30, top: -52, width: RING, height: RING, borderRadius: RING / 2, borderWidth: 16, borderColor: Colors.v2.lime, opacity: 0.9 },
  eyebrow: { letterSpacing: 1.1 },
  campoTitle: { maxWidth: 250 },
  campoBtn: { alignSelf: 'flex-start', marginTop: 6, height: 46, paddingHorizontal: 20, borderRadius: 23, backgroundColor: Colors.v2.lime, justifyContent: 'center' },
})
