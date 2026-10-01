// Muchas notas se cargan como texto plano (sin <p>) desde el textarea del admin — el navegador
// colapsa saltos de línea por default y todo el cuerpo termina como un solo bloque corrido.
// Si el contenido ya trae etiquetas de bloque (viene de los botones "Párrafo"/"Subtítulo"/etc.
// del admin), se respeta tal cual. Si no, se arma la estructura de párrafos acá, en el render,
// para que corrija también notas ya publicadas sin necesidad de tocar la base de datos.
const HTML_BLOCK_TAGS = /<(p|h[1-6]|div|ul|ol|blockquote|figure|img|iframe|table)[\s>]/i

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function normalizeArticleHtml(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (HTML_BLOCK_TAGS.test(trimmed)) return splitBrParagraphs(trimmed)

  // Cada renglón es un párrafo: en el admin y en las notas sindicadas se escribe un párrafo por renglón
  // (con o sin renglón vacío entre medio). Antes los renglones sueltos se pegaban con <br /> dentro de
  // un mismo párrafo y la nota quedaba como un bloque apretado.
  return trimmed
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

const EMPTY_TEXT = /^(?:&nbsp;|\s)*$/

/** Un <p> con varios renglones separados por <br> se convierte en un párrafo por renglón. */
function splitBrParagraphs(html: string): string {
  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (_match, attrs: string, inner: string) =>
    inner
      .split(/(?:<br\s*\/?>\s*)+/i)
      .map((part) => part.trim())
      .filter((part) => !EMPTY_TEXT.test(part))
      .map((part) => `<p${attrs}>${part}</p>`)
      .join(''),
  )
}
