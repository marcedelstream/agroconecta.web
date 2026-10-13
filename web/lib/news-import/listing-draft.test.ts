import { describe, expect, it } from 'vitest'
import type { AIProvider } from '@/lib/karai/ai-provider'
import type { ExtractedArticle } from './extract'
import { buildListingDraft, normalizeContact } from './listing-draft'

const page: ExtractedArticle = {
  url: 'https://ejemplo.com.py/empleos/capataz',
  title: 'Se busca capataz',
  description: 'Estancia en San Pedro busca capataz con experiencia.',
  imageUrl: 'https://ejemplo.com.py/foto.jpg',
  siteName: 'Ejemplo',
  section: null,
  publishedAt: null,
  blocks: [{ type: 'p', text: 'Requisitos: 5 años de experiencia. Llamar al 0981 123 456.' }],
}

function fakeAi(text: string): AIProvider {
  return {
    generate: async () => ({ text, tokensUsed: null }),
    generateStream: async function* () {},
  }
}

describe('normalizeContact', () => {
  it('convierte celulares paraguayos a wa.me', () => {
    expect(normalizeContact('0981 123 456')).toBe('https://wa.me/595981123456')
    expect(normalizeContact('+595 981 123456')).toBe('https://wa.me/595981123456')
  })

  it('deja links y mails como están', () => {
    expect(normalizeContact('https://forms.gle/abc')).toBe('https://forms.gle/abc')
    expect(normalizeContact('rrhh@estancia.com.py')).toBe('rrhh@estancia.com.py')
  })

  it('descarta textos que no son contacto', () => {
    expect(normalizeContact('consultar')).toBe('')
    expect(normalizeContact(undefined)).toBe('')
  })
})

describe('buildListingDraft', () => {
  it('sin IA completa lo básico y lleva el contacto al aviso original', async () => {
    const draft = await buildListingDraft(page, 'empleo', null)
    expect(draft.title).toBe('Se busca capataz')
    expect(draft.contact_url).toBe(page.url)
    expect(draft.image_url).toBe(page.imageUrl)
    expect(draft.warning).not.toBeNull()
  })

  it('usa lo que extrae la IA', async () => {
    const ai = fakeAi('{"title":"Capataz de estancia","location":"San Pedro","modality":"Con vivienda","description":"Buscan capataz.","category_label":"Ganadería","publisher_name":"Estancia X","contact":"0981 123 456"}')
    const draft = await buildListingDraft(page, 'empleo', ai)
    expect(draft).toMatchObject({
      title: 'Capataz de estancia',
      location: 'San Pedro',
      category_label: 'Ganadería',
      publisher_name: 'Estancia X',
      contact_url: 'https://wa.me/595981123456',
      warning: null,
    })
  })

  it('si la IA responde basura, avisa y conserva lo básico', async () => {
    const draft = await buildListingDraft(page, 'curso', fakeAi('no sé'))
    expect(draft.title).toBe('Se busca capataz')
    expect(draft.warning).toMatch(/Revisá/)
  })
})
