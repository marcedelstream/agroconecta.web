const CHANNEL_HANDLE = 'agroconectapy'
const MAX_SHORT_SECONDS = 183

export interface ShortVideo {
  id: string
  title: string
  thumbnail: string
}

interface YoutubeThumbnail {
  url: string
}

interface YoutubeChannelsResponse {
  items?: Array<{
    contentDetails?: { relatedPlaylists?: { uploads?: string } }
  }>
}

interface YoutubePlaylistItemsResponse {
  items?: Array<{
    snippet?: {
      title?: string
      resourceId?: { videoId?: string }
      thumbnails?: { high?: YoutubeThumbnail; medium?: YoutubeThumbnail; default?: YoutubeThumbnail }
    }
  }>
}

interface YoutubeVideosResponse {
  items?: Array<{
    id: string
    contentDetails?: { duration?: string }
  }>
}

function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const [, h, m, s] = match
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0)
}

async function fetchUploadsPlaylistId(apiKey: string): Promise<string | null> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const data = (await res.json()) as YoutubeChannelsResponse
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null
}

async function fetchPlaylistVideos(playlistId: string, apiKey: string, max: number): Promise<ShortVideo[]> {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${max}&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  const data = (await res.json()) as YoutubePlaylistItemsResponse
  const videos: ShortVideo[] = []
  for (const item of data.items ?? []) {
    const videoId = item.snippet?.resourceId?.videoId
    if (!videoId) continue
    videos.push({
      id: videoId,
      title: item.snippet?.title ?? '',
      thumbnail:
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        '',
    })
  }
  return videos
}

async function fetchDurations(ids: string[], apiKey: string): Promise<Record<string, number>> {
  if (ids.length === 0) return {}
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids.join(',')}&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return {}
  const data = (await res.json()) as YoutubeVideosResponse
  const map: Record<string, number> = {}
  for (const item of data.items ?? []) {
    map[item.id] = parseIsoDuration(item.contentDetails?.duration ?? 'PT0S')
  }
  return map
}

export async function loadLatestShorts(limit = 6): Promise<ShortVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return []

  try {
    const playlistId = await fetchUploadsPlaylistId(apiKey)
    if (!playlistId) return []

    const videos = await fetchPlaylistVideos(playlistId, apiKey, 20)
    if (videos.length === 0) return []

    const durations = await fetchDurations(
      videos.map((v: ShortVideo) => v.id),
      apiKey
    )

    return videos
      .filter((v: ShortVideo) => (durations[v.id] ?? Infinity) <= MAX_SHORT_SECONDS)
      .slice(0, limit)
  } catch (error) {
    console.error('YouTube shorts fetch failed', error)
    return []
  }
}
