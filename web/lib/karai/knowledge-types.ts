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
