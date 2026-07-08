import { useEffect, useState } from 'react'
import { ScrollView, View, Image, TouchableOpacity, Share, Linking, StyleSheet } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/card'
import { AdBanner } from '@/components/ui/AdBanner'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { mockNews, mockPublishers } from '@/lib/mock-data'
import { fetchPublishedPostBySlug, fetchOrganizationById } from '@/lib/supabase-repositories'
import type { Organization, Post } from '@/lib/types'

const MOCK_CONTENT = `El sector agropecuario paraguayo continúa consolidándose como uno de los motores de la economía nacional. Los datos más recientes reflejan un crecimiento sostenido que posiciona al país entre los principales referentes de la región.

Según las cifras reveladas por las principales gremiales del sector, los indicadores muestran una tendencia positiva que se ha mantenido durante los últimos meses, impulsada principalmente por condiciones climáticas favorables y el aumento de la demanda internacional.

Los productores y actores del ecosistema agropecuario coinciden en que las inversiones en tecnología y el acceso a mercados internacionales han sido claves para alcanzar estos resultados. "Estamos en el mejor momento del sector en los últimos cinco años", señaló un referente del gremio.

Por su parte, las autoridades del Ministerio de Agricultura y Ganadería (MAG) destacaron que las políticas de apoyo implementadas durante el último año han tenido un impacto directo en la competitividad del agro paraguayo.

El contexto internacional también ha favorecido al sector, con precios de commodities en niveles históricamente altos y una creciente demanda de alimentos de calidad en los mercados de Asia y Europa.

De cara al futuro, los especialistas proyectan que la tendencia continuará, siempre que se mantengan las condiciones climáticas actuales y se siga apostando por la innovación y la adopción de buenas prácticas agropecuarias.`

function formatDate(date: Date) {
  return date.toLocaleDateString('es-PY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
function formatTime(date: Date) {
  return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
}
function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [article, setArticle] = useState<Post | null>(null)
  const [publisher, setPublisher] = useState<Organization | null>(null)
  const C = useColors()
  const insets = useSafeAreaInsets()

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

  if (!article) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.background }}>
        <Ionicons name="newspaper-outline" size={40} color={C.muted} />
      </View>
    )
  }

  const shareText = `${article.title}\n\nLeé más en Agroconecta`
  const shareUrl = `https://agroconecta.com.py/noticias/${article.slug ?? article.id}`

  async function handleNativeShare() {
    await Share.share({ message: shareText, url: shareUrl })
  }
  function shareWhatsApp() {
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`)
  }
  function shareTwitter() {
    Linking.openURL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`)
  }
  function shareFacebook() {
    Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['bottom']}>
      {/* Scroll sin bounce — la imagen sube con el contenido pero no rebota al bajar */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Banner: parte del scroll, pero sin rebote */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: article.imageUrl }} style={styles.banner} resizeMode="cover" />
          <View style={styles.bannerOverlay} />

          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + Spacing[2] }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareBtn, { top: insets.top + Spacing[2] }]}
            onPress={handleNativeShare}
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Contenido del artículo */}
        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Badge variant={article.category}>{categoryLabel(article.category)}</Badge>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color={C.muted} />
              <Text variant="caption" color={C.muted}>{formatDate(article.publishedAt)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={13} color={C.muted} />
              <Text variant="caption" color={C.muted}>{formatTime(article.publishedAt)}</Text>
            </View>
          </View>

          <Text variant="title" weight="bold" family="poppins" style={styles.title}>
            {article.title}
          </Text>

          <TouchableOpacity
            activeOpacity={publisher ? 0.8 : 1}
            onPress={() => publisher && router.push(`/publisher/${publisher.id}`)}
          >
            <Card style={styles.sourceCard} padding={3}>
              <View style={styles.sourceInner}>
                {(publisher?.logoUrl ?? article.organizationLogoUrl) ? (
                  <Image source={{ uri: publisher?.logoUrl ?? article.organizationLogoUrl }} style={styles.sourceAvatarImage} />
                ) : (
                  <View style={styles.sourceAvatar}>
                    <Ionicons name="newspaper-outline" size={20} color={Colors.lime} />
                  </View>
                )}
                <View style={styles.sourceText}>
                  <Text variant="caption" color={C.muted}>Fuente</Text>
                  <View style={styles.sourceNameRow}>
                    <Text variant="body" weight="semibold">{article.source}</Text>
                    {publisher?.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color={Colors.lime} />
                    )}
                  </View>
                </View>
                {publisher && <Ionicons name="chevron-forward" size={18} color={C.muted} />}
              </View>
            </Card>
          </TouchableOpacity>

          <View style={styles.socialSection}>
            <Text variant="caption" color={C.muted} weight="medium">COMPARTIR</Text>
            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#25D366' }]} onPress={shareWhatsApp}>
                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                <Text variant="caption" style={styles.socialLabel}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#000' }]} onPress={shareTwitter}>
                <Text style={{ fontSize: 18, lineHeight: 20, fontWeight: '800', color: '#fff' }}>X</Text>
                <Text variant="caption" style={styles.socialLabel}>X</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2' }]} onPress={shareFacebook}>
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <Text variant="caption" style={styles.socialLabel}>Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: C.secondary, borderWidth: 1, borderColor: C.border }]}
                onPress={handleNativeShare}
              >
                <Ionicons name="share-social-outline" size={20} color={C.foreground} />
                <Text variant="caption" style={[styles.socialLabel, { color: C.foreground }]}>Más</Text>
              </TouchableOpacity>
            </View>
          </View>

          <AdBanner />

          <Text variant="body" style={[styles.summary, { color: C.foreground, borderLeftColor: Colors.lime }]}>
            {article.summary}
          </Text>

          <View style={styles.body}>
            {(article.content || MOCK_CONTENT).split('\n\n').map((paragraph, i) => (
              <Text key={i} variant="body" style={[styles.paragraph, { color: C.foreground }]}>
                {paragraph}
              </Text>
            ))}
          </View>

          <View style={styles.articleFooter}>
            <View style={[styles.footerDivider, { backgroundColor: C.border }]} />
            <Text variant="caption" color={C.muted} style={{ textAlign: 'center' }}>
              {article.source} · {formatDate(article.publishedAt)}
            </Text>
            <Text variant="caption" color={C.muted} style={{ textAlign: 'center' }}>
              Tiempo de lectura: {article.readTime} min
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerContainer: { height: 280, position: 'relative' },
  banner: { width: '100%', height: '100%' },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  backBtn: {
    position: 'absolute',
    left: Spacing[5],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    position: 'absolute',
    right: Spacing[5],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: Spacing[5], gap: Spacing[4], paddingBottom: Spacing[10] },
  metaRow: { gap: Spacing[2] },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  title: { lineHeight: 36 },
  sourceCard: {},
  sourceInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  sourceNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  sourceAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: `${Colors.lime}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
  },
  sourceText: { flex: 1 },
  socialSection: { gap: Spacing[2] },
  socialRow: { flexDirection: 'row', gap: Spacing[2] },
  socialBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[2.5],
    borderRadius: Radius.md,
    gap: 4,
  },
  socialLabel: { color: '#fff', fontSize: 10, fontFamily: Fonts.dmSansMedium },
  summary: {
    lineHeight: 24,
    fontFamily: Fonts.dmSansMedium,
    fontSize: 16,
    borderLeftWidth: 3,
    paddingLeft: Spacing[4],
  },
  body: { gap: Spacing[4] },
  paragraph: { lineHeight: 26 },
  articleFooter: { gap: Spacing[2], paddingTop: Spacing[4] },
  footerDivider: { height: 1 },
})
