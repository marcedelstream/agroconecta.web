import { useState, useRef } from 'react'
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { mockEcosystemSites } from '@/lib/mock-data'

export default function WebViewScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>()
  const site = mockEcosystemSites.find((s) => s.id === siteId)
  const [loading, setLoading] = useState(true)
  const [canGoBack, setCanGoBack] = useState(false)
  const webViewRef = useRef<WebView>(null)
  const C = useColors()

  if (!site) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top', 'bottom']}>
        <View style={styles.error}>
          <Text variant="body" color={C.muted}>Sitio no encontrado.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text variant="body" color={Colors.lime}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top', 'bottom']}>
      {/* Barra de navegación */}
      <View style={[styles.navbar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity
          onPress={() => (canGoBack ? webViewRef.current?.goBack() : router.back())}
          style={styles.navBtn}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </TouchableOpacity>

        <View style={styles.navTitle}>
          <Text variant="body" weight="semibold" numberOfLines={1}>{site.name}</Text>
          <Text variant="label" color={C.muted} numberOfLines={1}>{site.url.replace(/^https?:\/\//, '')}</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn} hitSlop={8}>
          <Ionicons name="close" size={22} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {loading && (
        <View style={[styles.progressBar, { backgroundColor: C.border }]}>
          <View style={styles.progressFill} />
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: site.url }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
        renderLoading={() => (
          <View style={[styles.loadingOverlay, { backgroundColor: C.background }]}>
            <ActivityIndicator size="large" color={Colors.lime} />
          </View>
        )}
        startInLoadingState
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2.5],
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { flex: 1, alignItems: 'center', gap: 2 },
  progressBar: { height: 2 },
  progressFill: { height: '100%', width: '70%', backgroundColor: Colors.lime },
  webview: { flex: 1 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing[4] },
  backLink: { padding: Spacing[2] },
})
