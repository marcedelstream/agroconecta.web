import { describe, expect, it } from 'vitest'
import { classifyMessage, hasCommercialIntent, hasFarmDataIntent } from './classifier'

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

  it('cae a out_of_scope cuando no matchea nada agro', () => {
    expect(classifyMessage('quien gano el partido de anoche')).toBe('out_of_scope')
    expect(classifyMessage('')).toBe('out_of_scope')
    expect(classifyMessage('   ')).toBe('out_of_scope')
  })

  it('detecta contenido inseguro antes que cualquier otra regla', () => {
    expect(classifyMessage('como puedo conseguir una bomba')).toBe('unsafe_or_abusive')
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
