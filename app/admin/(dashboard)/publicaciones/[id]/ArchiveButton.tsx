'use client'

import { archivePost } from '../actions'

export function ArchiveButton({ id }: { id: string }) {
  return (
    <form action={archivePost}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="btn text-xs text-muted hover:text-danger hover:border-danger/40"
        onClick={(e) => { if (!confirm('¿Archivar esta publicación?')) e.preventDefault() }}
      >
        Archivar
      </button>
    </form>
  )
}
