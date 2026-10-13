'use client'

import { useState, useTransition } from 'react'
import { Link2, Sparkles } from 'lucide-react'
import type { EcosystemListingKind } from '@/lib/types'
import type { ListingDraft } from '@/lib/news-import/listing-draft'
import { prefillListingFromUrl } from './actions'

interface Props {
  kind: EcosystemListingKind
  onDraft: (draft: ListingDraft) => void
}

// "Lo vi en internet": se pega el link del aviso y se completan los campos para revisar.
export function LinkPrefill({ kind, onDraft }: Props) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState<{ tone: 'error' | 'info'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-lime/60 bg-lime/5 px-4 py-3 text-left text-sm hover:bg-lime/10"
      >
        <Link2 size={18} className="shrink-0 text-lime" aria-hidden />
        <span>
          <span className="font-semibold text-foreground">¿Lo encontraste en internet?</span>{' '}
          <span className="text-muted">Pegá el link y completamos los datos por vos.</span>
        </span>
      </button>
    )
  }

  const run = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await prefillListingFromUrl(kind, url)
      if (!result.ok) {
        setMessage({ tone: 'error', text: result.error })
        return
      }
      onDraft(result.draft)
      setMessage({ tone: 'info', text: result.draft.warning ?? 'Listo: revisá cada campo antes de guardar.' })
    })
  }

  return (
    <div className="space-y-2 rounded-2xl border border-lime/60 bg-lime/5 p-4">
      <label htmlFor="listing-source-url" className="block text-sm font-semibold text-foreground">Link del aviso</label>
      <div className="flex gap-2">
        <input
          id="listing-source-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            // Enter acá no tiene que mandar el formulario de abajo.
            if (e.key === 'Enter') {
              e.preventDefault()
              run()
            }
          }}
          className="input flex-1"
          placeholder="https://..."
        />
        <button type="button" onClick={run} disabled={isPending || !url.trim()} className="btn-primary text-sm gap-2 shrink-0">
          <Sparkles size={15} aria-hidden /> {isPending ? 'Leyendo…' : 'Completar'}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${message.tone === 'error' ? 'text-danger' : 'text-muted'}`}>{message.text}</p>
      )}
    </div>
  )
}
