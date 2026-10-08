// Publicaciones "solo flyer" (ej. el programa de un evento): no llevan texto, el contenido es el flyer
// completo. Se marca con una clase en el HTML en vez de una columna nueva, así no hace falta SQL y la
// app/web lo detectan leyendo el mismo `content` que ya reciben.
const FLYER_MARK = /<figure\b[^>]*class=["'][^"']*\bflyer\b/i

export function isFlyerContent(content: string | null | undefined): boolean {
  return FLYER_MARK.test(content ?? '')
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** El flyer enlaza a la imagen original para poder abrirla en grande y hacer zoom en la web. */
export function flyerHtml(imageUrl: string, title: string): string {
  const src = escapeAttr(imageUrl)
  return `<figure class="flyer"><a href="${src}" target="_blank" rel="noopener noreferrer"><img src="${src}" alt="${escapeAttr(title)}" /></a></figure>`
}
