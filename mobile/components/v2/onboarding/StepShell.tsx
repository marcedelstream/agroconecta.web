import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { ONBOARDING_TEXT } from '@/lib/feed-v2/labels'

interface Props {
  progress: number
  title: string
  body?: string
  primaryLabel: string
  primaryDisabled?: boolean
  busy?: boolean
  onPrimary: () => void
  onBack?: () => void
  onSkip?: () => void
  children?: React.ReactNode
}

// Marco de cada paso: barra de progreso arriba, un solo concepto por pantalla, botón grande abajo y
// "Saltar" en los opcionales (ONBOARDING-V2.md, reglas de UX).
export function StepShell({ progress, title, body, primaryLabel, primaryDisabled, busy, onPrimary, onBack, onSkip, children }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} disabled={!onBack} accessibilityRole="button" accessibilityLabel={ONBOARDING_TEXT.back} style={[styles.icon, !onBack && styles.hidden]}>
          <Ionicons name="chevron-back" size={22} color={Colors.v2.navy} />
        </TouchableOpacity>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <TouchableOpacity onPress={onSkip} disabled={!onSkip} accessibilityRole="button" style={[styles.skip, !onSkip && styles.hidden]}>
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.limeText}>{ONBOARDING_TEXT.skip}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text family="noto-sans" weight="extrabold" size={30} lineHeight={34} color={Colors.v2.navy} style={styles.title}>{title}</Text>
        {body ? <Text family="noto-sans" size={16} lineHeight={23} color={Colors.v2.muted}>{body}</Text> : null}
        <View style={styles.children}>{children}</View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          onPress={onPrimary}
          disabled={primaryDisabled || busy}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled: primaryDisabled || busy }}
          style={[styles.primary, (primaryDisabled || busy) && styles.primaryOff]}
        >
          {busy ? <ActivityIndicator color={Colors.v2.navy} /> : (
            <Text family="noto-sans" weight="bold" size={17} color={Colors.v2.navy}>{primaryLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
  icon: { width: V2Layout.minTouch, height: V2Layout.minTouch, alignItems: 'center', justifyContent: 'center' },
  hidden: { opacity: 0 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Colors.v2.light.segTrack, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: Colors.v2.lime },
  skip: { minHeight: V2Layout.minTouch, minWidth: 56, alignItems: 'flex-end', justifyContent: 'center' },
  content: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 24, gap: 10 },
  title: { letterSpacing: -0.8 },
  children: { marginTop: 14 },
  footer: { paddingHorizontal: 22, paddingTop: 10 },
  primary: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center' },
  primaryOff: { opacity: 0.45 },
})
