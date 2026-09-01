'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

type View = 'options' | 'otp-request' | 'otp-verify' | 'password'

export function KaraiLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/karai'

  const [view, setView] = useState<View>('options')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function afterLogin() {
    router.push(redirect)
    router.refresh()
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    const supabase = createSupabaseBrowser()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('redirect_to', redirect)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
    if (authError) {
      setGoogleLoading(false)
      setError(authError.message)
    }
    // Si no hay error, el navegador ya está siendo redirigido a Google — no hace falta setLoading(false).
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) { setError('Ingresá un email válido.'); return }
    setError(null)
    setLoading(true)
    const supabase = createSupabaseBrowser()
    const { error: authError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    setView('otp-verify')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length < 6) { setError('Ingresá el código que te enviamos por email.'); return }
    setError(null)
    setLoading(true)
    const supabase = createSupabaseBrowser()
    const { error: authError } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' })
    setLoading(false)
    if (authError) { setError(authError.message); return }
    afterLogin()
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@') || password.length < 6) {
      setError('Ingresá tu email y contraseña de Agroconecta.')
      return
    }
    setError(null)
    setLoading(true)
    const supabase = createSupabaseBrowser()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) { setError('Credenciales incorrectas. Verificá tu email y contraseña.'); return }
    afterLogin()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-9">
          <div className="flex justify-center mb-5">
            <Logo width={140} height={40} className="h-8 w-auto" />
          </div>
          <h1 className="font-display font-semibold text-2xl text-foreground">Karai</h1>
          <p className="text-muted text-sm mt-1.5">Ingresá con tu cuenta de Agroconecta</p>
        </div>

        {view === 'options' && (
          <div className="flex flex-col gap-2.5">
            <button onClick={() => { setError(null); setView('otp-request') }} className="btn-primary w-full">
              Continuar con código por email
            </button>
            <button onClick={handleGoogle} disabled={googleLoading} className="btn w-full">
              {googleLoading ? 'Redirigiendo a Google...' : 'Continuar con Google'}
            </button>
            <button onClick={() => { setError(null); setView('password') }} className="btn w-full">
              Continuar con contraseña
            </button>
            {error && <p className="text-danger text-sm text-center mt-1">{error}</p>}
          </div>
        )}

        {view === 'otp-request' && (
          <form onSubmit={handleSendOtp} className="card flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-muted">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input"
                autoFocus
              />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
            <button type="button" onClick={() => setView('options')} className="text-muted text-sm text-center">
              Volver
            </button>
          </form>
        )}

        {view === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="card flex flex-col gap-4">
            <p className="text-muted text-sm">Te enviamos un código a {email}</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código"
              className="input text-center tracking-[0.3em]"
              inputMode="numeric"
              autoFocus
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
            <button type="button" onClick={() => setView('otp-request')} className="text-muted text-sm text-center">
              Volver
            </button>
          </form>
        )}

        {view === 'password' && (
          <form onSubmit={handlePasswordLogin} className="card flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw-email" className="text-sm text-muted">Email</label>
              <input
                id="pw-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw" className="text-sm text-muted">Contraseña</label>
              <input
                id="pw"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button type="button" onClick={() => setView('options')} className="text-muted text-sm text-center">
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
