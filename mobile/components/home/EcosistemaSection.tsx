import { useEffect, useState } from 'react'
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { SectionHeader } from './SectionHeader'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { fetchEcosystemSites } from '@/lib/supabase-repositories'
import type { EcosystemSite } from '@/lib/types'

const PREVIEW_COUNT = 3

interface Props {
  onViewAll?: () => void
}

export function EcosistemaSection({ onViewAll }: Props) {
  const C = useColors()
  const [sites, setSites] = useState<EcosystemSite[]>([])

  useEffect(() => {
    fetchEcosystemSites().then(setSites).catch(() => setSites([]))
  }, [])

  if (sites.length === 0) return null

  return (
    <View>
      <SectionHeader
        title="Ecosistema"
        action={onViewAll ? { label: 'Ver todo', onPress: onViewAll } : undefined}
      />
      <View style={styles.row}>
        {sites.slice(0, PREVIEW_COUNT).map((site) => (
          <TouchableOpacity
            key={site.id}
            style={[styles.tile, { backgroundColor: C.surface, borderColor: C.border }]}
            activeOpacity={0.75}
            onPress={() => router.push(`/(main)/platform/${site.id}` as any)}
          >
            <View style={[
              styles.iconWrap,
              { backgroundColor: site.isAvailable ? `${Colors.lime}18` : `${C.muted}10` },
            ]}>
              {site.isAvailable && site.logoUrl ? (
                <Image source={{ uri: site.logoUrl }} style={styles.logo} resizeMode="contain" />
              ) : (
                <Ionicons
                  name={site.isAvailable ? 'apps-outline' : 'sparkles-outline'}
                  size={24}
                  color={site.isAvailable ? Colors.lime : C.muted}
                />
              )}
            </View>
            <Text
              variant="caption"
              weight="semibold"
              style={{ color: site.isAvailable ? C.foreground : C.muted, textAlign: 'center' }}
              numberOfLines={2}
            >
              {site.isAvailable ? site.name : 'Próximamente'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing[3] },
  tile: {
    flex: 1,
    borderRadius: Radius.base,
    borderWidth: 1,
    paddingVertical: Spacing[3.5],
    paddingHorizontal: Spacing[2],
    alignItems: 'center',
    gap: Spacing[2],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 28, height: 28 },
})
