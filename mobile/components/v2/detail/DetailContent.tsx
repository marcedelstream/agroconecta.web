import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { Text } from '@/components/ui/Text'
import { HtmlContent } from '@/components/ui/HtmlContent'
import { InlineAdBlock } from '@/components/v2/detail/InlineAdBlock'
import { Colors } from '@/constants/colors'
import { canFollow } from '@/lib/feed-v2/actions'
import type { FeedDetail } from '@/lib/feed-v2/detail'
import { DETAIL_TEXT, FEED_TEXT, TYPE_LABEL } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'

const V = Colors.v2
const ORG_AVATAR = 40

interface Props {
  item: FeedContentItem
  detail: FeedDetail | null
  onToggleFollow: () => void
  /** Cierra la ficha antes de navegar (clic en la publicidad). */
  onNavigate: () => void
}

/** Corta el HTML después del primer párrafo, para meter la publicidad entre el primero y el segundo. */
function splitFirstParagraph(html: string): [string, string] {
  const end = html.indexOf('</p>')
  if (end < 0) return [html, '']
  return [html.slice(0, end + 4), html.slice(end + 4)]
}

// Tipo, título, organización con Seguir, fecha/lugar (eventos y remates) y cuerpo.
export function DetailContent({ item, detail, onToggleFollow, onNavigate }: Props) {
  const when = detail?.when
  const place = detail?.place
  return (
    <View style={styles.wrap}>
      <Text family="noto-sans" weight="bold" size={12} color={V.limeText} style={styles.type}>
        {item.isLive ? FEED_TEXT.live : TYPE_LABEL[item.contentType]}
      </Text>
      <Text family="noto-sans" weight="extrabold" size={26} lineHeight={30} color={V.navy} style={styles.title}>
        {item.title}
      </Text>

      <View style={styles.orgRow}>
        <View style={styles.orgAvatar}>
          {item.organizationLogoUrl ? <Image source={item.organizationLogoUrl} style={styles.orgLogo} contentFit="cover" /> : null}
        </View>
        <Text family="noto-sans" weight="bold" size={15} color={V.navy} numberOfLines={1} style={styles.orgName}>
          {item.organizationName}
        </Text>
        {canFollow(item) && (
          <TouchableOpacity
            onPress={onToggleFollow}
            activeOpacity={0.8}
            accessibilityRole="button"
            style={[styles.follow, item.following ? styles.followOn : styles.followOff]}
          >
            <Text family="noto-sans" weight="bold" size={14} color={V.navy}>
              {item.following ? DETAIL_TEXT.following : DETAIL_TEXT.follow}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {(when || place) && (
        <View style={styles.card}>
          {when ? <Text family="noto-sans" weight="bold" size={15} color={V.navy}>{when}</Text> : null}
          {place ? <Text family="noto-sans" size={14} color={V.muted}>{place}</Text> : null}
        </View>
      )}

      {detail === null ? (
        <ActivityIndicator color={V.limeText} style={styles.loading} />
      ) : detail.bodyHtml ? (
        <ArticleBody html={detail.bodyHtml} withAd={item.contentType === 'noticia'} onNavigate={onNavigate} />
      ) : (
        <Text family="noto-sans" size={16} lineHeight={24} color={V.sheet.body}>
          {detail.bodyText}
        </Text>
      )}
    </View>
  )
}

function ArticleBody({ html, withAd, onNavigate }: { html: string; withAd: boolean; onNavigate: () => void }) {
  const [first, rest] = splitFirstParagraph(html)
  if (!withAd || !rest.trim()) return <HtmlContent html={html} />
  return (
    <>
      <HtmlContent html={first} />
      <InlineAdBlock onNavigate={onNavigate} />
      <HtmlContent html={rest} />
    </>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  type: { letterSpacing: 1.2 },
  title: { letterSpacing: -0.5 },
  orgRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orgAvatar: { width: ORG_AVATAR, height: ORG_AVATAR, borderRadius: ORG_AVATAR / 2, overflow: 'hidden', backgroundColor: V.navy },
  orgLogo: { width: '100%', height: '100%' },
  orgName: { flex: 1 },
  follow: { height: 36, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  followOff: { backgroundColor: V.lime, borderColor: V.lime },
  followOn: { backgroundColor: V.surface, borderColor: V.sheet.border },
  card: { backgroundColor: V.surface, borderRadius: 20, borderWidth: 1, borderColor: V.sheet.borderSoft, paddingVertical: 14, paddingHorizontal: 16, gap: 6 },
  loading: { marginVertical: 24 },
})
