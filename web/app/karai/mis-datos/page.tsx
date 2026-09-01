import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { ExtractedFarmData } from '@/lib/karai/farm-extraction'
import { FarmProfileForm } from './FarmProfileForm'

export default async function MisDatosPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/karai/login')

  // RLS (auth.uid() = profile_id) ya restringe esto a la fila propia — el filtro explícito es
  // solo legibilidad, no la única barrera.
  const { data } = await supabase.from('farm_profile').select('data').eq('profile_id', user.id).maybeSingle()
  const initialData = (data?.data ?? {}) as ExtractedFarmData

  return (
    <div className="min-h-screen px-5 py-6">
      <div className="max-w-lg mx-auto">
        <Link href="/karai" className="text-muted text-sm hover:text-foreground transition-colors">
          ← Volver al chat
        </Link>

        <div className="mt-4 mb-6">
          <h1 className="font-display font-bold text-xl text-foreground">Mis datos</h1>
          <p className="text-muted text-sm mt-1">
            Esto es lo que Karai fue anotando de tu finca a partir de tus mensajes. Es solo tuyo — nadie
            más lo puede ver, y lo podés corregir cuando quieras.
          </p>
        </div>

        <FarmProfileForm initialData={initialData} />
      </div>
    </div>
  )
}
