import { useEffect, useState } from 'react'
import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import Pdf from 'react-native-pdf'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import {
  fetchLibraryItemById,
  fetchLibraryFileSignedUrl,
  fetchUserLibrary,
  addToUserLibrary,
  removeFromUserLibrary,
  markLibraryItemOpened,
} from '@/lib/supabase-repositories'
import { LIBRARY_CATEGORY_LABELS, type LibraryItem } from '@/lib/types'

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const C = useColors()
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
      .catch(() => {})
  }, [user?.id, id])

  async function toggleSaved() {
    if (!user?.id || !id) return
    if (saved) {
      await removeFromUserLibrary(user.id, id)
      setSaved(false)
    } else {
      await addToUserLibrary(user.id, id)
      setSaved(true)
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
      if (user?.id) markLibraryItemOpened(user.id, item.id).catch(() => {})
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator color={Colors.lime} />
      </View>
    )
  }

  if (!item) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Ionicons name="alert-circle-outline" size={40} color={C.muted} />
        <Text variant="body" style={{ color: C.muted, marginTop: Spacing[3] }}>Título no encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing[4] }}>
          <Text variant="body" style={{ color: Colors.lime }}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (reading && signedUrl) {
    return (
      <View style={[styles.root, { backgroundColor: '#000' }]}>
        <View style={[styles.readerBar, { paddingTop: insets.top + Spacing[2] }]}>
          <TouchableOpacity onPress={() => setReading(false)} style={styles.readerClose} hitSlop={12}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text variant="caption" weight="semibold" numberOfLines={1} style={{ color: '#fff', flex: 1 }}>
            {item.title}
          </Text>
        </View>
        <Pdf
          source={{ uri: signedUrl, cache: true }}
          style={styles.pdf}
          trustAllCerts={false}
          onError={() => setReading(false)}
        />
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing[8] }]}>
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing[2] }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={C.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroRow}>
          <Image source={{ uri: item.coverImageUrl }} style={[styles.cover, { backgroundColor: C.secondary }]} resizeMode="cover" />
          <View style={styles.heroInfo}>
            <Text variant="label" style={{ color: Colors.lime, letterSpacing: 0.6 }}>
              {LIBRARY_CATEGORY_LABELS[item.category]}
            </Text>
            <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground, lineHeight: 26 }}>
              {item.title}
            </Text>
            {item.author && <Text variant="body" style={{ color: C.muted }}>{item.author}</Text>}
            {item.pageCount ? (
              <Text variant="caption" style={{ color: C.muted }}>{item.pageCount} páginas</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.readBtn, { backgroundColor: Colors.lime }]}
            onPress={openReader}
            activeOpacity={0.85}
            disabled={readerLoading}
          >
            <Ionicons name="book-outline" size={18} color="#0A0A13" />
            <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>
              {readerLoading ? 'Abriendo...' : 'Leer'}
            </Text>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity
              style={[styles.saveBtn, { borderColor: saved ? Colors.lime : C.border, backgroundColor: saved ? `${Colors.lime}18` : 'transparent' }]}
              onPress={toggleSaved}
              activeOpacity={0.85}
            >
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Colors.lime : C.muted} />
            </TouchableOpacity>
          )}
        </View>

        <Text variant="body" style={{ color: C.muted, lineHeight: 22, marginTop: Spacing[5] }}>
          {item.description}
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing[5] },
  topBar: { marginBottom: Spacing[3] },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: { flexDirection: 'row', gap: Spacing[4] },
  cover: { width: 110, height: 154, borderRadius: Radius.md },
  heroInfo: { flex: 1, gap: Spacing[1], justifyContent: 'center' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], marginTop: Spacing[5] },
  readBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderRadius: Radius.base,
    paddingVertical: Spacing[3.5],
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.base,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[3],
  },
  readerClose: { padding: Spacing[1] },
  pdf: { flex: 1, width: '100%' },
})
