import { describe, expect, it } from 'vitest'
import { parseNumber, parseSourceDate, parseValorAgro } from './valoragro'

const table = (title: string, heads: string[], rows: [string, string[]][], note: string) => `
<article class="box-shadow tabla-mercados"><span class="title-mercados">${title}</span>
${heads.map((h) => `<span class="est-mercados float-right">${h}</span>`).join('')}
${rows.map(([label, vals]) => `<span class="cat-mercados">${label}</span>${vals.map((v) => `<span class="result-mercados">\n${v}\t</span>`).join('')}`).join('')}
<span class="msj_mercados">${note}</span></article>`

const html = [
  table('Ganado a frigorífico', ['Categoría', 'Semana Anterior', 'Semana Actual'], [['Macho', ['5.40', '5.45']], ['Europa', ['5,45', '5,50']]], 'Precio por kg expresados en dólares / Última actualización: 03/11/2026'),
  table('Ovino a frigorífico', ['Categoría', 'Semana Anterior', 'Semana Actual'], [['Cordero', ['35.000', '35.000']]], 'Precio por kg expresados en dólares / Última actualización: 21/10/2026'),
  table('Ganado <br>de consumo', ['Categoría', 'Máx', 'Min', 'Promedio'], [['Novillos', ['18.520', '16.860', '17.435']]], 'Precio por kg expresados en guaraníes / Última actualización: 29/10/2026'),
].join('')

describe('parseNumber', () => {
  it('distingue decimales de miles', () => {
    expect(parseNumber('5.40')).toEqual({ value: 5.4, thousands: false })
    expect(parseNumber('5,45')).toEqual({ value: 5.45, thousands: false })
    expect(parseNumber('18.520')).toEqual({ value: 18520, thousands: true })
  })
})

describe('parseValorAgro', () => {
  const rows = parseValorAgro(html)

  it('frigorífico en dólares con la semana anterior', () => {
    expect(rows.find((r) => r.label === 'Europa')).toMatchObject({ currency: 'USD', value: 5.5, previousValue: 5.45, sourceDate: '2026-11-03' })
  })

  it('el cordero con miles va en guaraníes aunque la tabla diga dólares', () => {
    expect(rows.find((r) => r.label === 'Cordero')).toMatchObject({ currency: 'PYG', value: 35000 })
  })

  it('consumo: promedio como valor, con máximo y mínimo', () => {
    expect(rows.find((r) => r.label === 'Novillos')).toMatchObject({ market: 'Ganado de consumo', currency: 'PYG', value: 17435, minValue: 16860, maxValue: 18520, sourceDate: '2026-10-29' })
  })

  it('una página sin tablas no inventa precios', () => {
    expect(parseValorAgro('<html></html>')).toEqual([])
    expect(parseSourceDate('sin fecha')).toBeNull()
  })
})
