'use server'

import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { ORG_TYPES } from '@/lib/karai/landing-content'

export interface OrgLeadState {
  status: 'idle' | 'ok' | 'error'
  message?: string
}

// Pedido de una organización que quiere sumarse a Karai (como fuente o con Karai Teams). Queda en
// Consultas del panel (service_leads) igual que el pedido de KARAI Campo.
export async function requestKaraiOrganization(_prev: OrgLeadState, formData: FormData): Promise<OrgLeadState> {
  // Campo trampa: los bots lo completan, las personas no lo ven.
  if (String(formData.get('website') ?? '')) return { status: 'ok' }

  const name = String(formData.get('name') ?? '').trim().slice(0, 80)
  const organization = String(formData.get('organization') ?? '').trim().slice(0, 120)
  const role = String(formData.get('role') ?? '').trim().slice(0, 80)
  const phone = String(formData.get('phone') ?? '').trim().slice(0, 30)
  const rawType = String(formData.get('orgType') ?? '')
  const orgType = (ORG_TYPES as readonly string[]).includes(rawType) ? rawType : ''

  if (name.length < 2 || organization.length < 2 || phone.replace(/\D/g, '').length < 8) {
    return { status: 'error', message: 'Dejanos tu nombre, el de tu organización y un WhatsApp válido.' }
  }

  const info = [
    `Nombre: ${name}`,
    `Organización: ${organization}`,
    orgType && `Tipo: ${orgType}`,
    role && `Cargo: ${role}`,
  ].filter(Boolean).join('\n')

  const { error } = await createSupabaseAdmin()
    .from('service_leads')
    .insert({ service_type: 'karai_organizacion', phone, additional_info: info })
  if (error) return { status: 'error', message: 'No pudimos enviar tu pedido. Probá de nuevo o escribinos por WhatsApp.' }
  return { status: 'ok' }
}
