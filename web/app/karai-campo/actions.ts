'use server'

import { createSupabaseAdmin } from '@/lib/supabase-admin'

export interface RequestState {
  status: 'idle' | 'ok' | 'error'
  message?: string
}

// Pedido de KARAI Campo desde la web: queda en Consultas del panel (service_leads) y el equipo activa la
// membresía a mano mientras no haya pasarela de pago. La venta se hace acá y no en la app (reglas de
// las tiendas para contenido digital).
export async function requestKaraiCampo(_prev: RequestState, formData: FormData): Promise<RequestState> {
  // Campo trampa: los bots lo completan, las personas no lo ven.
  if (String(formData.get('website') ?? '')) return { status: 'ok' }

  const name = String(formData.get('name') ?? '').trim().slice(0, 80)
  const phone = String(formData.get('phone') ?? '').trim().slice(0, 30)
  const email = String(formData.get('email') ?? '').trim().slice(0, 120)
  const place = String(formData.get('place') ?? '').trim().slice(0, 120)
  if (name.length < 2 || phone.replace(/\D/g, '').length < 8) {
    return { status: 'error', message: 'Dejanos tu nombre y un WhatsApp válido.' }
  }

  const info = [`Nombre: ${name}`, email && `Correo de su cuenta: ${email}`, place && `Establecimiento / zona: ${place}`].filter(Boolean).join('\n')
  const { error } = await createSupabaseAdmin().from('service_leads').insert({ service_type: 'karai_campo_web', phone, additional_info: info })
  if (error) return { status: 'error', message: 'No pudimos enviar tu pedido. Probá de nuevo o escribinos por WhatsApp.' }
  return { status: 'ok' }
}
