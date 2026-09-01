import type { createSupabaseAdmin } from '@/lib/supabase-admin'
import type { AIProvider } from './ai-provider'

// Recopilación de datos de finca (KARAI_CONTEXTO_MAESTRO.md secc. 15, MVP recomendado, punto 4):
// versión liviana — sin farms/lots/crops como entidades separadas todavía (eso es fase 2 completa),
// una sola fila jsonb por usuario que se va completando de a poco por extracción best-effort.
// Nunca bloquea ni rompe la respuesta principal del chat si falla — es una mejora aparte.

export interface ExtractedFarmData {
  ubicacion?: string
  hectareas?: number
  animales?: { tipo: string; cantidad: number }[]
  cultivos?: { tipo: string; superficie_ha: number }[]
}

const EXTRACTION_PROMPT = `Extraé datos objetivos de finca mencionados en el mensaje del usuario (no en el contexto ni en mensajes previos).
Devolvé SOLO un objeto JSON válido, sin texto alrededor, con esta forma exacta (omití los campos que no se mencionen, no inventes valores):
{"ubicacion": string, "hectareas": number, "animales": [{"tipo": string, "cantidad": number}], "cultivos": [{"tipo": string, "superficie_ha": number}]}
Si el mensaje no menciona ningún dato objetivo de finca, devolvé {}.`

function parseExtraction(text: string): ExtractedFarmData | null {
  try {
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) return null
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed as ExtractedFarmData
  } catch {
    return null
  }
}

function mergeFarmData(existing: ExtractedFarmData, extracted: ExtractedFarmData): ExtractedFarmData {
  const merged: ExtractedFarmData = { ...existing }

  if (extracted.ubicacion) merged.ubicacion = extracted.ubicacion
  if (typeof extracted.hectareas === 'number') merged.hectareas = extracted.hectareas

  if (extracted.animales?.length) {
    const byTipo = new Map((existing.animales ?? []).map((a) => [a.tipo.toLowerCase(), a]))
    for (const item of extracted.animales) {
      if (item?.tipo && typeof item.cantidad === 'number') byTipo.set(item.tipo.toLowerCase(), item)
    }
    merged.animales = Array.from(byTipo.values())
  }

  if (extracted.cultivos?.length) {
    const byTipo = new Map((existing.cultivos ?? []).map((c) => [c.tipo.toLowerCase(), c]))
    for (const item of extracted.cultivos) {
      if (item?.tipo && typeof item.superficie_ha === 'number') byTipo.set(item.tipo.toLowerCase(), item)
    }
    merged.cultivos = Array.from(byTipo.values())
  }

  return merged
}

export async function extractAndSaveFarmData(
  admin: ReturnType<typeof createSupabaseAdmin>,
  provider: AIProvider,
  profileId: string,
  userMessage: string,
): Promise<void> {
  try {
    const { text } = await provider.generate({
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: userMessage },
      ],
    })

    const extracted = parseExtraction(text)
    if (!extracted || Object.keys(extracted).length === 0) return

    const { data: existingRow } = await admin.from('farm_profile').select('data').eq('profile_id', profileId).maybeSingle()
    const existing = (existingRow?.data ?? {}) as ExtractedFarmData
    const merged = mergeFarmData(existing, extracted)

    await admin
      .from('farm_profile')
      .upsert({ profile_id: profileId, data: merged, updated_at: new Date().toISOString() })
  } catch (err) {
    // Best-effort: nunca debe romper la respuesta principal del chat.
    console.error('extractAndSaveFarmData falló:', err)
  }
}
