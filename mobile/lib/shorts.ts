export interface ShortVideo {
  id: string
  title: string
  thumbnail: string
}

// Pegado al endpoint propio de la web (no directo a YouTube) para no tener que duplicar la
// YOUTUBE_API_KEY como env var pública del lado mobile — ver web/app/api/shorts/route.ts.
export async function fetchAgroconectaShorts(): Promise<ShortVideo[]> {
  try {
    const res = await fetch('https://agroconecta.com.py/api/shorts')
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.shorts) ? data.shorts : []
  } catch {
    return []
  }
}
