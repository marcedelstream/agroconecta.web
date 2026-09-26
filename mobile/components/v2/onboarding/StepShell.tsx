import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInRight } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { ONBOARDING_TEXT } from '@/lib/feed-v2/labels'

interface Props {
  /** Paso actual (desde 1) y total, para la barra y el "Paso 3 de 12". */
  step: number
  total: number
  title: string
  body?: string
  primaryLabel: string
  primaryDisabled?: boolean
  busy?: boolean
  onPrimary: () => void
  onBack?: () => void
  onSkip?: () => void
  /** Pantalla de bienvenida: sin barra de progreso ni contador, con el contenido protagonista. */
  hero?: boolean
  /** Ilustración que va arriba del título (solo en la bienvenida). */
  heroContent?: React.ReactNode
  children?: React.ReactNode
}

// Marco de cada paso del onboarding v2: fondo blanco, un concepto por pantalla, barra de progreso por
// segmentos, botón grande abajo y "Saltar" en los opcionales (ONBOARDING-V2.md, reglas de UX).
export function StepShell({ step, total, title, body, primaryLabel, primaryDisabled, busy, onPrimary, onBack, onSkip, hero, heroContent, children }: Props) {
  const insets = useSafeAreaInsets()
  const disabled = primaryDisabled || busy
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {!hero && (
        <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onBack} disabled={!onBack} accessibilityRole="button" accessibilityLabel={ONBOARDING_TEXT.back} style={[styles.icon, !onBack && styles.hidden]}>
            <Ionicons name="chevron-back" size={24} color={Colors.v2.navy} />
          </TouchableOpacity>
          <View style={styles.segments} accessibilityLabel={ONBOARDING_TEXT.stepOf(step, total)}>
            {Array.from({ length: total }, (_, i) => (
              <View key={i} style={[styles.segment, i < step && styles.segmentOn]} />
            ))}
          </View>
          <TouchableOpacity onPress={onSkip} disabled={!onSkip} accessibilityRole="button" style={[styles.skip, !onSkip && styles.hidden]}>
            <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.limeText}>{ONBOARDING_TEXT.skip}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, hero && { paddingTop: insets.top + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* La clave hace que cada paso entre con una transición suave desde la derecha. */}
        <Animated.View key={step} entering={FadeInRight.duration(260)} style={styles.inner}>
          {heroContent}
          {!hero && (
            <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.limeText} style={styles.counter}>
              {ONBOARDING_TEXT.stepOf(step, total).toUpperCase()}
            </Text>
          )}
          <Text family="noto-sans" weight="extrabold" size={hero ? 34 : 30} lineHeight={hero ? 39 : 35} color={Colors.v2.navy} style={[styles.title, hero && styles.center]}>
            {title}
          </Text>
          {body ? (
            <Text family="noto-sans" size={17} lineHeight={25} color={Colors.v2.muted} style={hero && styles.center}>{body}</Text>
          ) : null}
          <View style={styles.children}>{children}</View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          onPress={onPrimary}
          disabled={disabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          style={[styles.primary, disabled && styles.primaryOff]}
        >
          {busy ? (
            <ActivityIndicator color={Colors.v2.navy} />
          ) : (
            <>
              <Text family="noto-sans" weight="bold" size={17} color={disabled ? Colors.v2.muted : Colors.v2.navy}>{primaryLabel}</Text>
              <Ionicons name="arrow-forward" size={20} color={disabled ? Colors.v2.muted : Colors.v2.navy} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.surface },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  icon: { width: V2Layout.minTouch, height: V2Layout.minTouch, alignItems: 'center', justifyContent: 'center' },
  hidden: { opacity: 0 },
  segments: { flex: 1, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Colors.v2.light.segTrack },
  segmentOn: { backgroundColor: Colors.v2.lime },
  skip: { minHeight: V2Layout.minTouch, minWidth: 56, alignItems: 'flex-end', justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, flexGrow: 1 },
  inner: { gap: 10 },
  counter: { letterSpacing: 1 },
  title: { letterSpacing: -0.8 },
  center: { textAlign: 'center' },
  children: { marginTop: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: Colors.v2.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.v2.light.inputBorder },
  primary: {
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.v2.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.v2.lime,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryOff: { backgroundColor: Colors.v2.light.segTrack, shadowOpacity: 0, elevation: 0 },
})
