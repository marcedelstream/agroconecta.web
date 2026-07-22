import { Fragment } from 'react'
import { Linking, StyleSheet, Text as RNText, View } from 'react-native'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'

interface Props {
  html: string
}

type Block =
  | { kind: 'text'; html: string }
  | { kind: 'heading'; html: string }
  | { kind: 'quote'; html: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'rule' }

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

function parseBlocks(html: string): Block[] {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')

  const blocks: Block[] = []
  const pattern = /<(p|h1|h2|h3|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(clean))) {
    if (match[0].toLowerCase().startsWith('<hr')) {
      blocks.push({ kind: 'rule' })
      continue
    }

    const tag = match[1].toLowerCase()
    const inner = match[2]
    const plain = stripHtml(inner)
    if (!plain) continue

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

  if (blocks.length > 0) return blocks

  return clean
    .split(/\n{2,}/)
    .map((paragraph) => stripHtml(paragraph))
    .filter(Boolean)
    .map((paragraph) => ({ kind: 'text', html: paragraph }))
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
  rule: {
    height: 1,
    marginVertical: Spacing[2],
  },
})
