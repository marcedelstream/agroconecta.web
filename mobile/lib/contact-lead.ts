import { supabase } from '@/lib/supabase'
import { WEB_BASE_URL } from '@/lib/feed-v2/api'

// Consulta desde "Contacto": queda en service_leads (panel → Consultas) y además se avisa por mail.
const SERVICE_TYPE = 'oportunidad_comercial'
const SERVICE_LABEL = 'Oportunidad comercial'

export async function sendContactLead(input: { userId: string | null; phone: string; reason: string; message: string }): Promise<boolean> {
  const additionalInfo = [input.reason && `Motivo: ${input.reason}`, input.message.trim()].filter(Boolean).join('\n')
  const { error } = await supabase.from('service_leads').insert({
    user_id: input.userId,
    service_type: SERVICE_TYPE,
    phone: input.phone.trim(),
    additional_info: additionalInfo,
  })
  // El mail es un aviso extra: si falla, la consulta ya quedó guardada en el panel.
  fetch(`${WEB_BASE_URL}/api/service-lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceLabel: SERVICE_LABEL, phone: input.phone.trim(), additionalInfo }),
  }).catch(() => null)
  return !error
}
