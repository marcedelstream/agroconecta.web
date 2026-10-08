// Chequeos de la publicación ANTES de mandarla, compartidos por el formulario del panel (se ven al
// tocar "Crear publicación", sin perder lo cargado) y por la server action (por si algo se saltea).
export interface PostDraftInput {
  title: string
  summary: string
  content: string
  contentType: string
  editorialStatus: string
  organizationId: string
  youtubeUrl: string
  imageUrl: string
  hasImageFile: boolean
  /** "Solo flyer": el contenido es la imagen; no lleva texto ni resumen obligatorio. */
  flyerOnly?: boolean
}

const YOUTUBE = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i
// Fotos pegadas desde Word o desde otro sitio quedan como texto gigante dentro del HTML.
const EMBEDDED_IMAGE = /src=["']data:image\//i
export const MAX_CONTENT_CHARS = 200_000

export function validatePost(input: PostDraftInput): string[] {
  const errors: string[] = []
  const publishing = input.editorialStatus === 'published'
  const needsVideo = input.contentType === 'video' || input.contentType === 'auction'

  const title = input.title.trim()
  if (!title) errors.push('Falta el título.')
  else if (title.length > 200) errors.push(`El título es muy largo (${title.length} caracteres, máximo 200).`)

  if (!input.organizationId) errors.push('Elegí la organización que publica (si es propia, "Agroconecta Medios").')

  if (needsVideo && !input.youtubeUrl.trim()) errors.push('Los videos y remates necesitan el link de YouTube.')
  if (input.youtubeUrl.trim() && !YOUTUBE.test(input.youtubeUrl.trim())) {
    errors.push('El link de YouTube no parece válido (tiene que ser de youtube.com o youtu.be).')
  }

  if (input.imageUrl.trim() && !/^https?:\/\//i.test(input.imageUrl.trim())) {
    errors.push('La "URL de imagen alternativa" tiene que empezar con https://')
  }

  const hasImage = input.hasImageFile || Boolean(input.imageUrl.trim())
  if (input.flyerOnly) {
    if (!hasImage) errors.push('Subí el flyer en "Imagen destacada": en una publicación solo flyer es lo único que se muestra.')
    return errors
  }

  if (EMBEDDED_IMAGE.test(input.content)) {
    errors.push('El contenido tiene una imagen pegada directamente. Borrala y agregala con el botón "Imagen".')
  }
  if (input.content.length > MAX_CONTENT_CHARS) errors.push('El contenido es demasiado largo para guardarse de una vez.')

  if (publishing) {
    if (!input.summary.trim()) errors.push('Para publicar, completá el resumen (la bajada que se ve en el feed).')
    if (!needsVideo && !input.content.trim()) errors.push('Para publicar una nota, completá el contenido.')
    if (!needsVideo && !hasImage) {
      errors.push('Para publicar una nota, agregá una imagen destacada (en la app se ve a pantalla completa).')
    }
  }

  return errors
}

// Los errores de la base vienen en inglés técnico; acá se traducen los que pueden pasar al guardar.
export function friendlyDbError(message: string): string {
  if (/organization_id/i.test(message) && /null/i.test(message)) return 'Falta elegir la organización que publica.'
  if (/invalid input value for enum/i.test(message)) return 'Alguno de los valores elegidos (categoría, tipo o estado) no es válido. Recargá la página y probá de nuevo.'
  if (/duplicate key/i.test(message) && /slug/i.test(message)) return 'Ya existe una publicación con ese título. Cambiá un poco el título.'
  if (/foreign key/i.test(message)) return 'La organización elegida ya no existe. Elegí otra.'
  if (/too long|value too long/i.test(message)) return 'Algún campo es demasiado largo.'
  return `No se pudo guardar: ${message}`
}
