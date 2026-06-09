import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { useColors } from '@/lib/theme-context'
import { mockEcosystemSites } from '@/lib/mock-data'
import type { EcosystemSite } from '@/lib/types'

const categoryIcons: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  eventos: 'calendar-outline',
  juegos: 'game-controller-outline',
  institucional: 'business-outline',
  streaming: 'radio-outline',
}

export default function EcosystemScreen() {
  const C = useColors()
  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <FlatList
        data={mockEcosystemSites}
        keyExtractor={(s) => s.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Header />}
        renderItem={({ item }) => <SiteCard site={item} />}
      />
    </View>
  )
}

function Header() {
  const C = useColors()
  return (
    <View style={styles.headerSection}>
      <Text variant="subtitle" weight="bold" family="poppins">Ecosistema</Text>
      <Text variant="body" color={C.muted}>
        Productos digitales del agro paraguayo
      </Text>
    </View>
  )
}

function SiteCard({ site }: { site: EcosystemSite }) {
  const C = useColors()
  const iconName = categoryIcons[site.category] ?? 'globe-outline'
  const categoryColor = Colors.ecosystem[site.category as keyof typeof Colors.ecosystem] ?? Colors.lime

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/(main)/webview?siteId=${site.id}`)}
    >
      <Card style={styles.siteCard}>
        {/* Live badge */}
        {site.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text variant="label" style={{ color: Colors.ecosystem.streaming, fontSize: 10 }}>EN VIVO</Text>
          </View>
        )}

        <View style={styles.siteHeader}>
          <View style={[styles.siteIcon, { backgroundColor: `${categoryColor}20` }]}>
            <Ionicons name={iconName} size={26} color={categoryColor} />
          </View>
          <View style={styles.siteTitles}>
            <Text variant="body" weight="bold">{site.name}</Text>
            <Badge variant={site.category as any}>{site.category.charAt(0).toUpperCase() + site.category.slice(1)}</Badge>
          </View>
          <Ionicons name="chevron-forward" size={18} color={C.muted} />
        </View>

        <Text variant="body" color={C.muted} style={styles.siteDesc} numberOfLines={3}>
          {site.description}
        </Text>

        <View style={styles.tagsRow}>
          {site.tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing[5], gap: Spacing[4], paddingBottom: Spacing[6] },
  headerSection: { gap: Spacing[1], marginBottom: Spacing[2] },
  siteCard: { gap: Spacing[3] },
  siteHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  siteIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  siteTitles: { flex: 1, gap: Spacing[1] },
  siteDesc: { lineHeight: 21 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[1.5] },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1], alignSelf: 'flex-start', backgroundColor: `${Colors.ecosystem.streaming}15`, paddingHorizontal: Spacing[2], paddingVertical: Spacing[0.5], borderRadius: Radius.sm },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.ecosystem.streaming },
})
