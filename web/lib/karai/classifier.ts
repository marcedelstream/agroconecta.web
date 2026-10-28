import type { ScopeCategory } from './types'

// Clasificador por reglas (KARAI_CONTEXTO_MAESTRO.md secc. 6.1): primera linea de defensa de
// costos, corre ANTES de tocar el modelo de lenguaje. Hasta 2026-10 lo que no matcheaba ninguna
// regla caía en out_of_scope, y eso rechazaba preguntas agro válidas ("¿cómo controlo la roya
// asiática?") porque ninguna lista de palabras cubre todo el campo. Ahora es al revés: solo se
// bloquea lo inseguro y lo claramente ajeno (deportes, farándula, tareas escolares, programación);
// el resto pasa como consulta agro general y la cuota diaria sigue poniendo el techo de costo.

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

// "matar" y "bomba" son vocabulario normal del campo (matar la garrapata, bomba de riego), así que
// solo cuentan con un objeto que no deje dudas.
const UNSAFE_PATTERNS = [
  /\b(suicid\w*|violac\w*|terroris\w*|arma de fuego para)/,
  /\bmatar(lo|la|le)? (a )?(alguien|una persona|personas|gente|mi (esposa|esposo|marido|mujer|vecino|vecina|padre|madre|hijo|hija|novio|novia|jefe|patron)|un (hombre|vecino)|una (mujer|vecina))\b/,
  /\bbomba\b(?! (de|para) (agua|riego|pozo|vacio|combustible|mochila|fumigar)| (fumigadora|sumergible|hidraulica|centrifuga|dosificadora|de fumigacion))/,
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

// Con el default abierto, esta lista ya no decide qué pasa: sirve para que una pregunta agro gane
// aunque tenga una palabra de la lista de ajenos ("manejo integral de plagas", "examen de
// brucelosis", "tarea de vacunación").
const AGRO_TERMS = [
  // Rubros y producción
  'ganad\\w*', 'vacun\\w*', 'bovin\\w*', 'hacienda', 'agricul\\w*', 'agro\\w*', 'cultiv\\w*',
  'siembr\\w*', 'sembr\\w*', 'plantar', 'cosech\\w*', 'zafra\\w*', 'rubros?', 'chacra\\w*', 'estancia\\w*',
  'granja\\w*', 'finca\\w*', 'mi campo', 'productor\\w*', 'cooperativa\\w*', 'gremio\\w*',
  'sesamo', 'chia', 'stevia', 'yerba\\w*', 'cana de azucar', 'canaveral\\w*', 'hortic\\w*', 'hortaliza\\w*',
  'huerta\\w*', 'invernadero\\w*', 'tomate\\w*', 'locote\\w*', 'frut\\w*', 'citric\\w*',
  'lecher\\w*', 'leche', 'tambo\\w*', 'apicul\\w*', 'abejas?', 'colmenas?', 'miel', 'piscicul\\w*',
  'tilapias?', 'pacu', 'surubi', 'forest\\w*', 'reforest\\w*', 'eucaliptos?', 'pastur\\w*', 'pasto\\w*',
  'forraje\\w*', 'silos?', 'ensilaje', 'feedlot', 'engorde', 'recria', 'destete', 'paricion',
  'inseminacion', 'avicola', 'porcin\\w*',
  // Sanidad
  'garrapat\\w*', 'aftosa', 'brucel\\w*', 'antiparasit\\w*', 'desparasit\\w*', 'ivermectina', 'roya\\w*',
  'chinches?', 'orugas?', 'isocas?', 'plagas?', 'malezas?', 'fungicid\\w*', 'herbicid\\w*',
  'insecticid\\w*', 'fitosanit\\w*', 'sanidad', 'veterinari\\w*', 'mosca de los cuernos', 'bichera',
  // Clima y suelo
  'clima\\w*', 'lluvias?', 'llov\\w*', 'sequia\\w*', 'heladas?', 'granizo', 'suelos?', 'fertiliz\\w*',
  'abonos?', 'encalado', 'riego', 'labranza', 'rotacion de cultivos',
  // Crédito e instituciones
  'credito agricola', 'bnf', 'banco nacional de fomento', 'cah', 'senave', 'senacsa', 'mag',
  'ministerio de agricultura', 'ipta', 'infona', 'arp', 'asociacion rural', 'capeco', 'fecoprod',
  // Mercado
  'ferias?', 'expo', 'remates?', 'subastas?', 'frigorific\\w*', 'faena\\w*', 'exportacion\\w*',
  'commodit\\w*',
  // Maquinaria e insumos
  'maquinaria\\w*', 'tractor\\w*', 'cosechadora\\w*', 'sembradora\\w*', 'pulverizador\\w*', 'insumos?',
  'semillas?', 'balanceado', 'sal mineral', 'alambrad\\w*', 'corral\\w*',
]

const AGRO_PATTERNS = [
  new RegExp(`\\b(${AGRO_TERMS.join('|')})\\b`),
  new RegExp(`\\b${SPECIES_OR_CROP}\\b`),
]

const OFF_TOPIC_PATTERNS = [
  // Deportes
  /\b(futbol|partidos?|gol(es)?|copa (libertadores|sudamericana|america)|champions|olimpia|cerro porteno|albirroja|seleccion paraguaya|messi|cristiano ronaldo|real madrid|formula 1|basquet|nba)\b/,
  // Farándula y entretenimiento
  /\b(farandula|chismes?|telenovelas?|novelas?|actor|actriz|cantantes?|reggaeton|famos[oa]s?|influencers?|tiktokers?|netflix|peliculas?|horoscopo|chistes?|poemas?)\b/,
  // Tareas escolares
  /\b(mi tarea|deberes|monografia|ecuacion(es)?|matematicas?|algebra|trigonometria|derivadas?|resolver (este|el|un) ejercicio)\b/,
  // Programación
  /\b(programar|programacion|programador\w*|python|javascript|typescript|html|css|sql|php|codigo (en|fuente))\b/,
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
  if (matchesAny(text, AGRO_PATTERNS)) return 'agro_information'
  if (matchesAny(text, OFF_TOPIC_PATTERNS)) return 'out_of_scope'

  return 'agro_information'
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
