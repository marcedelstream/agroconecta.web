// Normalizaciones compartidas por los cargadores de candidatos del feed.

/** "Alto Paraná" → "alto-parana". Mismo formato que los slugs de Department/rubros de la app. */
export function toSlug(input: string | null | undefined): string | null {
  if (!input) return null
  const slug = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || null
}

export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : null
}

export function youtubeThumbnail(url: string | null | undefined): string | null {
  const id = youtubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

// Paraguay usa UTC-3 fijo desde 2024 (sin horario de verano).
const PY_OFFSET = '-03:00'

/** Fecha "YYYY-MM-DD" + hora opcional "HH:MM…" de eventosagropy → ISO. Sin hora = mediodía local. */
export function eventStartIso(date: string, time: string | null | undefined): string {
  const hm = time?.match(/^(\d{1,2}):(\d{2})/)
  const clock = hm ? `${hm[1].padStart(2, '0')}:${hm[2]}` : '12:00'
  return new Date(`${date}T${clock}:00${PY_OFFSET}`).toISOString()
}
