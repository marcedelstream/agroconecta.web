import { describe, expect, it } from 'vitest'
import { friendlyDbError, validatePost, type PostDraftInput } from './post-validation'

const ok: PostDraftInput = {
  title: 'Lanzan plataforma para el Chaco',
  summary: 'Resumen.',
  content: '<p>Texto.</p>',
  contentType: 'article',
  editorialStatus: 'published',
  organizationId: 'org-1',
  youtubeUrl: '',
  imageUrl: 'https://cdn.example.com/foto.jpg',
  hasImageFile: false,
}

describe('validatePost', () => {
  it('deja pasar una nota completa', () => {
    expect(validatePost(ok)).toEqual([])
  })

  it('frena si falta la organización, que la base no acepta vacía', () => {
    expect(validatePost({ ...ok, organizationId: '' })).toHaveLength(1)
  })

  it('pide imagen y resumen solo al publicar', () => {
    const sinNada = { ...ok, summary: '', imageUrl: '' }
    expect(validatePost(sinNada)).toHaveLength(2)
    expect(validatePost({ ...sinNada, editorialStatus: 'draft' })).toEqual([])
  })

  it('pide YouTube para videos y remates', () => {
    expect(validatePost({ ...ok, contentType: 'video', youtubeUrl: '' })).toHaveLength(1)
    expect(validatePost({ ...ok, contentType: 'video', youtubeUrl: 'https://youtu.be/abc' })).toEqual([])
  })

  it('frena fotos pegadas dentro del contenido', () => {
    expect(validatePost({ ...ok, content: '<p><img src="data:image/png;base64,AAAA"></p>' })).toHaveLength(1)
  })

  it('traduce el error de organización vacía', () => {
    expect(friendlyDbError('null value in column "organization_id" violates not-null constraint')).toMatch(/organización/)
  })
})

describe('validatePost — solo flyer', () => {
  const flyer = { ...ok, summary: '', content: '', imageUrl: '', flyerOnly: true }

  it('no pide texto ni resumen, solo el flyer', () => {
    expect(validatePost({ ...flyer, hasImageFile: true })).toEqual([])
    expect(validatePost(flyer)).toHaveLength(1)
  })
})
