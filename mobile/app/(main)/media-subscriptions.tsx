import { useEffect, useMemo, useState } from 'react'
import {
  View, FlatList, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { mockOrganizations } from '@/lib/mock-data'
import { fetchOrganizations } from '@/lib/supabase-repositories'
import type { Organization } from '@/lib/types'

const FOLLOWABLE_CATEGORIES = ['media', 'asociacion', 'institucion', 'gremio', 'rematadora']

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    media: 'Medio',
    asociacion: 'Asociación',
    institucion: 'Institución',
    gremio: 'Gremio',
    rematadora: 'Rematadora',
  }
  return map[cat] ?? cat
}

export default function MediaSubscriptionsScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()
  const { user, updateUser } = useApp()

  const [orgs, setOrgs] = useState<Organization[]>(
    mockOrganizations.filter((o) => FOLLOWABLE_CATEGORIES.includes(o.category))
  )
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>(user?.organizationSubscriptions ?? [])

  useEffect(() => {
    fetchOrganizations()
      .then((remote) => {
        const followable = remote.filter((o) => FOLLOWABLE_CATEGORIES.includes(o.category))
        if (followable.length > 0) setOrgs(followable)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return orgs
    const q = search.toLowerCase()
    return orgs.filter(
      (o) => o.name.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)
    )
  }, [orgs, search])

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function handleSave() {
    await updateUser({ organizationSubscriptions: selected, mediaPreferences: selected })
    router.back()
  }

  const followedCount = selected.length

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>
            Cuentas seguidas
          </Text>
          <Text variant="caption" style={{ color: C.muted }}>
            {followedCount} seleccionada{followedCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.lime }]}
          onPress={handleSave}
        >
          <Text variant="caption" weight="bold" style={{ color: '#0A0A13' }}>Guardar</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={[styles.searchBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Ionicons name="search-outline" size={17} color={C.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar medio, organización..."
          placeholderTextColor={C.muted}
          style={[styles.searchInput, { color: C.foreground }]}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={C.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing[8] }]}
          renderItem={({ item }) => {
            const active = selected.includes(item.id)
            return (
              <TouchableOpacity
                style={[
                  styles.item,
                  { backgroundColor: C.surface, borderColor: active ? Colors.lime : C.border },
                  active && { borderColor: Colors.lime },
                ]}
                onPress={() => toggle(item.id)}
                activeOpacity={0.8}
              >
                {item.logoUrl ? (
                  <Image source={{ uri: item.logoUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={[
                    styles.avatar,
                    { backgroundColor: active ? `${Colors.lime}22` : `${C.muted}12` },
                  ]}>
                    <Ionicons
                      name="radio-outline"
                      size={20}
                      color={active ? Colors.lime : C.muted}
                    />
                  </View>
                )}
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text variant="body" weight="semibold" style={{ color: C.foreground }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.isVerified && (
                      <Ionicons name="checkmark-circle" size={14} color={Colors.lime} />
                    )}
                  </View>
                  <Text variant="caption" style={{ color: C.muted }} numberOfLines={1}>
                    {categoryLabel(item.category)}
                    {item.description ? ` · ${item.description}` : ''}
                  </Text>
                </View>
                <View style={[
                  styles.check,
                  { backgroundColor: active ? Colors.lime : 'transparent', borderColor: active ? Colors.lime : C.border },
                ]}>
                  {active && <Ionicons name="checkmark" size={14} color="#0A0A13" />}
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text variant="body" style={{ color: C.muted }}>Sin resultados para "{search}"</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
  },
  saveBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.dmSans,
    fontSize: 15,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing[10] },
  list: { padding: Spacing[4], gap: Spacing[2] },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing[3.5],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
  },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
