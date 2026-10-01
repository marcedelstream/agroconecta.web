import { useState } from 'react'
import { LayoutAnimation, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { KARAI_TEXT } from '@/lib/feed-v2/labels'

const V = Colors.v2
const SUGGESTION_WIDTH = 156

// Pantalla inicial de Karai (sin mensajes): título, sugerencias en cuadritos que se deslizan de costado y
// KARAI Campo como una barra chica que se despliega con "Saber más" (review de Marce, 2026-09-30).
export function KaraiIntro({ onAsk, side }: { onAsk: (text: string) => void; side: number }) {
  const { user } = useApp()
  const member = !!user?.isMember
  const [open, setOpen] = useState(false)

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setOpen((o) => !o)
  }

  return (
    <View style={styles.wrap}>
      <Text family="noto-sans" weight="extrabold" size={26} lineHeight={30} color={V.navy} style={styles.title}>{KARAI_TEXT.title}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -side }} contentContainerStyle={[styles.suggestions, { paddingHorizontal: side }]}>
        {KARAI_TEXT.suggestions.map((s) => (
          <TouchableOpacity key={s} onPress={() => onAsk(s)} activeOpacity={0.85} accessibilityRole="button" style={styles.suggestion}>
            <Ionicons name="sparkles-outline" size={16} color={V.limeText} />
            <Text family="noto-sans" weight="semibold" size={14} lineHeight={18} color={V.navy} numberOfLines={3}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.campo}>
        <TouchableOpacity onPress={toggle} activeOpacity={0.85} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.campoBar}>
          <View style={styles.leaf}>
            <Ionicons name="leaf" size={16} color={V.navy} />
          </View>
          <Text family="noto-sans" weight="extrabold" size={15} color={V.white} style={styles.flex}>{KARAI_TEXT.campoEyebrow}</Text>
          <Text family="noto-sans" weight="semibold" size={13} color={V.lime}>{open ? KARAI_TEXT.campoLess : KARAI_TEXT.campoMore}</Text>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={V.lime} />
        </TouchableOpacity>
        {open && (
          <View style={styles.campoBody}>
            <Text family="noto-sans" size={14} lineHeight={20} color={V.feed.textSoft}>{member ? KARAI_TEXT.campoMemberTitle : KARAI_TEXT.campoTitle}</Text>
            <TouchableOpacity
              onPress={() => router.push((member ? '/(main)/mi-campo' : '/(main)/karai-campo') as never)}
              accessibilityRole="button"
              style={styles.campoBtn}
            >
              <Text family="noto-sans" weight="bold" size={14} color={V.navy}>{member ? KARAI_TEXT.campoMemberCta : KARAI_TEXT.campoCta}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  flex: { flex: 1 },
  title: { letterSpacing: -0.6, marginTop: 4 },
  suggestions: { gap: 10 },
  suggestion: { width: SUGGESTION_WIDTH, minHeight: 92, padding: 12, borderRadius: 18, backgroundColor: V.surface, gap: 8 },
  campo: { borderRadius: 18, backgroundColor: V.navy, overflow: 'hidden' },
  campoBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, height: 52 },
  leaf: { width: 30, height: 30, borderRadius: 15, backgroundColor: V.lime, alignItems: 'center', justifyContent: 'center' },
  campoBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 12 },
  campoBtn: { alignSelf: 'flex-start', height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: V.lime, justifyContent: 'center' },
})
