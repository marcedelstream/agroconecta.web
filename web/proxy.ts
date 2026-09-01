import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

function isAgroAdminRole(role: unknown) {
  return role === 'admin' || role === 'agro_admin'
}

const KARAI_HOST_PREFIX = 'karai.'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') ?? ''
  const isKaraiHost = host.startsWith(KARAI_HOST_PREFIX)

  // En karai.agroconecta.com.py servimos las mismas rutas de web/app/karai/* pero sin el prefijo
  // /karai en la URL visible — mismo deploy de Vercel (Root Directory sigue siendo `web`), solo
  // se agrega el dominio como alias y acá lo reescribimos server-side.
  let effectivePathname = pathname
  let needsRewrite = false
  if (
    isKaraiHost &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/karai') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/auth')
  ) {
    effectivePathname = pathname === '/' ? '/karai' : `/karai${pathname}`
    needsRewrite = true
  }

  function pass() {
    return needsRewrite ? NextResponse.rewrite(new URL(effectivePathname, request.url)) : NextResponse.next()
  }

  const isAdminPath = effectivePathname.startsWith('/admin')
  const isKaraiPath = effectivePathname.startsWith('/karai')
  if (!isAdminPath && !isKaraiPath) return pass()

  const isLoginPage = effectivePathname === '/admin/login' || effectivePathname === '/karai/login'
  if (isLoginPage) return pass()

  const response = pass()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set({ name, value, ...(options as Record<string, unknown>) })
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const loginPath = isAdminPath ? '/admin/login' : isKaraiHost ? '/login' : '/karai/login'

  if (!session) {
    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set('redirect', isKaraiHost ? pathname : effectivePathname)
    return NextResponse.redirect(loginUrl)
  }

  // Karai es para cualquier usuario autenticado de Agroconecta (Starter, gratis) — a diferencia
  // del admin, acá no hace falta el rol agro_admin/admin.
  if (isAdminPath && !isAgroAdminRole(session.user.app_metadata?.role)) {
    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
