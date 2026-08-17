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
  if (HTML_BLOCK_TAGS.test(trimmed)) return trimmed

  return trimmed
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) =>
      `<p>${escapeHtml(paragraph)
        .split('\n')
        .map((line) => line.trim())
        .join('<br />')}</p>`
    )
    .join('')
}
