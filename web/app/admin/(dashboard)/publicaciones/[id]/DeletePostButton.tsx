'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from '../actions'

export function DeletePostButton({ id, imageUrl }: { id: string; imageUrl: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', id)
      formData.set('image_url', imageUrl ?? '')
      await deletePost(formData)
      router.push('/admin/publicaciones')
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="btn text-xs text-danger border-danger/40 hover:bg-danger/10"
    >
      {isPending ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
