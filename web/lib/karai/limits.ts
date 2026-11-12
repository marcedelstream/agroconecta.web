// Topes de entrada del chat de Karai. La cuota diaria (quota.ts) cuenta consultas respondidas; esto
// protege antes de eso: mensajes gigantes (cuestan tokens y llenan la base) y ráfagas de pedidos.

/** Largo máximo de un mensaje del usuario. Un mensaje normal de campo no pasa de unos cientos. */
export const MAX_MESSAGE_CHARS = 4000

export const BURST_MAX_MESSAGES = 6
export const BURST_WINDOW_MS = 60_000

export function messageTooLongReply(): string {
  return `Tu mensaje es demasiado largo (máximo ${MAX_MESSAGE_CHARS.toLocaleString('es-PY')} caracteres). Resumilo o mandalo en partes.`
}

export type BurstResult = { ok: true } | { ok: false; retryAfterSeconds: number }

// Ventana deslizante en memoria, por instancia del servidor. En serverless cada instancia tiene su
// propio mapa, así que es un freno de ráfagas "best-effort" (frena el pico desde un mismo cliente),
// NO un límite exacto: el tope firme sigue siendo la cuota diaria en base de datos. Si algún día
// hace falta un límite global, hay que moverlo a un almacén compartido (Redis/Upstash o Postgres).
const hits = new Map<string, number[]>()

export function checkBurst(profileId: string, now: number = Date.now()): BurstResult {
  const recent = (hits.get(profileId) ?? []).filter((t) => now - t < BURST_WINDOW_MS)

  if (recent.length >= BURST_MAX_MESSAGES) {
    hits.set(profileId, recent)
    const retryAfterSeconds = Math.max(1, Math.ceil((recent[0] + BURST_WINDOW_MS - now) / 1000))
    return { ok: false, retryAfterSeconds }
  }

  recent.push(now)
  hits.set(profileId, recent)

  // Evita que el mapa crezca sin límite con usuarios que no vuelven.
  if (hits.size > 5000) {
    for (const [id, times] of hits) {
      if (!times.some((t) => now - t < BURST_WINDOW_MS)) hits.delete(id)
    }
  }

  return { ok: true }
}

/** Solo para tests. */
export function resetBurstForTests() {
  hits.clear()
}
