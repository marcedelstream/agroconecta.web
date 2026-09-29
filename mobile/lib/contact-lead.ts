import { supabase } from '@/lib/supabase'
import { WEB_BASE_URL } from '@/lib/feed-v2/api'

// Consultas que llegan al panel (service_leads → Consultas) y además avisan por mail.

interface Lead {
  userId: string | null
  serviceType: string
  serviceLabel: string
  phone: string
  info: string
}

export async function sendLead(lead: Lead): Promise<boolean> {
  const { error } = await supabase.from('service_leads').insert({
    user_id: lead.userId,
    service_type: lead.serviceType,
    phone: lead.phone.trim(),
    additional_info: lead.info.trim(),
  })
  // El mail es un aviso extra: si falla, la consulta ya quedó guardada en el panel.
  fetch(`${WEB_BASE_URL}/api/service-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceLabel: lead.serviceLabel, phone: lead.phone.trim(), additionalInfo: lead.info.trim() }),
  }).catch(() => null)
  return !error
}

/** Pantalla Contacto: el motivo elegido va al comienzo del texto. */
export async function sendContactLead(input: { userId: string | null; phone: string; reason: string; message: string }): Promise<boolean> {
  const info = [input.reason && `Motivo: ${input.reason}`, input.message.trim()].filter(Boolean).join('\n')
  return sendLead({ userId: input.userId, serviceType: 'oportunidad_comercial', serviceLabel: 'Oportunidad comercial', phone: input.phone, info })
}
