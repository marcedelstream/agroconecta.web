// Links a las tiendas (App Store y Google Play ya publicadas).
export const APP_STORE_ID = '6790629876'
export const APP_STORE_URL = `https://apps.apple.com/py/app/agroconecta/id${APP_STORE_ID}`
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.agroconecta.app'

// Esquema de la app (mobile/app.json → "scheme"). Abre la app si está instalada.
export const APP_SCHEME = 'agroconecta://'

// Tienda que corresponde al celular que abre /descargar. Los buscadores (Googlebot usa un user-agent
// de Android) ven la página en vez de rebotar a Play, para que /descargar siga indexada.
export function storeUrlForUserAgent(userAgent: string): string | null {
  if (/bot|crawl|spider|slurp|facebookexternalhit|whatsapp/i.test(userAgent)) return null
  if (/android/i.test(userAgent)) return PLAY_STORE_URL
  if (/iphone|ipad|ipod/i.test(userAgent)) return APP_STORE_URL
  return null
}
