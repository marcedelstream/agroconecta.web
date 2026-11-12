import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { CONSENT_AI, CONSENT_FARM, getConsentState, type ConsentState } from '@/lib/karai/consents'
import type { ExtractedFarmData } from '@/lib/karai/farm-extraction'
import { MisDatosClient } from './MisDatosClient'

export default async function MisDatosPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/karai/login')

  // RLS (auth.uid() = profile_id) ya restringe esto a la fila propia — el filtro explícito es
  // solo legibilidad, no la única barrera.
  const [{ data: farmRow }, { data: profile }, { data: leads }] = await Promise.all([
    supabase.from('farm_profile').select('data').eq('profile_id', user.id).maybeSingle(),
    supabase.from('profiles').select('name,created_at').eq('id', user.id).maybeSingle(),
    supabase.from('karai_leads').select('id,excerpt,status,created_at').eq('profile_id', user.id).order('created_at', { ascending: false }),
  ])

  const initialData = (farmRow?.data ?? {}) as ExtractedFarmData
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : null

  // `consents` solo tiene policy de lectura si se corrió fix-v2-onboarding.sql, así que se lee con el
  // cliente admin — acotado al user.id de la sesión ya validada arriba.
  let consents: { ai: ConsentState; campo: ConsentState } = { ai: 'none', campo: 'none' }
  try {
    const admin = createSupabaseAdmin()
    const [ai, campo] = await Promise.all([
      getConsentState(admin, user.id, CONSENT_AI),
      getConsentState(admin, user.id, CONSENT_FARM),
    ])
    consents = { ai, campo }
  } catch (err) {
    console.error('mis-datos: no se pudo leer consents:', err)
  }

  return (
    <MisDatosClient
      initialData={initialData}
      profileName={profile?.name ?? null}
      memberSince={memberSince}
      leads={leads ?? []}
      consents={consents}
    />
  )
}
