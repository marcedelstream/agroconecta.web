'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { WHATSAPP_URL } from '@/lib/social-links'

type View = 'initial' | 'otp-verify' | 'password'

const inputClass =
  'w-full bg-[var(--k-bg)] border border-[var(--k-border-strong)] rounded-xl px-3.5 py-3 text-[var(--k-text)] text-sm font-medium outline-none transition-colors focus:border-[var(--k-lime)] placeholder:text-[var(--k-muted-3)]'

const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-[var(--k-muted-2)]'

export function KaraiLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/karai'

  const [view, setView] = useState<View>('initial')
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
    <div className="h-screen flex overflow-hidden bg-[var(--k-bg)] text-[var(--k-text)]">
      <div className="hidden md:flex flex-1 min-w-0 flex-col justify-between p-11 bg-[var(--k-sidebar)] border-r border-[var(--k-border)]">
        <p className="text-[15px] font-extrabold text-[var(--k-text)]">Agroconecta</p>
        <div className="flex flex-col gap-[18px] max-w-[420px]">
          <Image src="/karai-avatar.png" alt="Karai" width={76} height={76} className="rounded-[24px] block" />
          <h1 className="text-[34px] leading-[1.15] font-extrabold tracking-[-0.03em] text-[var(--k-text)] text-balance">
            La IA oficial del agro paraguayo, hablando tu idioma.
          </h1>
          <p className="text-[15px] leading-relaxed font-medium text-[var(--k-muted)] text-balance">
            Precios, clima, noticias y los datos de tu finca en un solo lugar. Contale a Karai lo que pasa en el campo y él ordena el resto.
          </p>
        </div>
        <p className="text-xs font-medium text-[var(--k-muted-4)]">Ganadería · Agricultura · Mercado · Clima</p>
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[376px] flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3.5 text-center">
            <Image src="/karai-avatar.png" alt="Karai" width={60} height={60} className="rounded-[20px] block" />
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[23px] font-extrabold tracking-[-0.02em] text-[var(--k-text)]">Ingresá a Karai</h2>
              <p className="text-[13.5px] font-medium text-[var(--k-muted)]">Con tu cuenta de miembro de Agroconecta</p>
            </div>
          </div>

          {view === 'initial' && (
            <div className="flex flex-col gap-4 bg-[var(--k-card)] border border-[var(--k-border-strong)] rounded-[20px] p-[22px]">
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClass}
                    autoFocus
                  />
                </div>
                {error && <p className="text-[var(--k-negative)] text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] border-none text-[#0A1424] rounded-xl py-3 text-sm font-bold cursor-pointer transition-colors disabled:opacity-60"
                >
                  {loading ? 'Enviando...' : 'Enviar código por email'}
                </button>
              </form>

              <div className="flex items-center gap-3">
                <span className="flex-1 h-px bg-[var(--k-border-strong)]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--k-muted-4)]">o</span>
                <span className="flex-1 h-px bg-[var(--k-border-strong)]" />
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full bg-[#111C31] hover:border-[var(--k-border-hover)] border border-[var(--k-border-strong)] text-[var(--k-text)] rounded-xl py-3 text-[13.5px] font-semibold cursor-pointer transition-colors disabled:opacity-60"
                >
                  {googleLoading ? 'Redirigiendo a Google...' : 'Continuar con Google'}
                </button>
                <button
                  onClick={() => { setError(null); setView('password') }}
                  className="w-full bg-transparent hover:border-[var(--k-border-hover)] hover:text-[var(--k-text)] border border-[var(--k-border-strong)] text-[var(--k-muted)] rounded-xl py-3 text-[13.5px] font-semibold cursor-pointer transition-colors"
                >
                  Usar mi contraseña
                </button>
              </div>
            </div>
          )}

          {view === 'otp-verify' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 bg-[var(--k-card)] border border-[var(--k-border-strong)] rounded-[20px] p-[22px]">
              <p className="text-[var(--k-muted)] text-sm">Te enviamos un código a {email}</p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código"
                className={`${inputClass} text-center tracking-[0.3em] font-[family-name:var(--font-karai-mono)]`}
                inputMode="numeric"
                autoFocus
              />
              {error && <p className="text-[var(--k-negative)] text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] border-none text-[#0A1424] rounded-xl py-3 text-sm font-bold cursor-pointer transition-colors disabled:opacity-60"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
              <button type="button" onClick={() => setView('initial')} className="text-[var(--k-muted-2)] hover:text-[var(--k-text)] text-sm text-center transition-colors">
                Volver
              </button>
            </form>
          )}

          {view === 'password' && (
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4 bg-[var(--k-card)] border border-[var(--k-border-strong)] rounded-[20px] p-[22px]">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pw-email" className={labelClass}>Email</label>
                <input
                  id="pw-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pw" className={labelClass}>Contraseña</label>
                <input
                  id="pw"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              {error && <p className="text-[var(--k-negative)] text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--k-lime)] hover:bg-[var(--k-lime-hover)] border-none text-[#0A1424] rounded-xl py-3 text-sm font-bold cursor-pointer transition-colors disabled:opacity-60"
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
              <button type="button" onClick={() => { setError(null); setView('initial') }} className="text-[var(--k-muted-2)] hover:text-[var(--k-text)] text-sm text-center transition-colors">
                Volver
              </button>
            </form>
          )}

          <p className="text-center text-[11.5px] leading-relaxed font-medium text-[var(--k-muted-4)]">
            Karai es exclusivo para miembros activos. ¿Todavía no sos miembro?{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--k-lime)] hover:text-[var(--k-lime-hover)]">
              Escribinos por WhatsApp
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
