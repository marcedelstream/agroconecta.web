import { describe, expect, it } from 'vitest'
import { pickTopicRecipients, topicPushData, topicTitle } from './topic-push-rules'

const facets = [
  { user_id: 'ana', value: 'sesamo' },
  { user_id: 'ana', value: 'soja' },
  { user_id: 'beto', value: 'tambo' },
  { user_id: 'caro', value: 'sesamo' },
  { user_id: 'dani', value: 'sesamo' },
]

describe('pickTopicRecipients', () => {
  it('avisa solo a quien eligió alguna etiqueta del contenido, una vez por persona', () => {
    expect(pickTopicRecipients(['sesamo', 'soja'], facets, new Map(), new Set()).sort()).toEqual(['ana', 'caro', 'dani'])
  })

  it('respeta a quien desactivó "Novedades de tus temas"', () => {
    const prefs = new Map<string, Record<string, boolean>>([['caro', { topicAlerts: false }], ['dani', { breakingNews: true }]])
    expect(pickTopicRecipients(['sesamo'], facets, prefs, new Set()).sort()).toEqual(['ana', 'dani'])
  })

  it('no le manda un segundo aviso por tema en el mismo día', () => {
    expect(pickTopicRecipients(['sesamo'], facets, new Map(), new Set(['ana'])).sort()).toEqual(['caro', 'dani'])
  })

  it('sin etiquetas no avisa a nadie', () => {
    expect(pickTopicRecipients([], facets, new Map(), new Set())).toEqual([])
  })
})

describe('topicTitle y topicPushData', () => {
  it('arma el título con la etiqueta', () => {
    expect(topicTitle(['Sésamo'])).toBe('Novedad de Sésamo')
    expect(topicTitle(['Sésamo', 'Chía', 'Soja'])).toBe('Novedades de Sésamo y Chía')
  })

  it('abre el contenido correcto en la app', () => {
    expect(topicPushData('post:abc')).toEqual({ articleId: 'abc' })
    expect(topicPushData('event:expo-2026')).toEqual({ eventSlug: 'expo-2026' })
    expect(topicPushData('listing:xyz')).toEqual({ listingId: 'xyz' })
  })
})
