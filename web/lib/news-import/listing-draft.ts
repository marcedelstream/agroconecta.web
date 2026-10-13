import type { AIProvider } from '@/lib/karai/ai-provider'
import type { EcosystemListingKind } from '@/lib/types'
import { ECOSYSTEM_KINDS } from '@/lib/ecosystem-kinds'
import type { ExtractedArticle } from './extract'

// Borrador de un aviso del Ecosistema (empleo, curso, clasificado) a partir de una página encontrada
// en internet. Siempre es solo un punto de partida: quien carga lo revisa en el formulario antes de guardar.
export interface ListingDraft {
  title: string
  location: string
  modality: string
  description: string
  category_label: string
  publisher_name: string
  contact_url: string
  image_url: string
  warning: string | null
}

interface AiListingJson {
  title?: string
  location?: string
  modality?: string
  description?: string
  category_label?: string
  publisher_name?: string
  contact?: string
}

function parseJson(text: string): AiListingJson | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(text.slice(start, end + 1)) as AiListingJson
  } catch {
    return null
  }
}

function pageText(page: ExtractedArticle): string {
  return page.blocks.map((b) => (b.type === 'li' ? `- ${b.text}` : b.text)).join('\n').slice(0, 12000)
}

// Un número suelto de WhatsApp se convierte en link wa.me para que el botón "Contactar" funcione.
export function normalizeContact(value: string | undefined): string {
  const raw = (value ?? '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.includes('@')) return raw
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 8) return ''
  if (digits.startsWith('595')) return `https://wa.me/${digits}`
  if (digits.startsWith('09')) return `https://wa.me/595${digits.slice(1)}`
  return `https://wa.me/${digits}`
}

function prompt(kind: EcosystemListingKind): string {
  const cfg = ECOSYSTEM_KINDS[kind]
  return `Sos editor de Agroconecta, una app agropecuaria de Paraguay. Te paso el texto de una página web con un aviso de tipo "${cfg.label}".
Extraé los datos para cargarlo en la app. No inventes nada: si un dato no está, devolvé "".
- title: ${cfg.title.label.toLowerCase()} (máx. 90 caracteres, claro).
- location: departamento o ciudad de Paraguay (ej. "San Pedro"); si es online, "Online".
- modality: ${cfg.modality.label.toLowerCase()} en 1 a 3 palabras (ej. ${cfg.modality.suggestions.slice(0, 3).join(', ')}).
- description: resumen útil con tus palabras, 2 a 5 oraciones, incluyendo si están: ${cfg.description.checklist.join('; ')}. Texto plano, sin HTML.
- category_label: uno de ${cfg.categories.join(', ')} (o el más parecido).
- publisher_name: ${cfg.publisher.label.toLowerCase()}.
- contact: WhatsApp, teléfono, mail o link de inscripción/postulación que aparezca en el texto.
Respondé SOLO con un objeto JSON válido: {"title": string, "location": string, "modality": string, "description": string, "category_label": string, "publisher_name": string, "contact": string}`
}

export async function buildListingDraft(
  page: ExtractedArticle,
  kind: EcosystemListingKind,
  ai: AIProvider | null,
): Promise<ListingDraft> {
  const base: ListingDraft = {
    title: page.title,
    location: '',
    modality: '',
    description: page.description || pageText(page).slice(0, 600),
    category_label: '',
    publisher_name: page.siteName,
    // Sin un contacto mejor, el botón lleva al aviso original.
    contact_url: page.url,
    image_url: page.imageUrl ?? '',
    warning: null,
  }

  if (!ai) {
    return { ...base, warning: 'No hay IA configurada, así que solo se completó lo básico (título, texto e imagen). Revisá el resto a mano.' }
  }

  try {
    const { text } = await ai.generate({
      messages: [
        { role: 'system', content: prompt(kind) },
        { role: 'user', content: `Título: ${page.title}\nDescripción: ${page.description}\nSitio: ${page.siteName}\n\n${pageText(page)}` },
      ],
      maxOutputTokens: 1500,
    })
    const json = parseJson(text)
    if (!json) return { ...base, warning: 'No se pudieron leer todos los datos del link. Revisá y completá a mano.' }
    return {
      ...base,
      title: json.title?.trim() || base.title,
      location: json.location?.trim() ?? '',
      modality: json.modality?.trim() ?? '',
      description: json.description?.trim() || base.description,
      category_label: json.category_label?.trim() ?? '',
      publisher_name: json.publisher_name?.trim() || base.publisher_name,
      contact_url: normalizeContact(json.contact) || base.contact_url,
    }
  } catch (error) {
    console.error('listing-import: extracción falló', error)
    return { ...base, warning: 'La IA no respondió; se completó solo lo básico. Revisá el resto a mano.' }
  }
}
