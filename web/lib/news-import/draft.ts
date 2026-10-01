import type { AIProvider } from '@/lib/karai/ai-provider'
import type { Department, NewsCategory } from '@/lib/types'
import { CATEGORY_LABELS, DEPARTMENT_LABELS } from '@/lib/types'
import type { ArticleBlock, ExtractedArticle } from './extract'

export type ImportMode = 'rewrite' | 'verbatim'

export interface NewsDraft {
  title: string
  summary: string
  content: string
  category: NewsCategory
  target_departments: Department[]
  image_url: string | null
  /** Aviso para el editor cuando algo no salió como se esperaba (ej. sin IA disponible). */
  warning: string | null
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as NewsCategory[]
const DEPARTMENTS = Object.keys(DEPARTMENT_LABELS) as Department[]

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function blocksToHtml(blocks: ArticleBlock[]): string {
  const out: string[] = []
  let list: string[] = []
  const flushList = () => {
    if (list.length) out.push(`<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`)
    list = []
  }
  for (const block of blocks) {
    if (block.type === 'li') {
      list.push(block.text)
      continue
    }
    flushList()
    if (block.type === 'h2') out.push(`<h2>${escapeHtml(block.text)}</h2>`)
    else if (block.type === 'quote') out.push(`<blockquote><p>${escapeHtml(block.text)}</p></blockquote>`)
    else out.push(`<p>${escapeHtml(block.text)}</p>`)
  }
  flushList()
  return out.join('\n')
}

// La fuente la agrega el código (no la IA) para que nunca falte ni quede mal el link.
export function sourceLine(article: ExtractedArticle, mode: ImportMode): string {
  const label = mode === 'verbatim' ? 'Fuente' : 'Con información de'
  return `<hr />\n<p><em>${label}: <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.siteName)}</a></em></p>`
}

function firstParagraphs(blocks: ArticleBlock[], maxChars: number): string {
  const text = blocks.filter((b) => b.type === 'p').map((b) => b.text).join(' ')
  if (text.length <= maxChars) return text
  const cut = text.slice(0, maxChars)
  const sentenceEnd = cut.lastIndexOf('. ')
  return sentenceEnd > maxChars * 0.5 ? cut.slice(0, sentenceEnd + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

const CATEGORY_KEYWORDS: [NewsCategory, RegExp][] = [
  ['clima', /clima|lluvia|sequ[ií]a|meteorol|helada|temperatura/i],
  ['mercados', /mercado|precio|export|cotizaci|faena|comercio|d[oó]lar/i],
  ['tecnologia', /tecnolog|digital|innovaci|dron|software|app\b/i],
  ['agricultura', /agricultur|soja|ma[ií]z|trigo|cultivo|siembra|cosecha|granos?/i],
  ['ganaderia', /ganad|bovino|hacienda|carne|remate|feria|leche|l[aá]cteo/i],
  ['institucional', /ministerio|mag\b|senacsa|gobierno|gremio|arp\b|asociaci/i],
]

export function guessCategory(article: ExtractedArticle): NewsCategory {
  const haystack = `${article.section ?? ''} ${article.url} ${article.title}`
  for (const [category, pattern] of CATEGORY_KEYWORDS) if (pattern.test(haystack)) return category
  return 'ganaderia'
}

interface AiDraftJson {
  title?: string
  summary?: string
  content_html?: string
  category?: string
  target_departments?: string[]
}

function parseJson(text: string): AiDraftJson | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(text.slice(start, end + 1)) as AiDraftJson
  } catch {
    return null
  }
}

function articleAsText(article: ExtractedArticle): string {
  return article.blocks
    .map((b) => (b.type === 'h2' ? `## ${b.text}` : b.type === 'li' ? `- ${b.text}` : b.type === 'quote' ? `> ${b.text}` : b.text))
    .join('\n\n')
}

const SHARED_RULES = `Sos editor de Agroconecta, un medio digital agropecuario de Paraguay. Público: productores, veterinarios, agrónomos y profesionales del agro.
Categorías posibles (usá la clave): ${CATEGORIES.map((c) => `${c} (${CATEGORY_LABELS[c]})`).join(', ')}.
Departamentos posibles (claves): ${DEPARTMENTS.join(', ')}. Elegí departamentos SOLO si la nota es claramente de una zona (ej. "el Chaco" = presidente-hayes, boqueron, alto-paraguay); si es nacional, devolvé [].
Respondé SOLO con un objeto JSON válido, sin texto alrededor ni bloques de código.`

const REWRITE_PROMPT = `${SHARED_RULES}
Tarea: reescribí la nota con tus propias palabras para publicarla en Agroconecta.
- Misma información y mismos hechos: no inventes datos, cifras, fechas, nombres ni declaraciones. No agregues opinión.
- Cambiá la redacción y el orden de las frases; no copies oraciones enteras del original. Las citas textuales entre comillas de una persona se pueden mantener, atribuidas.
- Título nuevo, claro e informativo (máx. 110 caracteres), distinto al original.
- Resumen (bajada) de 1 o 2 oraciones, máx. 220 caracteres.
- Cuerpo en HTML simple usando solo <p>, <h2>, <ul>, <li>, <blockquote>, <strong>. Largo similar al original. Español neutro de Paraguay (voseo está bien).
- No menciones al medio original ni pongas "Fuente": eso se agrega aparte.
Forma exacta: {"title": string, "summary": string, "content_html": string, "category": string, "target_departments": string[]}`

const CLASSIFY_PROMPT = `${SHARED_RULES}
Tarea: NO reescribas la nota. Solo escribí un resumen (bajada) de 1 o 2 oraciones, máx. 220 caracteres, con palabras propias, y elegí categoría y departamentos.
Forma exacta: {"summary": string, "category": string, "target_departments": string[]}`

function pickCategory(value: string | undefined, fallback: NewsCategory): NewsCategory {
  return CATEGORIES.includes(value as NewsCategory) ? (value as NewsCategory) : fallback
}

function pickDepartments(values: string[] | undefined): Department[] {
  return (values ?? []).filter((v): v is Department => DEPARTMENTS.includes(v as Department))
}

// El HTML de la IA se limpia a las etiquetas que el render de la nota espera.
function sanitizeAiHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(?!\/?(p|h2|h3|ul|ol|li|blockquote|strong|em|b|i|br)\b)[^>]*>/gi, '')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .trim()
}

export async function buildDraft(
  article: ExtractedArticle,
  mode: ImportMode,
  ai: AIProvider | null,
): Promise<NewsDraft> {
  const fallbackCategory = guessCategory(article)
  const base: NewsDraft = {
    title: article.title,
    summary: firstParagraphs(article.blocks, 220),
    content: `${blocksToHtml(article.blocks)}\n${sourceLine(article, 'verbatim')}`,
    category: fallbackCategory,
    target_departments: [],
    image_url: article.imageUrl,
    warning: null,
  }

  if (!ai) {
    return {
      ...base,
      warning: mode === 'rewrite'
        ? 'No hay IA configurada (falta OPENAI_API_KEY), así que se copió el texto original. Reescribilo a mano antes de publicar.'
        : null,
    }
  }

  const source = `Título original: ${article.title}\nSección: ${article.section ?? '-'}\n\n${articleAsText(article)}`

  if (mode === 'verbatim') {
    try {
      const { text } = await ai.generate({
        messages: [{ role: 'system', content: CLASSIFY_PROMPT }, { role: 'user', content: source }],
        maxOutputTokens: 1500,
      })
      const json = parseJson(text)
      if (!json) return base
      return {
        ...base,
        summary: json.summary?.trim() || base.summary,
        category: pickCategory(json.category, fallbackCategory),
        target_departments: pickDepartments(json.target_departments),
      }
    } catch (error) {
      console.error('news-import: clasificación falló', error)
      return base
    }
  }

  try {
    const { text } = await ai.generate({
      messages: [{ role: 'system', content: REWRITE_PROMPT }, { role: 'user', content: source }],
      maxOutputTokens: 6000,
    })
    const json = parseJson(text)
    const body = json?.content_html ? sanitizeAiHtml(json.content_html) : ''
    if (!json?.title || !body) throw new Error('Respuesta de la IA incompleta')
    return {
      ...base,
      title: json.title.trim(),
      summary: json.summary?.trim() || base.summary,
      content: `${body}\n${sourceLine(article, 'rewrite')}`,
      category: pickCategory(json.category, fallbackCategory),
      target_departments: pickDepartments(json.target_departments),
    }
  } catch (error) {
    console.error('news-import: reescritura falló', error)
    return { ...base, warning: 'La IA no pudo reescribir la nota; se cargó el texto original. Probá de nuevo o reescribilo a mano.' }
  }
}
