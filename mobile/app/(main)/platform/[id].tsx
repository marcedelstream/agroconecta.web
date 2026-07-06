import { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Linking, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { fetchEcosystemSiteById } from '@/lib/supabase-repositories'
import type { EcosystemSite } from '@/lib/types'

export default function PlatformScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const C = useColors()
  const insets = useSafeAreaInsets()
  const [platform, setPlatform] = useState<EcosystemSite | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchEcosystemSiteById(id)
      .then(setPlatform)
      .catch(() => setPlatform(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator color={Colors.lime} size="large" />
      </View>
    )
  }

  if (!platform) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Text variant="body" style={{ color: C.muted }}>Plataforma no encontrada.</Text>
        <TouchableOpacity onPress={() => router.navigate('/(main)/(tabs)/ecosystem' as any)} style={{ marginTop: Spacing[3] }}>
          <Text variant="body" style={{ color: Colors.lime }}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.navigate('/(main)/(tabs)/ecosystem' as any)} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <Text variant="body" weight="semibold" style={{ color: C.foreground }}>{platform.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing[8] }]}
      >
        {/* Icono + nombre */}
        <View style={styles.heroSection}>
          <View style={[styles.bigIcon, { backgroundColor: platform.isAvailable ? `${Colors.lime}18` : `${C.muted}10` }]}>
            {platform.isAvailable && platform.logoUrl ? (
              <Image source={{ uri: platform.logoUrl }} style={styles.bigLogo} resizeMode="contain" />
            ) : (
              <Ionicons name={platform.isAvailable ? 'apps-outline' : 'sparkles-outline'} size={52} color={platform.isAvailable ? Colors.lime : C.muted} />
            )}
          </View>
          <Text variant="title" weight="bold" family="poppins" style={{ color: C.foreground, textAlign: 'center' }}>
            {platform.isAvailable ? platform.name : 'Próximamente nuevas soluciones'}
          </Text>
          {!platform.isAvailable && (
            <View style={styles.proximoBadge}>
              <Text style={styles.proximoText}>PRÓXIMAMENTE</Text>
            </View>
          )}
        </View>

        {/* Descripción */}
        {platform.isAvailable && platform.description ? (
          <Text variant="body" style={{ color: C.foreground, lineHeight: 24 }}>
            {platform.description}
          </Text>
        ) : null}

        {/* CTA */}
        {platform.isAvailable && platform.url ? (
          <TouchableOpacity
            style={styles.ctaBtn}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(platform.url)}
          >
            <Ionicons name="open-outline" size={20} color="#0A0A13" />
            <Text variant="body" weight="bold" style={{ color: '#0A0A13' }}>
              Abrir {platform.name}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.ctaBtnDisabled, { borderColor: C.border }]}>
            <Ionicons name="time-outline" size={20} color={C.muted} />
            <Text variant="body" weight="semibold" style={{ color: C.muted }}>
              Disponible próximamente
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  content: { padding: Spacing[5], gap: Spacing[5] },
  heroSection: { alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[4] },
  bigIcon: {
    width: 100,
    height: 100,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigLogo: { width: 60, height: 60 },
  proximoBadge: {
    backgroundColor: 'rgba(139,139,154,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  proximoText: { fontSize: 11, color: '#8B8B9A', fontWeight: '700', letterSpacing: 1 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.lime,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
  },
  ctaBtnDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingVertical: Spacing[4],
  },
})
