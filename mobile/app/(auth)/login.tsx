import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/lib/app-context'
import { useColors } from '@/lib/theme-context'
import { useTheme } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'

type IconName = React.ComponentProps<typeof Ionicons>['name']
type LoginView = 'options' | 'otp'

export default function LoginScreen() {
  const C = useColors()
  const { isDark } = useTheme()
  const { signInWithGoogle, sendEmailOtp, verifyEmailOtp, resolveProfileForCurrentSession } = useApp()
  const [view, setView] = useState<LoginView>('options')
  const [error, setError] = useState<string | null>(null)

  const [googleLoading, setGoogleLoading] = useState(false)
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)

  const logo = isDark
    ? require('@/assets/images/logo-dark.png')
    : require('@/assets/images/logo-light.png')

  function goToOtp() {
    setOtpStep('request')
    setOtpEmail('')
    setOtpCode('')
    setOtpError(null)
    setView('otp')
  }

  async function afterAuth() {
    const needsOnboarding = await resolveProfileForCurrentSession()
    if (needsOnboarding) {
      router.replace('/(onboarding)')
    } else {
      router.replace('/(main)/(tabs)/home')
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    const result = await signInWithGoogle()
    setGoogleLoading(false)
    if (result) { setError(result); return }
    await afterAuth()
  }

  async function handleSendOtp() {
    if (!otpEmail.includes('@')) {
      setOtpError('Ingresá un email válido.')
      return
    }
    setOtpLoading(true)
    setOtpError(null)
    const result = await sendEmailOtp(otpEmail.trim())
    setOtpLoading(false)
    if (result) { setOtpError(result); return }
    setOtpStep('verify')
  }

  async function handleVerifyOtp() {
    if (otpCode.length < 8) {
      setOtpError('Ingresá el código de 8 dígitos que te enviamos.')
      return
    }
    setOtpLoading(true)
    setOtpError(null)
    const result = await verifyEmailOtp(otpEmail.trim(), otpCode.trim())
    setOtpLoading(false)
    if (result) { setOtpError(result); return }
    await afterAuth()
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.brand}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {view === 'options' && (
          /* ── Opciones ── */
          <View style={styles.options}>
            <AuthBtn
              icon="logo-google"
              label="Continuar con Google"
              onPress={handleGoogle}
              loading={googleLoading}
              C={C}
              primary
            />
            {error && (
              <Text variant="caption" style={{ color: Colors.destructive, textAlign: 'center' }}>{error}</Text>
            )}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
              <Text variant="caption" style={{ color: C.muted }}>o</Text>
              <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
            </View>
            <AuthBtn
              icon="key-outline"
              label="Iniciar sesión con código"
              onPress={goToOtp}
              C={C}
            />
          </View>
        )}

        {view === 'otp' && (
          /* ── Login con código por email ── */
          <View style={styles.form}>
            <View style={styles.formHeader}>
              <TouchableOpacity
                onPress={() => otpStep === 'verify' ? setOtpStep('request') : setView('options')}
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={22} color={C.foreground} />
              </TouchableOpacity>
              <Text variant="body" weight="semibold" family="poppins">
                {otpStep === 'request' ? 'Código por email' : 'Ingresá el código'}
              </Text>
              <View style={{ width: 22 }} />
            </View>

            {otpStep === 'request' ? (
              <>
                <TextInput
                  value={otpEmail}
                  onChangeText={setOtpEmail}
                  placeholder="Correo electrónico"
                  placeholderTextColor={C.muted}
                  style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.foreground }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
                {otpError && (
                  <Text variant="caption" style={{ color: Colors.destructive }}>{otpError}</Text>
                )}
                <Button onPress={handleSendOtp} fullWidth size="lg" loading={otpLoading}>
                  Enviar código
                </Button>
              </>
            ) : (
              <>
                <Text variant="body" style={{ color: C.muted }}>
                  Te enviamos un código a {otpEmail}
                </Text>
                <TextInput
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="Código de 8 dígitos"
                  placeholderTextColor={C.muted}
                  style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.foreground, textAlign: 'center', letterSpacing: 4, fontSize: 20 }]}
                  keyboardType="number-pad"
                  maxLength={8}
                  autoFocus
                />
                {otpError && (
                  <Text variant="caption" style={{ color: Colors.destructive }}>{otpError}</Text>
                )}
                <Button onPress={handleVerifyOtp} fullWidth size="lg" loading={otpLoading}>
                  Verificar
                </Button>
                <TouchableOpacity onPress={handleSendOtp} style={{ alignSelf: 'center' }} disabled={otpLoading}>
                  <Text variant="body" style={{ color: Colors.lime }}>Reenviar código</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {view === 'options' && (
          <Text variant="caption" style={[styles.terms, { color: C.muted }]}>
            Al continuar, aceptás nuestros{' '}
            <Text variant="caption" style={{ color: Colors.lime }} onPress={() => router.push('/legal/terms')}>
              Términos de uso
            </Text>
            {' '}y{' '}
            <Text variant="caption" style={{ color: Colors.lime }} onPress={() => router.push('/legal/privacy')}>
              Política de privacidad
            </Text>
            .
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function AuthBtn({
  icon, label, disabled, loading, onPress, C, primary,
}: {
  icon: IconName
  label: string
  disabled?: boolean
  loading?: boolean
  onPress?: () => void
  C: ReturnType<typeof useColors>
  primary?: boolean
}) {
  return (
    <TouchableOpacity
      style={[
        styles.authBtn,
        {
          backgroundColor: primary ? Colors.lime : C.surface,
          borderColor: primary ? Colors.lime : C.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={primary ? '#0A0A13' : C.foreground} />
      ) : (
        <Ionicons name={icon} size={20} color={primary ? '#0A0A13' : C.foreground} />
      )}
      <Text
        variant="body"
        weight="semibold"
        style={{ flex: 1, color: primary ? '#0A0A13' : C.foreground }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[10],
    gap: Spacing[8],
  },
  brand: { alignItems: 'center', gap: Spacing[3] },
  logo: { width: 180, height: 56 },
  options: { gap: Spacing[3] },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[1],
  },
  dividerLine: { flex: 1, height: 1 },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing[3],
  },
  terms: { textAlign: 'center', paddingHorizontal: Spacing[2] },
  // Form
  form: { gap: Spacing[4] },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    fontSize: 16,
    fontFamily: Fonts.dmSans,
  },
})
