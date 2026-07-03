import { NextResponse } from 'next/server'

const RESEND_URL = 'https://api.resend.com/emails'

interface ServiceLeadPayload {
  serviceLabel: string
  phone: string
  additionalInfo?: string
}

function isValidPayload(body: unknown): body is ServiceLeadPayload {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return typeof b.serviceLabel === 'string' && typeof b.phone === 'string' && b.phone.trim().length > 0
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.SERVICE_LEAD_EMAIL_TO

  if (!apiKey || !to) {
    return NextResponse.json({ error: 'Envío de email no configurado.' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  if (!isValidPayload(body)) {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const { serviceLabel, phone, additionalInfo } = body

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Agroconecta <onboarding@resend.dev>',
      to,
      subject: `Nueva consulta de servicio: ${serviceLabel}`,
      html: `
        <p><strong>Servicio:</strong> ${serviceLabel}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Información adicional:</strong> ${additionalInfo || '—'}</p>
      `,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('Resend error:', res.status, detail)
    return NextResponse.json({ error: 'No se pudo enviar el email.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
