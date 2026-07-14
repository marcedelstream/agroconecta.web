'use client'

import { useActionState } from 'react'
import { sendManualPush, type SendState } from './actions'

const initial: SendState = { error: null, sent: false }

export function NotificationsForm() {
  const [state, action, pending] = useActionState(sendManualPush, initial)

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.sent && (
        <div className="rounded-lg bg-lime/10 border border-lime/30 px-4 py-3 text-sm text-lime">
          Notificación enviada correctamente a todos los dispositivos.
        </div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          required
          maxLength={100}
          placeholder="Ej: Remate ganadero este sábado"
          className="rounded-lg border border-bdr bg-secondary px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/60 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">
          Mensaje <span className="text-red-400">*</span>
        </label>
        <textarea
          name="body"
          required
          rows={3}
          maxLength={250}
          placeholder="Texto que verá el usuario en la notificación..."
          className="rounded-lg border border-bdr bg-secondary px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/60 transition-colors resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">
          ID de artículo <span className="text-muted font-normal">(opcional — abre la nota al tocar)</span>
        </label>
        <input
          name="article_id"
          placeholder="UUID de la publicación"
          className="rounded-lg border border-bdr bg-secondary px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/60 transition-colors font-mono"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">
          Categoría <span className="text-muted font-normal">(filtra por lo que cada usuario activó en su perfil)</span>
        </label>
        <select
          name="category"
          defaultValue=""
          className="rounded-lg border border-bdr bg-secondary px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/60 transition-colors"
        >
          <option value="">Todos los dispositivos (sin filtrar)</option>
          <option value="breakingNews">Noticias de último momento</option>
          <option value="priceAlerts">Alertas de precios</option>
          <option value="weatherAlerts">Alertas climáticas</option>
          <option value="institutionalUpdates">Avisos institucionales</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-lime text-black text-sm font-semibold py-2.5 px-6 hover:bg-lime/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
      >
        {pending ? 'Enviando…' : 'Enviar notificación'}
      </button>
    </form>
  )
}
