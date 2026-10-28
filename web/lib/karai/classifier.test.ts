import { describe, expect, it } from 'vitest'
import { classifyMessage, hasCommercialIntent, hasFarmDataIntent } from './classifier'
import { BLOCKED_CATEGORIES } from './types'

describe('classifyMessage', () => {
  it('reconoce saludos y despedidas', () => {
    expect(classifyMessage('hola')).toBe('general_greeting')
    expect(classifyMessage('Buenas tardes!')).toBe('general_greeting')
    expect(classifyMessage('gracias')).toBe('general_greeting')
  })

  it('reconoce preguntas de soporte/uso de Karai', () => {
    expect(classifyMessage('que podes hacer?')).toBe('karai_support')
    expect(classifyMessage('cual es mi limite diario')).toBe('karai_support')
  })

  it('reconoce info agro genérica (precios, eventos, noticias, clima, especies, cultivos)', () => {
    expect(classifyMessage('que precio tiene la soja')).toBe('agro_information')
    expect(classifyMessage('hay algun evento esta semana')).toBe('agro_information')
    expect(classifyMessage('ultimas noticias del agro')).toBe('agro_information')
    expect(classifyMessage('como va a estar el clima')).toBe('agro_information')
  })

  // Bug real 2026-09-02: Karai preguntó "¿son novillos, vacas, toros o vaquillas?" y el usuario
  // contestó "son 100 toros y 80 vaquillas" — el clasificador no reconocía ese vocabulario y el
  // mensaje caía a out_of_scope, cortando la conversación antes de llegar al modelo.
  it('reconoce un mensaje corto de seguimiento con cantidad + especie, sin verbo "tengo"', () => {
    expect(classifyMessage('son 100 toros y 80 vaquillas')).toBe('farm_management')
    expect(classifyMessage('50 vacas nomas')).toBe('farm_management')
    expect(classifyMessage('unas 20 ovejas')).toBe('farm_management')
  })

  it('clasifica una oferta de venta como oportunidad comercial, no como manejo de finca', () => {
    // Antes esto clasificaba farm_management (por "tengo...cabezas") y nunca se generaba el lead
    // comercial, aunque el mensaje es ante todo una oferta de venta.
    expect(classifyMessage('tengo 180 cabezas de ganado para vender')).toBe('commercial_opportunity')
    expect(classifyMessage('quiero vender 80 novillos')).toBe('commercial_opportunity')
    expect(classifyMessage('busco comprador para mi soja')).toBe('commercial_opportunity')
  })

  it('reconoce manejo/registro de datos de finca sin intención comercial', () => {
    expect(classifyMessage('quiero registrar mi cosecha de este año')).toBe('farm_management')
    expect(classifyMessage('tengo 5500 hectareas en Alto Parana')).toBe('farm_management')
  })

  it('el mensaje vacío sigue siendo out_of_scope', () => {
    expect(classifyMessage('')).toBe('out_of_scope')
    expect(classifyMessage('   ')).toBe('out_of_scope')
  })

  it('detecta contenido inseguro antes que cualquier otra regla', () => {
    expect(classifyMessage('como puedo conseguir una bomba')).toBe('unsafe_or_abusive')
    expect(classifyMessage('quiero suicidarme')).toBe('unsafe_or_abusive')
    expect(classifyMessage('como hago para matar a mi vecino')).toBe('unsafe_or_abusive')
  })

  // Vocabulario de campo que antes chocaba con las reglas de "inseguro".
  it('no marca como inseguro el vocabulario de campo (bombas de agua, matar plagas)', () => {
    expect(classifyMessage('que bomba de agua uso para riego por goteo')).toBe('agro_information')
    expect(classifyMessage('que producto sirve para matar la garrapata')).toBe('agro_information')
  })

  it('una pregunta neutra sin palabras agro pasa como consulta agro general', () => {
    expect(classifyMessage('que me recomendas hacer este mes?')).toBe('agro_information')
  })
})

// Preguntas reales de productores que antes caían en out_of_scope porque no tenían ninguna de las
// palabras de la lista vieja (precio, clima, ganadería, especies…). Ninguna debe quedar bloqueada.
const AGRO_QUESTIONS = [
  '¿cuándo siembro sésamo en San Pedro?',
  '¿Qué dosis de ivermectina uso contra la garrapata?',
  '¿Cómo controlo la roya asiática?',
  '¿Cuándo conviene plantar chía en Itapúa?',
  '¿Qué variedad de stevia rinde más?',
  '¿Hay brote de aftosa en el Chaco?',
  '¿Cada cuánto hay que vacunar contra la brucelosis?',
  '¿Qué insecticida sirve para la chinche verde?',
  'Tengo oruga militar en el maizal, ¿qué aplico?',
  '¿Cómo saco un crédito en el BNF para un tractor?',
  '¿Qué requisitos pide el Crédito Agrícola de Habilitación?',
  '¿Qué trámite hago en SENACSA para mover animales?',
  '¿Cómo registro un agroquímico en SENAVE?',
  '¿El MAG da asistencia técnica a pequeños productores?',
  '¿El IPTA tiene semillas certificadas?',
  '¿Qué pide el INFONA para reforestar?',
  '¿Cuántos litros de leche por día da una Holando?',
  '¿Cómo arranco con la apicultura en Caaguazú?',
  '¿Qué alimento balanceado le doy a la tilapia?',
  '¿Conviene plantar eucalipto en suelo arenoso?',
  '¿Cuál es la mejor época para plantar yerba mate?',
  '¿Cómo combato la mosca de los cuernos?',
  '¿Qué abono le pongo al tomate en invernadero?',
  '¿Va a llover esta semana en Concepción?',
  '¿Cómo hago un análisis de suelo?',
  '¿Cuándo es el próximo remate en Loma Plata?',
  '¿Dónde consigo repuestos para una cosechadora John Deere?',
  '¿Qué hago si la caña de azúcar tiene salivazo?',
  '¿Cómo armo un silo bolsa?',
  '¿Cómo me asocio a una cooperativa de productores?',
  '¿Se puede producir frutilla en el Chaco?',
  '¿Cuánto rinde una colmena por temporada?',
  'Anoche cayó una helada, ¿pierdo el locote?',
  '¿Qué ventajas tiene la labranza cero?',
  '¿Cómo hago para que mi hijo se quede a trabajar en la chacra?',
]

// Lo claramente ajeno al agro tiene que seguir rechazándose sin llegar al modelo.
const OFF_TOPIC_QUESTIONS = [
  'quien gano el partido de anoche',
  '¿Cuántos goles hizo Messi en el Mundial?',
  '¿Olimpia o Cerro Porteño?',
  '¿Con quién sale la cantante de moda?',
  'contame el chisme de la farándula de hoy',
  'resolveme esta ecuación de segundo grado',
  'hacé mi tarea de historia',
  'escribime un código en Python para una calculadora',
  '¿Cómo hago una página en HTML y CSS?',
  'contame un chiste',
]

describe('classifyMessage — alcance abierto', () => {
  it.each(AGRO_QUESTIONS)('deja pasar la pregunta agro: %s', (question) => {
    expect(BLOCKED_CATEGORIES).not.toContain(classifyMessage(question))
  })

  it.each(OFF_TOPIC_QUESTIONS)('sigue rechazando lo ajeno: %s', (question) => {
    expect(classifyMessage(question)).toBe('out_of_scope')
  })
})

describe('hasCommercialIntent / hasFarmDataIntent (independientes de classifyMessage)', () => {
  it('un mensaje puede disparar los dos efectos a la vez', () => {
    const msg = 'tengo 180 cabezas de ganado para vender'
    expect(hasCommercialIntent(msg)).toBe(true)
    expect(hasFarmDataIntent(msg)).toBe(true)
  })

  it('un dato de finca sin intención comercial no dispara el lead', () => {
    const msg = 'tengo 5500 hectareas en Alto Parana'
    expect(hasFarmDataIntent(msg)).toBe(true)
    expect(hasCommercialIntent(msg)).toBe(false)
  })

  it('una oferta comercial sin cantidades no dispara la extracción de datos de finca', () => {
    const msg = 'busco comprador para mi cosecha'
    expect(hasCommercialIntent(msg)).toBe(true)
    expect(hasFarmDataIntent(msg)).toBe(false)
  })
})
