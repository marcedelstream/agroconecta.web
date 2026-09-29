'use server'

import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { SERVICES } from '@/lib/services-data'

export interface LeadState {
  status: 'idle' | 'ok' | 'error'
  message?: string
}

// Tipos que se pueden pedir desde la web pública (lo que llega a Consultas del panel). Todo lo demás se
// rechaza, así nadie puede inventar tipos desde el formulario.
const ALLOWED = new Set([...SERVICES.map((s) => s.id), 'suscripcion_organizacion_web'])

// Formularios de contacto de la web oficial (servicios, organizaciones).
export async function sendWebLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  if (String(formData.get('website') ?? '')) return { status: 'ok' }
  const type = String(formData.get('type') ?? '')
  if (!ALLOWED.has(type)) return { status: 'error', message: 'Formulario inválido.' }

  const name = String(formData.get('name') ?? '').trim().slice(0, 80)
  const phone = String(formData.get('phone') ?? '').trim().slice(0, 30)
  const org = String(formData.get('org') ?? '').trim().slice(0, 120)
  const message = String(formData.get('message') ?? '').trim().slice(0, 1500)
  if (name.length < 2 || phone.replace(/\D/g, '').length < 8) {
    return { status: 'error', message: 'Dejanos tu nombre y un WhatsApp válido.' }
  }

  const info = [`Nombre: ${name}`, org && `Organización: ${org}`, message].filter(Boolean).join('\n')
  const { error } = await createSupabaseAdmin().from('service_leads').insert({ service_type: type, phone, additional_info: info })
  if (error) return { status: 'error', message: 'No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp.' }
  return { status: 'ok' }
}
