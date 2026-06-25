import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_TIMEOUT_MS = 2500

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS)
  const upstreamSignal = init?.signal

  if (upstreamSignal?.aborted) {
    controller.abort(upstreamSignal.reason)
  } else {
    upstreamSignal?.addEventListener('abort', () => controller.abort(upstreamSignal.reason), { once: true })
  }

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch {
            // Server Components can read cookies but cannot always write them.
          }
        },
      },
    }
  )
}
