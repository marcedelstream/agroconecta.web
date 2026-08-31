import { useEffect, useState } from 'react'
import { ScrollView, View, Image, TouchableOpacity, Share, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Text } from '@/components/ui/Text'
import { HtmlContent } from '@/components/ui/HtmlContent'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { useRequireAuth } from '@/lib/require-auth'
import { mockNews, mockPublishers, getCategoryLabel } from '@/lib/mock-data'
import { fetchPublishedPostBySlug, fetchOrganizationById, fetchPublishedPosts } from '@/lib/supabase-repositories'
import type { Organization, Post } from '@/lib/types'

const R = Colors.redesign
const SAVED_ARTICLES_KEY = '@agroconecta:saved_articles'

const MOCK_CONTENT = `El sector agropecuario paraguayo continúa consolidándose como uno de los motores de la economía nacional. Los datos más recientes reflejan un crecimiento sostenido que posiciona al país entre los principales referentes de la región.

Según las cifras reveladas por las principales gremiales del sector, los indicadores muestran una tendencia positiva que se ha mantenido durante los últimos meses, impulsada principalmente por condiciones climáticas favorables y el aumento de la demanda internacional.

Los productores y actores del ecosistema agropecuario coinciden en que las inversiones en tecnología y el acceso a mercados internacionales han sido claves para alcanzar estos resultados. "Estamos en el mejor momento del sector en los últimos cinco años", señaló un referente del gremio.

Por su parte, las autoridades del Ministerio de Agricultura y Ganadería (MAG) destacaron que las políticas de apoyo implementadas durante el último año han tenido un impacto directo en la competitividad del agro paraguayo.

El contexto internacional también ha favorecido al sector, con precios de commodities en niveles históricamente altos y una creciente demanda de alimentos de calidad en los mercados de Asia y Europa.

De cara al futuro, los especialistas proyectan que la tendencia continuará, siempre que se mantengan las condiciones climáticas actuales y se siga apostando por la innovación y la adopción de buenas prácticas agropecuarias.`

function timeAgo(date: Date): string {
  const h = Math.floor((Date.now() - date.getTime()) / 3600000)
  if (h < 1) return 'Hace menos de 1h'
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, updateUser } = useApp()
  const requireAuth = useRequireAuth()

  const [article, setArticle] = useState<Post | null>(null)
  const [publisher, setPublisher] = useState<Organization | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    const local = mockNews.find((n) => n.id === id) ?? null
    setArticle(local)
    let mounted = true
    fetchPublishedPostBySlug(id)
      .then((remote) => { if (mounted && remote) setArticle(remote) })
      .catch(() => { if (mounted && !local) setArticle(null) })
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    setPublisher(null)
    if (!article?.publisherId) return
    let mounted = true
    fetchOrganizationById(article.publisherId)
      .then((org) => { if (mounted) setPublisher(org ?? mockPublishers.find((p) => p.id === article.publisherId) ?? null) })
      .catch(() => { if (mounted) setPublisher(mockPublishers.find((p) => p.id === article.publisherId) ?? null) })
    return () => { mounted = false }
  }, [article?.publisherId])

  useEffect(() => {
    if (!article) return
    fetchPublishedPosts()
      .then((posts) => {
        const others = posts.filter((p) => p.id !== article.id && p.category === article.category)
        setRelated(others.slice(0, 2))
      })
      .catch(() => setRelated([]))
  }, [article])

  useEffect(() => {
    if (!id) return
    AsyncStorage.getItem(SAVED_ARTICLES_KEY)
      .then((raw) => {
        const list: string[] = raw ? JSON.parse(raw) : []
        setSaved(list.includes(id))
      })
      .catch(() => {})
  }, [id])

  async function toggleSaved() {
    if (!id) return
    const raw = await AsyncStorage.getItem(SAVED_ARTICLES_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    const updated = saved ? list.filter((x) => x !== id) : [...list, id]
    await AsyncStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(updated))
    setSaved(!saved)
  }

  const isFollowed = user?.organizationSubscriptions?.includes(article?.publisherId ?? '') ?? false

  async function toggleFollow() {
    if (!article?.publisherId || !requireAuth() || !user) return
    const current = user.organizationSubscriptions ?? []
    const updated = isFollowed
      ? current.filter((x) => x !== article.publisherId)
      : [...current, article.publisherId]
    await updateUser({ organizationSubscriptions: updated, mediaPreferences: updated })
  }

  async function handleShare() {
    if (!article) return
    await Share.share({
      message: `${article.title}\n\nLeé más en Agroconecta`,
      url: `https://agroconecta.com.py/noticias/${article.slug ?? article.id}`,
    })
  }

  if (!article) {
    return (
      <View style={[styles.centerFill, { backgroundColor: R.background }]}>
        <Ionicons name="newspaper-outline" size={40} color={R.mutedForeground} />
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: R.surface }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} hitSlop={12}>
              <Ionicons name="share-outline" size={19} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSaved} hitSlop={12}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={19} color={saved ? Colors.lime : '#FFFFFF'} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: article.imageUrl }} style={styles.hero} resizeMode="cover" />

        <View style={styles.content}>
          <View style={styles.chip}>
            <Text family="noto-sans" weight="bold" size={10} color={R.limeSoftText} style={styles.chipText}>
              {getCategoryLabel(article.category).toUpperCase()}
            </Text>
          </View>

          <Text family="noto-sans" weight="extrabold" size={23} lineHeight={30} color={R.foreground} style={styles.title}>
            {article.title}
          </Text>

          <TouchableOpacity
            style={styles.authorRow}
            activeOpacity={publisher ? 0.8 : 1}
            onPress={() => publisher && router.push(`/publisher/${publisher.id}`)}
          >
            {(publisher?.logoUrl ?? article.organizationLogoUrl) ? (
              <Image source={{ uri: publisher?.logoUrl ?? article.organizationLogoUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text family="noto-sans" weight="bold" size={12} color={R.limeSoftText}>{initials(article.source)}</Text>
              </View>
            )}
            <View style={styles.authorText}>
              <Text family="noto-sans" weight="semibold" size={12.5} color={R.foreground}>{article.source}</Text>
              <Text family="noto-sans" size={11} color={R.mutedForeground}>
                {timeAgo(article.publishedAt)} · {article.readTime} min de lectura
              </Text>
            </View>
            {article.publisherId && (
              <TouchableOpacity
                style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                onPress={toggleFollow}
                activeOpacity={0.8}
              >
                <Text family="noto-sans" weight="semibold" size={11.5} color={isFollowed ? '#FFFFFF' : R.foreground}>
                  {isFollowed ? 'Siguiendo' : 'Seguir'}
                </Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View style={styles.body}>
            <HtmlContent html={article.content || MOCK_CONTENT} />
          </View>
        </View>

        {related.length > 0 && (
          <View style={styles.relatedWrap}>
            <Text family="noto-sans" weight="bold" size={15} color={R.foreground} style={styles.relatedTitle}>
              Seguí leyendo
            </Text>
            <View style={styles.relatedCard}>
              {related.map((post, i) => (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.relatedRow, i < related.length - 1 && styles.relatedRowDivider]}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/article/${post.id}`)}
                >
                  <Image source={{ uri: post.imageUrl }} style={styles.relatedThumb} resizeMode="cover" />
                  <View style={styles.relatedText}>
                    <Text family="noto-sans" weight="semibold" size={13} lineHeight={17} color={R.foreground} numberOfLines={2}>
                      {post.title}
                    </Text>
                    <Text family="noto-sans" size={11} color={R.mutedForeground} style={styles.relatedMeta}>
                      {post.source} · {timeAgo(post.publishedAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hero: { width: '100%', height: 210 },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  chip: { alignSelf: 'flex-start', backgroundColor: R.limeSoftBg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { letterSpacing: 0.5 },
  title: { marginTop: 10 },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: R.divider,
  },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: R.limeSoftBg, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 34, height: 34, borderRadius: 17 },
  authorText: { flex: 1, gap: 1 },
  followBtn: { borderWidth: 1, borderColor: R.border, borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 6 },
  followBtnActive: { backgroundColor: R.foreground, borderColor: R.foreground },
  body: { paddingTop: 18, paddingBottom: 4 },
  relatedWrap: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 26 },
  relatedTitle: { marginBottom: 10 },
  relatedCard: { backgroundColor: R.secondary, borderRadius: 16, paddingHorizontal: 14 },
  relatedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  relatedRowDivider: { borderBottomWidth: 1, borderBottomColor: '#E9E9E2' },
  relatedThumb: { width: 48, height: 48, borderRadius: 10 },
  relatedText: { flex: 1, minWidth: 0 },
  relatedMeta: { marginTop: 3 },
})
