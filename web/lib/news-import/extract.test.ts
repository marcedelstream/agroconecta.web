import { describe, expect, it } from 'vitest'
import { parseArticle } from './extract'
import { blocksToHtml, buildDraft } from './draft'
import type { AIProvider } from '@/lib/karai/ai-provider'

const HTML = `<!doctype html><html><head>
<meta property="og:title" content="Se presentó la plataforma &quot;El Chaco&quot; | Canal AyN"/>
<meta property="og:site_name" content="Canal AyN"/>
<meta property="og:image" content="https://cdn.example.com/foto.jpg"/>
<script type="application/ld+json">{"@type":"NewsArticle","headline":"Se presentó la plataforma \\"El Chaco\\"","articleSection":"Ganaderia"}</script>
</head><body><nav><p>Menú que no es la nota y tiene bastante texto para confundir al extractor si no se limpia bien.</p></nav>
<article><p>Fecha de publicación</p><h1>Título</h1>
<p>​Con una mirada integral, se dio a conocer en Expo Pioneros la plataforma &quot;El Chaco que tenés que conocer&quot; para toda la región productiva.</p>
<p>​Más producción de la que se conoce</p>
<p>El Chaco produce mucho más de lo que se conoce, y los impulsores quieren contarlo con un ecosistema de contenidos permanente.</p>
<p>. - Sector Productivo: ganadería y agricultura.</p>
<p>. - Sector Social: familias y comunidades.</p>
<h2>Noticias relacionadas</h2><p>Otra nota que no va y que debería quedar afuera del texto importado.</p>
</article></body></html>`

describe('parseArticle', () => {
  const article = parseArticle(HTML, 'https://www.canalayn.com/ganaderia/nota')

  it('toma título, medio, imagen y sección', () => {
    expect(article.title).toBe('Se presentó la plataforma "El Chaco"')
    expect(article.siteName).toBe('Canal AyN')
    expect(article.imageUrl).toBe('https://cdn.example.com/foto.jpg')
    expect(article.section).toBe('Ganaderia')
  })

  it('arma bloques limpios y corta en "Noticias relacionadas"', () => {
    expect(article.blocks.map((b) => b.type)).toEqual(['p', 'h2', 'p', 'li', 'li'])
    expect(article.blocks[0].text.startsWith('Con una mirada')).toBe(true)
    expect(article.blocks[3].text).toBe('Sector Productivo: ganadería y agricultura.')
  })

  it('agrupa viñetas en una lista HTML', () => {
    expect(blocksToHtml(article.blocks)).toContain('<ul><li>Sector Productivo')
  })

  it('sin IA copia el texto y agrega la fuente con link', async () => {
    const draft = await buildDraft(article, 'verbatim', null)
    expect(draft.category).toBe('ganaderia')
    expect(draft.content).toContain('Fuente: <a href="https://www.canalayn.com/ganaderia/nota"')
    expect(draft.warning).toBeNull()
  })

  it('reescrita usa la respuesta de la IA y filtra departamentos inválidos', async () => {
    const ai: AIProvider = {
      generate: async () => ({
        text: '{"title":"Nueva plataforma para el Chaco","summary":"Resumen.","content_html":"<p>Texto nuevo.</p><script>x</script>","category":"institucional","target_departments":["boqueron","marte"]}',
        tokensUsed: 1,
      }),
      generateStream: async function* () {},
    }
    const draft = await buildDraft(article, 'rewrite', ai)
    expect(draft.title).toBe('Nueva plataforma para el Chaco')
    expect(draft.content).toContain('<p>Texto nuevo.</p>')
    expect(draft.content).not.toContain('script')
    expect(draft.content).toContain('Con información de')
    expect(draft.category).toBe('institucional')
    expect(draft.target_departments).toEqual(['boqueron'])
  })
})
