// Publicaciones "solo flyer" del panel (web/lib/flyer.ts): el contenido es un <figure class="flyer">
// con la imagen completa. Misma marca que usa la web, así no hace falta una columna nueva.
const FLYER_MARK = /<figure\b[^>]*class=["'][^"']*\bflyer\b/i

export function isFlyerContent(content: string | null | undefined): boolean {
  return FLYER_MARK.test(content ?? '')
}
