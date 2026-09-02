// KARAI-PLAN-ENTRENAMIENTO-Y-FUENTES.md secc. 3: niveles de autoridad B/C/D que aplican a fuentes
// cargadas por el equipo (A es Agroconecta mismo — posts/market_prices/events — no pasa por acá).
export type KaraiSourceLevel = 'official_document' | 'official_site' | 'social_media'

export const SOURCE_LEVEL_LABELS: Record<KaraiSourceLevel, string> = {
  official_document: 'Documentación oficial (nivel B)',
  official_site: 'Sitio oficial externo (nivel C)',
  social_media: 'Red social oficial (nivel D)',
}

export type KaraiSourceStatus = 'pendiente' | 'aprobado' | 'vencido' | 'retirado'

export const SOURCE_STATUS_LABELS: Record<KaraiSourceStatus, string> = {
  pendiente: 'Pendiente de revisión',
  aprobado: 'Aprobada',
  vencido: 'Vencida',
  retirado: 'Retirada',
}

// Chequeo puro, independiente de la query a Supabase (context.ts ya filtra status='aprobado' Y
// expires_at vigente del lado de Postgres) — funciona como segunda capa de defensa y es lo que
// permite testear la regla "nunca usar una fuente vencida" sin mockear la base de datos.
export function isSourceUsable(
  source: { status: KaraiSourceStatus; expiresAt: string | null },
  today: string = new Date().toISOString().slice(0, 10),
): boolean {
  if (source.status !== 'aprobado') return false
  if (!source.expiresAt) return true
  return source.expiresAt >= today
}
