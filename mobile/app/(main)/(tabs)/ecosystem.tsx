import { useEffect, useState } from 'react'
import { ScrollView, View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { fetchEcosystemSites } from '@/lib/supabase-repositories'
import type { EcosystemSite } from '@/lib/types'

export default function DescubrirScreen() {
  const C = useColors()
  const [sites, setSites] = useState<EcosystemSite[]>([])

  useEffect(() => {
    fetchEcosystemSites().then(setSites).catch(() => setSites([]))
  }, [])

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: C.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Spacing[10] }}
    >
      {/* Título */}
      <View style={[styles.titleSection, { paddingTop: Spacing[6] }]}>
        <Text variant="display" weight="bold" family="poppins" style={{ color: C.foreground, fontSize: 32 }}>
          DESCUBRIR
        </Text>
        <Text variant="body" style={{ color: C.muted }}>
          El ecosistema digital del agro paraguayo
        </Text>
      </View>

      {/* Grid de plataformas */}
      <View style={styles.grid}>
        {sites.map((site) => (
          <TouchableOpacity
            key={site.id}
            style={styles.tile}
            activeOpacity={site.isAvailable ? 0.7 : 0.5}
            disabled={!site.isAvailable}
            onPress={() => router.push(`/(main)/platform/${site.id}` as any)}
          >
            {site.isAvailable && site.logoUrl ? (
              <Image source={{ uri: site.logoUrl }} style={styles.logo} resizeMode="contain" />
            ) : (
              <Ionicons
                name={site.isAvailable ? 'apps-outline' : 'sparkles-outline'}
                size={36}
                color={site.isAvailable ? Colors.lime : C.muted}
              />
            )}
            <Text
              variant="caption"
              weight="semibold"
              style={{ color: site.isAvailable ? C.foreground : C.muted, textAlign: 'center' }}
            >
              {site.isAvailable ? site.name : 'Próximamente nuevas soluciones'}
            </Text>
            {!site.isAvailable && (
              <View style={styles.proximoBadge}>
                <Text style={styles.proximoText}>PRÓXIMO</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tagline */}
      <View style={styles.taglineRow}>
        <Ionicons name="leaf-outline" size={14} color={C.muted} />
        <Text variant="caption" style={{ color: C.muted }}>
          Cada plataforma conecta más al agro paraguayo
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleSection: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
    gap: Spacing[1],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[5],
    rowGap: Spacing[8],
    columnGap: Spacing[4],
  },
  tile: {
    width: '47%',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
  },
  logo: { width: 44, height: 44 },
  proximoBadge: {
    backgroundColor: 'rgba(139,139,154,0.15)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
  },
  proximoText: { fontSize: 9, color: '#8B8B9A', fontWeight: '700', letterSpacing: 0.5 },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    marginTop: Spacing[10],
    paddingHorizontal: Spacing[6],
  },
})
