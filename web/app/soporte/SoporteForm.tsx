'use client'

import { useState } from 'react'

export function SoporteForm() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/service-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceLabel: 'Soporte', phone: phone.trim(), additionalInfo: message.trim() }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-lime/30 bg-lime/10 p-6 text-center">
        <p className="text-foreground font-display font-semibold mb-1">¡Listo, recibimos tu mensaje!</p>
        <p className="text-muted text-sm">Te respondemos a la brevedad al número que dejaste.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">
          Teléfono <span className="text-red-400">*</span>
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+595 9xx xxx xxx"
          className="rounded-lg border border-bdr bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-lime/60 transition-colors"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wide">Mensaje</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Contanos tu consulta — soporte técnico, un problema con la app, o una solicitud de eliminación de cuenta..."
          className="rounded-lg border border-bdr bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-lime/60 transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !phone.trim()}
        className="mt-1 rounded-lg bg-lime text-bg text-sm font-semibold py-2.5 px-6 hover:bg-lime/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-start"
      >
        {loading ? 'Enviando…' : 'Enviar consulta'}
      </button>
    </form>
  )
}
