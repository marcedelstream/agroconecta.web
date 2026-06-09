import { useEffect, useState } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SettingsSheet } from './SettingsSheet'
import { Text } from '@/components/ui/Text'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { mockOrganizations } from '@/lib/mock-data'
import { fetchOrganizations } from '@/lib/supabase-repositories'
import type { Organization } from '@/lib/types'

const followableOrganizations = mockOrganizations.filter((org) =>
  ['media', 'asociacion', 'institucion', 'gremio', 'rematadora'].includes(org.category),
)

interface Props {
  selected: string[]
  onClose: (updated: string[]) => void
}

export function MediaSheet({ selected, onClose }: Props) {
  const C = useColors()
  const [local, setLocal] = useState<string[]>(selected)
  const [organizations, setOrganizations] = useState<Organization[]>(followableOrganizations)

  useEffect(() => {
    let mounted = true
    fetchOrganizations()
      .then((remoteOrganizations) => {
        const followable = remoteOrganizations.filter((org) =>
          ['media', 'asociacion', 'institucion', 'gremio', 'rematadora'].includes(org.category),
        )
        if (mounted && followable.length > 0) setOrganizations(followable)
      })
      .catch(() => {
        if (mounted) setOrganizations(followableOrganizations)
      })
    return () => {
      mounted = false
    }
  }, [])

  function toggle(id: string) {
    setLocal((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  return (
    <SettingsSheet title="Cuentas seguidas" onClose={() => onClose(local)} heightRatio={0.72}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="body" style={{ color: C.muted, marginBottom: Spacing[3] }}>
          Seleccioná los medios que querés ver en tu inicio.
        </Text>
        {organizations.map((pub) => {
          const isActive = local.includes(pub.id)
          return (
            <TouchableOpacity
              key={pub.id}
              onPress={() => toggle(pub.id)}
              style={[styles.item, { backgroundColor: C.surface, borderColor: C.border }, isActive && styles.itemActive]}
              activeOpacity={0.8}
            >
              <View style={[styles.icon, { backgroundColor: isActive ? 'rgba(0,0,0,0.12)' : `${Colors.lime}18` }]}>
                <Ionicons name="radio-outline" size={20} color={isActive ? '#0A0A13' : Colors.lime} />
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text variant="body" weight="semibold" style={{ color: isActive ? '#0A0A13' : C.foreground }}>
                    {pub.name}
                  </Text>
                  {pub.isVerified && (
                    <Ionicons name="checkmark-circle" size={14} color={isActive ? '#0A0A13' : Colors.lime} />
                  )}
                </View>
                <Text variant="caption" style={{ color: isActive ? 'rgba(10,10,19,0.6)' : C.muted }} numberOfLines={1}>
                  {pub.description}
                </Text>
              </View>
              {isActive && <Ionicons name="checkmark" size={18} color="#0A0A13" />}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </SettingsSheet>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing[5], gap: Spacing[2], paddingBottom: Spacing[10] },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], borderRadius: Radius.base, borderWidth: 1, padding: Spacing[3.5] },
  itemActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  icon: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
})
