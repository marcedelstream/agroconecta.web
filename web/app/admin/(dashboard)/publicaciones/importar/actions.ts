'use server'

import { getAuthContext } from '@/lib/auth-roles'
import { getAIProvider } from '@/lib/karai/ai-provider'
import { fetchArticle } from '@/lib/news-import/extract'
import { buildDraft, type ImportMode, type NewsDraft } from '@/lib/news-import/draft'

export type ImportState =
  | { status: 'idle' }
  | { status: 'error'; error: string }
  | { status: 'ok'; draft: NewsDraft; sourceUrl: string; siteName: string; mode: ImportMode; nonce: number }

export async function importFromUrl(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const auth = await getAuthContext()
  if (!auth) return { status: 'error', error: 'No tenés permiso para cargar publicaciones.' }

  const url = String(formData.get('url') ?? '').trim()
  const mode: ImportMode = formData.get('mode') === 'verbatim' ? 'verbatim' : 'rewrite'
  if (!url) return { status: 'error', error: 'Pegá el link de la nota.' }

  try {
    const article = await fetchArticle(url)
    const draft = await buildDraft(article, mode, getAIProvider())
    return { status: 'ok', draft, sourceUrl: article.url, siteName: article.siteName, mode, nonce: Date.now() }
  } catch (error) {
    return { status: 'error', error: error instanceof Error ? error.message : 'No se pudo importar la nota.' }
  }
}
