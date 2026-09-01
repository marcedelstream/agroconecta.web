import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View, FlatList, TextInput, TouchableOpacity, Image, ScrollView, Linking,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { fetchAllyDirectory } from '@/lib/supabase-repositories'
import { ALLY_CATEGORY_LABELS, type AllyCategory, type Organization } from '@/lib/types'

const R = Colors.redesign

const CATEGORIES: { value: AllyCategory; label: string }[] = (
  Object.entries(ALLY_CATEGORY_LABELS) as [AllyCategory, string][]
).map(([value, label]) => ({ value, label }))

function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

export default function AliadosScreen() {
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
    <View style={[styles.root, { backgroundColor: R.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Directorio de Aliados</Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={17} color={R.header.placeholder} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar Aliado..."
              placeholderTextColor={R.header.placeholder}
              style={styles.searchInput}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={R.header.placeholder} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <TouchableOpacity
              style={[styles.chip, !category && styles.chipActive]}
              onPress={() => setCategory(null)}
              activeOpacity={0.8}
            >
              <Text family="noto-sans" weight="semibold" size={12} color={!category ? '#0A0A13' : '#C9C9D2'}>Todas</Text>
            </TouchableOpacity>
            {CATEGORIES.map((cat) => {
              const active = category === cat.value
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(active ? null : cat.value)}
                  activeOpacity={0.8}
                >
                  <Text family="noto-sans" weight="semibold" size={12} color={active ? '#0A0A13' : '#C9C9D2'}>{cat.label}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.lime} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, item.allyFounder && styles.itemFounder]}
              activeOpacity={0.85}
              onPress={() => router.push(`/publisher/${item.id}` as any)}
            >
              {item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text family="noto-sans" weight="semibold" size={14} color={R.foreground} style={{ flexShrink: 1 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.isVerified && <Ionicons name="checkmark-circle" size={14} color={Colors.lime} />}
                </View>
                <View style={styles.badgeRow}>
                  {item.allyPlan && (
                    <View style={[styles.planBadge, { backgroundColor: R.limeSoftBg }]}>
                      <Text family="noto-sans" weight="bold" size={9.5} color={R.limeSoftText}>Aliado</Text>
                    </View>
                  )}
                </View>
                {item.description ? (
                  <Text family="noto-sans" size={12} color={R.mutedForeground} numberOfLines={1}>{item.description}</Text>
                ) : null}
              </View>
              {item.contactPhone && (
                <TouchableOpacity
                  style={styles.contactBtn}
                  hitSlop={8}
                  onPress={() => Linking.openURL(whatsappUrl(item.contactPhone!)).catch(() => {})}
                >
                  <Ionicons name="logo-whatsapp" size={20} color={R.positive} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={38} color={R.mutedForeground} />
              <Text family="noto-sans" size={13.5} color={R.mutedForeground} style={styles.emptyText}>
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
    backgroundColor: R.header.bg,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: R.header.chip,
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 14,
  },
  searchInput: { flex: 1, fontFamily: 'NotoSans-Regular', fontSize: 13.5, color: '#FFFFFF', padding: 0 },
  chipsRow: { flexDirection: 'row', gap: 8, marginTop: 12, paddingRight: 16 },
  chip: { borderWidth: 1, borderColor: R.header.chipBorder, borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 7 },
  chipActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyText: { marginTop: 12, textAlign: 'center' },
  list: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: R.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemFounder: {
    borderColor: '#F0B429',
    backgroundColor: '#FFFBEF',
  },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: R.limeSoftBg, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 44, height: 44, borderRadius: 12 },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.lime },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  planBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  contactBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
})
