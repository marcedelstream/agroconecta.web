import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'

const OTP_TYPES = new Set(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'])

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return Boolean(value && OTP_TYPES.has(value))
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const redirectTo = requestUrl.searchParams.get('redirect_to') ?? '/admin'
  const response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin))

  if (!code && !(tokenHash && isEmailOtpType(type))) {
    const loginUrl = new URL('/admin/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'verification')
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          })
        },
      },
    }
  )

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: type!,
      })

  if (error) {
    const loginUrl = new URL('/admin/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'verification')
    return NextResponse.redirect(loginUrl)
  }

  return response
}
