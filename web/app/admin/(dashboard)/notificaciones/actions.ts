'use server'

import { getAuthContext } from '@/lib/auth-roles'
import { sendPushToAll, type NotificationCategory } from '@/lib/push'

export type SendState = { error: string | null; sent: boolean }

const VALID_CATEGORIES: NotificationCategory[] = [
  'breakingNews',
  'priceAlerts',
  'weatherAlerts',
  'institutionalUpdates',
]

export async function sendManualPush(
  _prev: SendState,
  formData: FormData,
): Promise<SendState> {
  const auth = await getAuthContext()
  if (!auth) return { error: 'No tenés permiso para enviar notificaciones.', sent: false }

  const title = (formData.get('title') as string | null)?.trim()
  const body = (formData.get('body') as string | null)?.trim()
  const articleId = (formData.get('article_id') as string | null)?.trim() || undefined
  const categoryRaw = (formData.get('category') as string | null)?.trim()
  const category = VALID_CATEGORIES.includes(categoryRaw as NotificationCategory)
    ? (categoryRaw as NotificationCategory)
    : undefined

  if (!title || !body) return { error: 'El título y el cuerpo son obligatorios.', sent: false }

  try {
    await sendPushToAll({
      title,
      body,
      data: articleId ? { articleId } : {},
    }, category)
    return { error: null, sent: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'No se pudo enviar la notificación.',
      sent: false,
    }
  }
}
