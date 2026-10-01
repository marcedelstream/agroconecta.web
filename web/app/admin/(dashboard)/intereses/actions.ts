'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'
import { backWithError, backWithOk } from '@/lib/admin-feedback'
import { slugify } from '@/lib/seo'
import { INTEREST_KINDS, type InterestKind } from '@/lib/interest-options'

const PATH = '/admin/intereses'
const KINDS = INTEREST_KINDS.map((k) => k.value)

async function requireAdmin() {
  if (!(await getAuthContext())) throw new Error('No tenés permiso para editar intereses.')
}

const back = (kind: string) => `${PATH}?tipo=${kind}`

export async function createInterest(formData: FormData) {
  await requireAdmin()
  const kind = String(formData.get('kind') ?? '') as InterestKind
  const label = String(formData.get('label') ?? '').trim()
  const parent = String(formData.get('parent') ?? '').trim() || null
  if (!KINDS.includes(kind) || label.length < 2) backWithError(back(kind || 'rubro'), 'Escribí el nombre de la opción.')
  if (kind === 'produccion' && !parent) backWithError(back(kind), 'Elegí a qué rubro pertenece.')
  const value = slugify(label)
  if (!value) backWithError(back(kind), 'El nombre tiene que tener letras o números.')

  const db = createSupabaseAdmin()
  const { count } = await db.from('interest_options').select('id', { count: 'exact', head: true }).eq('kind', kind)
  const { error } = await db.from('interest_options').insert({ kind, value, label, parent: kind === 'produccion' ? parent : null, position: (count ?? 0) + 1 })
  if (error?.code === '23505') backWithError(back(kind), `Ya existe una opción "${label}". Si está oculta, volvé a mostrarla.`)
  if (error) backWithError(back(kind), `No se pudo agregar: ${error.message}`)
  revalidatePath(PATH)
  backWithOk(back(kind), `"${label}" agregada. Ya aparece en la app.`)
}

export async function renameInterest(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const kind = String(formData.get('kind') ?? 'rubro')
  const label = String(formData.get('label') ?? '').trim()
  const position = Math.max(0, Math.round(Number(formData.get('position') ?? 0)))
  if (label.length < 2) backWithError(back(kind), 'El nombre no puede quedar vacío.')
  // Solo cambia lo que se ve: el código interno (value) se mantiene para no perder lo que eligió la gente.
  const { error } = await createSupabaseAdmin().from('interest_options').update({ label, position }).eq('id', id)
  if (error) backWithError(back(kind), `No se pudo guardar: ${error.message}`)
  revalidatePath(PATH)
  backWithOk(back(kind), 'Cambios guardados.')
}

export async function toggleInterest(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const kind = String(formData.get('kind') ?? 'rubro')
  const show = formData.get('is_active') !== 'true'
  await createSupabaseAdmin().from('interest_options').update({ is_active: show }).eq('id', id)
  revalidatePath(PATH)
  backWithOk(back(kind), show ? 'Opción visible otra vez en la app.' : 'Opción oculta: ya no aparece en la app (quienes la eligieron la conservan).')
}
