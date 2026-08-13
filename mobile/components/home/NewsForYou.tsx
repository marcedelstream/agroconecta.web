import { router } from 'expo-router'
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { getCategoryLabel } from '@/lib/mock-data'
import type { Post } from '@/lib/types'

const R = Colors.redesign

function timeAgo(date: Date): string {
  const h = Math.floor((Date.now() - date.getTime()) / 3600000)
  if (h < 1) return 'Hace menos de 1h'
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

interface Props {
  hero: Post
  rows: Post[]
  onPress: (id: string) => void
}

export function NewsForYou({ hero, rows, onPress }: Props) {
  return (
    <View>
      <View style={styles.headerRow}>
        <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>Noticias para vos</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/noticias' as any)} hitSlop={8}>
          <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
            Mostrar más
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.heroCard} activeOpacity={0.9} onPress={() => onPress(hero.id)}>
        <Image source={{ uri: hero.imageUrl }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroBody}>
          <View style={styles.chip}>
            <Text family="noto-sans" weight="bold" size={10} color={R.limeSoftText} style={styles.chipText}>
              {getCategoryLabel(hero.category).toUpperCase()}
            </Text>
          </View>
          <Text family="noto-sans" weight="bold" size={16} lineHeight={22} color={R.foreground}>
            {hero.title}
          </Text>
          <Text family="noto-sans" size={11.5} color={R.mutedForeground}>
            {hero.source} · {timeAgo(hero.publishedAt)}
          </Text>
        </View>
      </TouchableOpacity>

      {rows.length > 0 && (
        <View style={styles.rowsCard}>
          {rows.map((post, i) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.row, i < rows.length - 1 && styles.rowDivider]}
              activeOpacity={0.75}
              onPress={() => onPress(post.id)}
            >
              <Image source={{ uri: post.imageUrl }} style={styles.thumb} resizeMode="cover" />
              <View style={styles.rowText}>
                <Text family="noto-sans" weight="semibold" size={13} lineHeight={17} color={R.foreground} numberOfLines={2}>
                  {post.title}
                </Text>
                <Text family="noto-sans" size={11} color={R.mutedForeground}>
                  {post.source} · {timeAgo(post.publishedAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  underline: { textDecorationLine: 'underline' },
  heroCard: { backgroundColor: R.surface, borderRadius: 16, overflow: 'hidden' },
  heroImage: { width: '100%', height: 146 },
  heroBody: { padding: 14, gap: 7 },
  chip: { alignSelf: 'flex-start', backgroundColor: R.limeSoftBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { letterSpacing: 0.5 },
  rowsCard: { backgroundColor: R.surface, borderRadius: 16, marginTop: 10, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: R.divider },
  thumb: { width: 48, height: 48, borderRadius: 10 },
  rowText: { flex: 1, minWidth: 0, gap: 3 },
})
