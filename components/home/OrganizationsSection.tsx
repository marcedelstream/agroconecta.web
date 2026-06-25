import { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { SectionHeader } from './SectionHeader'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'
import { mockOrganizations } from '@/lib/mock-data'
import { fetchOrganizations } from '@/lib/supabase-repositories'
import type { Organization } from '@/lib/types'

const ACCENT_COLORS: Record<string, string> = {
  media:       Colors.category?.mercados ?? Colors.lime,
  asociacion:  Colors.category?.ganaderia ?? '#E67E22',
  institucion: Colors.category?.institucional ?? '#3498DB',
  gremio:      Colors.category?.agricultura ?? '#27AE60',
  rematadora:  Colors.category?.tecnologia ?? '#9B59B6',
}

interface Props {
  onViewAll?: () => void
}

export function OrganizationsSection({ onViewAll }: Props) {
  const C = useColors()
  const [orgs, setOrgs] = useState<Organization[]>(mockOrganizations.slice(0, 8))

  useEffect(() => {
    let mounted = true
    fetchOrganizations()
      .then((remote) => { if (mounted && remote.length > 0) setOrgs(remote) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <View>
      <SectionHeader
        title="Organizaciones"
        action={onViewAll ? { label: 'Ver todas', onPress: onViewAll } : undefined}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {orgs.map((org) => {
          const accent = ACCENT_COLORS[org.category] ?? Colors.lime
          return (
            <TouchableOpacity
              key={org.id}
              style={styles.tile}
              activeOpacity={0.7}
              onPress={() => router.push(`/publisher/${org.id}` as any)}
            >
              <View style={[styles.avatar, { backgroundColor: `${accent}20` }]}>
                <Text style={[styles.avatarText, { color: accent }]}>
                  {org.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text
                variant="caption"
                numberOfLines={2}
                style={{ color: C.foreground, textAlign: 'center', fontSize: 11, maxWidth: 80 }}
              >
                {org.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
    gap: Spacing[5],
  },
  tile: {
    alignItems: 'center',
    gap: Spacing[2],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700' },
})
