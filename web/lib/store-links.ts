// Links a las tiendas. Google Play todavía no está publicada: mientras sea null se muestra "muy pronto".
export const APP_STORE_ID = '6790629876'
export const APP_STORE_URL = `https://apps.apple.com/py/app/agroconecta/id${APP_STORE_ID}`
export const PLAY_STORE_URL: string | null = null

// Esquema de la app (mobile/app.json → "scheme"). Abre la app si está instalada.
export const APP_SCHEME = 'agroconecta://'
