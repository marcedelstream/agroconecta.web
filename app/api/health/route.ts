import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const HEALTH_TIMEOUT_MS = 2500

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const result = {
    ok: true,
    node: process.version,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(url),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(anonKey),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceRoleKey),
    },
    supabase: 'not_checked' as 'not_checked' | 'ok' | string,
  }

  if (!url || !anonKey) {
    return NextResponse.json(
      { ...result, ok: false, supabase: 'missing_public_env' },
      { status: 500 },
    )
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch: fetchWithTimeout },
    })
    const { error } = await supabase.from('posts').select('id').limit(1)
    result.supabase = error ? error.message : 'ok'
    result.ok = !error
  } catch (error) {
    result.ok = false
    result.supabase = error instanceof Error ? error.message : 'unknown_error'
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 500 })
}
