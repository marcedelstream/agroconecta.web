import { createClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_EVENTOS_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_EVENTOS_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('Eventos Supabase env vars missing.')
}

export const supabaseEvents = createClient(
  url ?? 'https://example.supabase.co',
  key ?? 'missing-anon-key',
)
