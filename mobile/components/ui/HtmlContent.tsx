import { Fragment, useState } from 'react'
import { Linking, StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { ImageZoomModal } from '@/components/ui/ImageZoomModal'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'

const ZOOM_LABEL = 'Ver imagen en grande'

interface Props {
  html: string
}

type Block =
  | { kind: 'text'; html: string }
  | { kind: 'heading'; html: string }
  | { kind: 'quote'; html: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'rule' }
  | { kind: 'image'; src: string; caption: string }

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8230;/g, '...')
}

function stripHtml(value: string) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .trim(),
  )
}

function imageSrc(html: string) {
  const src = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1]
  return src && /^https?:\/\//i.test(src) ? decodeEntities(src) : null
}

function parseBlocks(html: string): Block[] {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')

  const blocks: Block[] = []
  // Fotos entre párrafos: <figure> (botón "Imagen" del panel) o un <img> suelto / dentro de un <p>.
  const pattern = /<figure\b[^>]*>([\s\S]*?)<\/figure>|<(p|h1|h2|h3|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\2>|<hr\s*\/?>|<img\b[^>]*>/gi
  let match: RegExpExecArray | null
  let last = 0
  // Texto escrito a mano en el panel (sin <p>): cada renglón es un párrafo. Va también entre bloques
  // HTML — en una nota con texto suelto y una foto, sin esto el texto se perdía.
  const pushLoose = (text: string) => {
    for (const line of text.split(/\r?\n/)) {
      if (stripHtml(line)) blocks.push({ kind: 'text', html: line.trim() })
    }
  }

  while ((match = pattern.exec(clean))) {
    pushLoose(clean.slice(last, match.index))
    last = match.index + match[0].length
    const whole = match[0].toLowerCase()
    if (whole.startsWith('<hr')) {
      blocks.push({ kind: 'rule' })
      continue
    }
    if (whole.startsWith('<figure') || whole.startsWith('<img')) {
      const src = imageSrc(match[0])
      const caption = stripHtml(match[1]?.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1] ?? '')
      if (src) blocks.push({ kind: 'image', src, caption })
      continue
    }

    const tag = match[2].toLowerCase()
    const inner = match[3]
    const plain = stripHtml(inner)
    if (!plain) {
      const src = imageSrc(inner)
      if (src) blocks.push({ kind: 'image', src, caption: '' })
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi))
        .map((item) => item[1])
        .filter((item) => stripHtml(item))
      if (items.length > 0) blocks.push({ kind: 'list', ordered: tag === 'ol', items })
    } else if (tag.startsWith('h')) {
      blocks.push({ kind: 'heading', html: inner })
    } else if (tag === 'blockquote') {
      blocks.push({ kind: 'quote', html: inner })
    } else {
      blocks.push({ kind: 'text', html: inner })
    }
  }

  pushLoose(clean.slice(last))
  return blocks
}

function inlineParts(html: string) {
  const parts: Array<{ text: string; href?: string }> = []
  const pattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html))) {
    const before = html.slice(lastIndex, match.index)
    if (stripHtml(before)) parts.push({ text: stripHtml(before) })
    parts.push({ text: stripHtml(match[2]), href: decodeEntities(match[1]) })
    lastIndex = match.index + match[0].length
  }

  const after = html.slice(lastIndex)
  if (stripHtml(after)) parts.push({ text: stripHtml(after) })
  return parts
}

export function HtmlContent({ html }: Props) {
  const C = useColors()
  const blocks = parseBlocks(html)
  const [zoomUri, setZoomUri] = useState<string | null>(null)

  function renderInline(htmlValue: string, keyPrefix: string, style?: object) {
    return (
      <RNText style={[styles.text, { color: C.foreground }, style]}>
        {inlineParts(htmlValue).map((part, index) => (
          <Fragment key={`${keyPrefix}-${index}`}>
            {part.href ? (
              <RNText
                style={[styles.link, { color: Colors.lime }]}
                onPress={() => Linking.openURL(part.href!)}
              >
                {part.text}
              </RNText>
            ) : part.text}
          </Fragment>
        ))}
      </RNText>
    )
  }

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        if (block.kind === 'rule') {
          return <View key={index} style={[styles.rule, { backgroundColor: C.border }]} />
        }

        if (block.kind === 'image') {
          return <InlineImage key={index} src={block.src} caption={block.caption} captionColor={C.muted} onOpen={setZoomUri} />
        }

        if (block.kind === 'heading') {
          return (
            <View key={index} style={styles.heading}>
              {renderInline(block.html, `h-${index}`, styles.headingText)}
            </View>
          )
        }

        if (block.kind === 'quote') {
          return (
            <View key={index} style={[styles.quote, { borderLeftColor: Colors.lime, backgroundColor: C.secondary }]}>
              {renderInline(block.html, `q-${index}`, styles.quoteText)}
            </View>
          )
        }

        if (block.kind === 'list') {
          return (
            <View key={index} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.listItem}>
                  <RNText style={[styles.bullet, { color: Colors.lime }]}>
                    {block.ordered ? `${itemIndex + 1}.` : '•'}
                  </RNText>
                  <View style={styles.listText}>
                    {renderInline(item, `li-${index}-${itemIndex}`)}
                  </View>
                </View>
              ))}
            </View>
          )
        }

        return <View key={index}>{renderInline(block.html, `p-${index}`)}</View>
      })}
      <ImageZoomModal uri={zoomUri} onClose={() => setZoomUri(null)} />
    </View>
  )
}

interface InlineImageProps {
  src: string
  caption: string
  captionColor: string
  onOpen: (uri: string) => void
}

// Tocar la foto la abre a pantalla completa con zoom (flyers, cronogramas, tablas en imagen).
function InlineImage({ src, caption, captionColor, onOpen }: InlineImageProps) {
  // Proporción real de la foto (llega al cargar); hasta entonces 16:9 para que el texto no salte.
  const [aspectRatio, setAspectRatio] = useState(16 / 9)
  return (
    <View style={styles.figure}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onOpen(src)}
        accessibilityRole="imagebutton"
        accessibilityLabel={caption || ZOOM_LABEL}
      >
        <Image
          source={{ uri: src }}
          style={[styles.image, { aspectRatio }]}
          contentFit="cover"
          transition={150}
          onLoad={(event) => {
            const { width, height } = event.source
            if (width > 0 && height > 0) setAspectRatio(width / height)
          }}
        />
      </TouchableOpacity>
      {caption ? <RNText style={[styles.caption, { color: captionColor }]}>{caption}</RNText> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: Spacing[4] },
  text: {
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    lineHeight: 26,
  },
  heading: { marginTop: Spacing[2] },
  headingText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  quote: {
    borderLeftWidth: 3,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  quoteText: {
    fontFamily: Fonts.dmSansMedium,
    fontStyle: 'italic',
  },
  link: {
    fontFamily: Fonts.dmSansSemiBold,
    textDecorationLine: 'underline',
  },
  list: { gap: Spacing[2] },
  listItem: { flexDirection: 'row', gap: Spacing[2], alignItems: 'flex-start' },
  bullet: {
    width: 22,
    fontFamily: Fonts.dmSansSemiBold,
    fontSize: 16,
    lineHeight: 26,
  },
  listText: { flex: 1 },
  figure: { marginVertical: Spacing[2] },
  image: { width: '100%', borderRadius: Radius.md },
  caption: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: Spacing[2],
  },
  rule: {
    height: 1,
    marginVertical: Spacing[2],
  },
})
