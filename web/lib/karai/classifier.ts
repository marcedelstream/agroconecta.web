import type { ScopeCategory } from './types'

// Clasificador por reglas (KARAI_CONTEXTO_MAESTRO.md secc. 6.1): primera linea de defensa de
// costos, corre ANTES de tocar el modelo de lenguaje. Lo que no matchea ninguna categoria "segura"
// cae en out_of_scope por default — mejor pecar de conservador acá con reglas simples e ir
// afinando con uso real, que dejar pasar cualquier cosa al modelo (sección 6.1: "las consultas
// out_of_scope no deben llegar al modelo principal").

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

const UNSAFE_PATTERNS = [
  /\b(matar|suicid|violac|terroris|bomba|arma de fuego para)\b/,
]

const GREETING_PATTERNS = [
  /^(hola|buenas|buen dia|buenos dias|buenas tardes|buenas noches|hey|que tal)[\s!.,]*$/,
  /^(gracias|muchas gracias|chau|adios|nos vemos|listo|ok|dale)[\s!.,]*$/,
]

const SUPPORT_PATTERNS = [
  /\bque (podes|puedes|sabes) hacer\b/,
  /\bcomo funciona[s]?\b/,
  /\b(ayuda|help)\b/,
  /\b(mi )?limite (diario|de consultas)\b/,
  /\b(plan|suscripcion|upgrade|precio de karai)\b/,
]

// Vocabulario de especies/rubros — sin esto, un mensaje corto de seguimiento como "son 100 toros y
// 80 vaquillas" (sin la palabra "tengo" ni "vender") no matchea nada y cae a out_of_scope,
// cortando la conversación antes de que el modelo la vea. Ver CLAUDE.md/memoria: bug real
// reportado 2026-09-02.
const SPECIES_OR_CROP = '(toro|toros|vaquilla|vaquillas|vaca|vacas|novillo|novillos|ternero|terneros|buey|bueyes|oveja|ovejas|cordero|corderos|cerdo|cerdos|chancho|chanchos|pollo|pollos|gallina|gallinas|soja|maiz|trigo|poroto|porotos|sesamo|girasol|algodon|mandioca|arroz|sorgo)'

const FARM_MANAGEMENT_PATTERNS = [
  /\bmi finca\b/,
  /\b(registrar|cargar|anotar|anote)\b.*\b(animal|vaca|novillo|lote|hectarea|gasto|cosecha|grano)\b/,
  /\btengo\b.*\b(animales|cabezas|hectareas|hect\.?)\b/,
  /\b(cuantos|cuantas)\b.*\b(animales|hectareas|lotes)\b.*\btengo\b/,
  new RegExp(`\\b\\d+\\s*${SPECIES_OR_CROP}\\b`),
]

const COMMERCIAL_PATTERNS = [
  /\b(quiero|busco|necesito)\b.*\b(vender|comprar)\b/,
  /\b(comprador|vendedor|oferta|cotizacion)\b/,
  /\btengo\b.*\bpara (vender|ofrecer)\b/,
  /\b(se vende|en venta|ofrezco)\b/,
]

const AGRO_INFO_PATTERNS = [
  /\bprecio(s)?\b/,
  /\b(evento|eventos|feria|expo)\b/,
  /\bnoticia(s)?\b/,
  /\bclima\b/,
  /\b(ganaderia|agricultura|vacuno|hacienda|siembra|cosecha|avicola|lechero)\b/,
  new RegExp(`\\b${SPECIES_OR_CROP}\\b`),
  /\bagroconecta\b/,
]

// Orden importa: se revisa comercial ANTES que manejo de finca porque "tengo 180 cabezas para
// vender" es, ante todo, una oferta de venta — antes quedaba mal etiquetado como farm_management y
// nunca se generaba el lead en karai_leads aunque el modelo le decía al usuario que sí (bug real,
// ver orchestrator.ts recordLeadIfCommercial).
export function classifyMessage(rawMessage: string): ScopeCategory {
  const text = normalize(rawMessage)
  if (!text) return 'out_of_scope'

  if (matchesAny(text, UNSAFE_PATTERNS)) return 'unsafe_or_abusive'
  if (matchesAny(text, GREETING_PATTERNS)) return 'general_greeting'
  if (matchesAny(text, SUPPORT_PATTERNS)) return 'karai_support'
  if (matchesAny(text, COMMERCIAL_PATTERNS)) return 'commercial_opportunity'
  if (matchesAny(text, FARM_MANAGEMENT_PATTERNS)) return 'farm_management'
  if (matchesAny(text, AGRO_INFO_PATTERNS)) return 'agro_information'

  return 'out_of_scope'
}

// Chequeos independientes de la categoría "ganadora" de classifyMessage — un mismo mensaje puede
// ser a la vez un dato de finca Y una oferta comercial ("tengo 180 cabezas para vender"), y antes
// solo se disparaba el efecto de la categoría que ganaba el switch, perdiendo el otro efecto.
export function hasCommercialIntent(rawMessage: string): boolean {
  return matchesAny(normalize(rawMessage), COMMERCIAL_PATTERNS)
}

export function hasFarmDataIntent(rawMessage: string): boolean {
  return matchesAny(normalize(rawMessage), FARM_MANAGEMENT_PATTERNS)
}

export const OUT_OF_SCOPE_REPLY =
  'Estoy especializado en producción y negocios agropecuarios. Puedo ayudarte a administrar tu finca, analizar tus datos o encontrar oportunidades dentro del sector.'

export const UNSAFE_REPLY =
  'No puedo ayudarte con eso. Si necesitás asistencia urgente, contactá a las autoridades o servicios de ayuda correspondientes.'
