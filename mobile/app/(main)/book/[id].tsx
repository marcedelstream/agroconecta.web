import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { PdfReader } from '@/components/ui/PdfReader'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { ToastHost } from '@/components/v2/ToastHost'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { useApp } from '@/lib/app-context'
import { requireSession } from '@/lib/feed-v2/guest'
import { BOOK_TEXT as T } from '@/lib/feed-v2/labels'
import { showToast } from '@/lib/feed-v2/toast'
import { goBack } from '@/lib/navigation'
import {
  addToUserLibrary,
  fetchLibraryFileSignedUrl,
  fetchLibraryItemById,
  fetchUserLibrary,
  markLibraryItemOpened,
  removeFromUserLibrary,
} from '@/lib/supabase-repositories'
import { LIBRARY_CATEGORY_LABELS, type LibraryItem } from '@/lib/types'

const V = Colors.v2

// Ficha de un título de la biblioteca (v2): tapa, datos, "Leer" y guardar en Mis colecciones.
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { user } = useApp()

  const [item, setItem] = useState<LibraryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [reading, setReading] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [readerLoading, setReaderLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchLibraryItemById(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user?.id || !id) return
    fetchUserLibrary(user.id)
      .then((entries) => setSaved(entries.some((e) => e.itemId === id)))
      .catch(() => null)
  }, [user?.id, id])

  async function toggleSaved() {
    if (!(await requireSession()) || !user?.id || !id) return
    const on = !saved
    setSaved(on)
    try {
      if (on) await addToUserLibrary(user.id, id)
      else await removeFromUserLibrary(user.id, id)
      showToast(on ? T.saved : T.removed)
    } catch {
      setSaved(!on)
    }
  }

  async function openReader() {
    if (!item) return
    setReaderLoading(true)
    const url = await fetchLibraryFileSignedUrl(item.fileUrl)
    setSignedUrl(url)
    setReaderLoading(false)
    if (url) {
      setReading(true)
      if (user?.id) markLibraryItemOpened(user.id, item.id).catch(() => null)
    } else {
      showToast(T.openError)
    }
  }

  if (reading && signedUrl && item) {
    return (
      <View style={styles.reader}>
        <StatusBar style="light" />
        <View style={[styles.readerBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => setReading(false)} accessibilityRole="button" accessibilityLabel={T.close} style={styles.readerClose}>
            <Ionicons name="close" size={22} color={V.white} />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={14} numberOfLines={1} color={V.white} style={styles.flex}>{item.title}</Text>
        </View>
        <PdfReader source={{ uri: signedUrl, cache: true }} style={styles.pdf} trustAllCerts={false} onError={() => setReading(false)} />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <V2ScreenHeader title="" />
        {loading ? (
          <ActivityIndicator color={V.limeText} style={styles.loading} />
        ) : !item ? (
          <View style={styles.missing}>
            <Ionicons name="book-outline" size={44} color={V.muted} />
            <Text family="noto-sans" size={16} color={V.muted}>{T.notFound}</Text>
            <TouchableOpacity onPress={() => goBack()} accessibilityRole="button">
              <Text family="noto-sans" weight="bold" size={16} color={V.limeText}>{T.back}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.coverWrap}>
              <Image source={item.coverImageUrl} style={styles.cover} contentFit="cover" />
            </View>
            <Text family="noto-sans" weight="bold" size={12} color={V.limeText} style={styles.eyebrow}>
              {LIBRARY_CATEGORY_LABELS[item.category].toUpperCase()}
            </Text>
            <Text family="noto-sans" weight="extrabold" size={26} lineHeight={31} color={V.navy} style={styles.center}>{item.title}</Text>
            {item.author ? <Text family="noto-sans" size={16} color={V.muted} style={styles.center}>{item.author}</Text> : null}
            {item.pageCount ? <Text family="noto-sans" size={14} color={V.muted}>{T.pages(item.pageCount)}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity onPress={openReader} disabled={readerLoading} accessibilityRole="button" style={styles.read}>
                <Ionicons name="book-outline" size={19} color={V.white} />
                <Text family="noto-sans" weight="bold" size={16} color={V.white}>{readerLoading ? T.opening : T.read}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleSaved}
                accessibilityRole="button"
                accessibilityLabel={saved ? T.removeA11y : T.saveA11y}
                style={[styles.save, saved && styles.saveOn]}
              >
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? V.limeText : V.navy} />
              </TouchableOpacity>
            </View>

            {item.description ? (
              <Text family="noto-sans" size={16} lineHeight={24} color={V.sheet.body} style={styles.description}>{item.description}</Text>
            ) : null}
          </View>
        )}
      </ScrollView>
      <ToastHost />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  loading: { marginTop: 60 },
  missing: { alignItems: 'center', gap: 12, marginTop: 60 },
  body: { alignItems: 'center', paddingHorizontal: 22, gap: 8 },
  coverWrap: { borderRadius: 16, backgroundColor: V.surface, shadowColor: V.navy, shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6, marginBottom: 14 },
  cover: { width: 160, height: 224, borderRadius: 16 },
  eyebrow: { letterSpacing: 1.2 },
  actions: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 16 },
  read: { flex: 1, height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: V.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  save: { width: V2Layout.ctaHeight, height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaHeight / 2, borderWidth: 1, borderColor: V.sheet.border, backgroundColor: V.surface, alignItems: 'center', justifyContent: 'center' },
  saveOn: { backgroundColor: V.limeTint, borderColor: V.limeText },
  description: { alignSelf: 'stretch', marginTop: 18 },
  reader: { flex: 1, backgroundColor: V.navy },
  readerBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  readerClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: V.glass.bg, alignItems: 'center', justifyContent: 'center' },
  pdf: { flex: 1, width: '100%' },
})
