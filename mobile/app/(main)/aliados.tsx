import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View, FlatList, TextInput, TouchableOpacity, Image, ScrollView, Linking,
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
import { fetchAllyDirectory } from '@/lib/supabase-repositories'
import { ALLY_CATEGORY_LABELS, ALLY_PLAN_LABELS, type AllyCategory, type Organization } from '@/lib/types'

const CATEGORIES: { value: AllyCategory; label: string }[] = (
  Object.entries(ALLY_CATEGORY_LABELS) as [AllyCategory, string][]
).map(([value, label]) => ({ value, label }))

function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

export default function AliadosScreen() {
  const C = useColors()
  const insets = useSafeAreaInsets()

  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AllyCategory | null>(null)

  const loadOrgs = useCallback(async () => {
    try {
      const data = await fetchAllyDirectory()
      setOrgs(data)
    } catch {
      setOrgs([])
    }
  }, [])

  useEffect(() => {
    loadOrgs().finally(() => setLoading(false))
  }, [loadOrgs])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadOrgs()
    setRefreshing(false)
  }, [loadOrgs])

  const filtered = useMemo(() => {
    let list = orgs
    if (category) list = list.filter((o) => o.allyCategory === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((o) => o.name.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q))
    }
    return list
  }, [orgs, category, search])

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3], borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={C.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="body" weight="semibold" family="poppins" style={{ color: C.foreground }}>
            Directorio de Aliados
          </Text>
          <Text variant="caption" style={{ color: C.muted }}>
            Organizaciones que sostienen Agroconecta
          </Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={[styles.searchBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Ionicons name="search-outline" size={17} color={C.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar Aliado..."
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

      {/* Filtros por categoría */}
      <View style={[styles.filtersWrap, { borderBottomColor: C.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.chip, { borderColor: C.border, backgroundColor: !category ? Colors.lime : C.surface }]}
            onPress={() => setCategory(null)}
          >
            <Text variant="caption" weight="semibold" style={{ color: !category ? '#0A0A13' : C.muted }}>Todas</Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => {
            const active = category === cat.value
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.chip, { borderColor: active ? Colors.lime : C.border, backgroundColor: active ? Colors.lime : C.surface }]}
                onPress={() => setCategory(active ? null : cat.value)}
              >
                <Text variant="caption" weight="semibold" style={{ color: active ? '#0A0A13' : C.muted }}>{cat.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
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
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, { backgroundColor: C.surface, borderColor: C.border }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/publisher/${item.id}` as any)}
            >
              {item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: `${Colors.lime}18` }]}>
                  <Text style={[styles.avatarText, { color: Colors.lime }]}>{item.name.slice(0, 2).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text variant="body" weight="semibold" style={{ color: C.foreground, flexShrink: 1 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.isVerified && <Ionicons name="checkmark-circle" size={14} color={Colors.lime} />}
                </View>
                <View style={styles.badgeRow}>
                  {item.allyPlan && (
                    <View style={[
                      styles.planBadge,
                      item.allyPlan === 'cosecha'
                        ? { backgroundColor: Colors.lime }
                        : { backgroundColor: `${Colors.lime}18` },
                    ]}>
                      <Text variant="label" style={{ color: item.allyPlan === 'cosecha' ? '#0A0A13' : Colors.lime, fontSize: 10 }}>
                        {ALLY_PLAN_LABELS[item.allyPlan]}
                      </Text>
                    </View>
                  )}
                  {item.allyFounder && (
                    <View style={[styles.planBadge, { backgroundColor: `${Colors.warning}20` }]}>
                      <Text variant="label" style={{ color: Colors.warning, fontSize: 10 }}>Fundador</Text>
                    </View>
                  )}
                </View>
                {item.description ? (
                  <Text variant="caption" style={{ color: C.muted }} numberOfLines={1}>{item.description}</Text>
                ) : null}
              </View>
              {item.contactPhone && (
                <TouchableOpacity
                  style={styles.contactBtn}
                  hitSlop={8}
                  onPress={() => Linking.openURL(whatsappUrl(item.contactPhone!)).catch(() => {})}
                >
                  <Ionicons name="logo-whatsapp" size={20} color={Colors.success} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={40} color={C.muted} />
              <Text variant="body" style={{ color: C.muted, marginTop: Spacing[3], textAlign: 'center' }}>
                {orgs.length === 0 ? 'Todavía no hay Aliados.' : `Sin resultados para "${search}"`}
              </Text>
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
  filtersWrap: { borderBottomWidth: 1 },
  filtersRow: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing[10] },
  list: { padding: Spacing[4], gap: Spacing[2] },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing[3.5],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
  },
  avatarText: { fontSize: 15, fontWeight: '700' },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },
  badgeRow: { flexDirection: 'row', gap: Spacing[1.5] },
  planBadge: {
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
