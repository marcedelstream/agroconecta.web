import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { useApp } from '@/lib/app-context'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { Colors } from '@/constants/colors'

export default function LoginScreen() {
  const C = useColors()
  const { signIn, signUp } = useApp()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!email.includes('@') || password.length < 6) {
      setError('Ingresa un email valido y una contrasena de al menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError(null)
    const result = mode === 'login' ? await signIn(email.trim(), password) : await signUp(email.trim(), password)
    setLoading(false)
    if (result) {
      setError(result)
      return
    }
    router.replace('/(onboarding)')
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text variant="display" weight="bold" family="poppins" color={Colors.lime}>
          Agroconecta
        </Text>
        <Text variant="body" style={{ color: C.muted }}>
          {mode === 'login' ? 'Inicia sesion para entrar a tu comunidad agro.' : 'Crea tu cuenta para configurar tu feed segmentado.'}
        </Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={C.muted}
            style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.foreground }]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contrasena"
            placeholderTextColor={C.muted}
            style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.foreground }]}
            secureTextEntry
          />
          {error && <Text variant="caption" style={{ color: Colors.destructive }}>{error}</Text>}
          <Button onPress={submit} fullWidth size="lg" loading={loading}>
            {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </View>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}>
          <Text variant="body" color={Colors.lime}>
            {mode === 'login' ? 'No tengo cuenta, registrarme' : 'Ya tengo cuenta, iniciar sesion'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: Spacing[6], gap: Spacing[5] },
  form: { gap: Spacing[3] },
  input: {
    borderWidth: 1,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    fontSize: 16,
  },
})
