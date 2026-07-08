'use client'

import { useActionState } from 'react'
import { deleteOrganization, type OrganizationActionState } from '../actions'

const initialState: OrganizationActionState = { error: null }

export function DeleteOrgButton({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(deleteOrganization, initialState)

  return (
    <div>
      {state.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 px-3 py-2 text-xs text-danger mb-3">
          {state.error}
        </div>
      )}
      <form
        action={formAction}
        onSubmit={(e) => { if (!confirm('¿Eliminar esta organización?')) e.preventDefault() }}
      >
        <input type="hidden" name="id" value={id} />
        <button type="submit" disabled={isPending} className="btn text-xs border-danger/40 text-danger hover:bg-danger/10">
          {isPending ? 'Eliminando...' : 'Eliminar organización'}
        </button>
      </form>
    </div>
  )
}
