import { useEffect, useMemo, useState } from 'react'
import {
  View, FlatList, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { fetchOrganizations } from '@/lib/supabase-repositories'
import type { Organization } from '@/lib/types'

const R = Colors.redesign
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
  const { user, updateUser } = useApp()

  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>(user?.organizationSubscriptions ?? [])

  useEffect(() => {
    fetchOrganizations()
      .then((remote) => setOrgs(remote.filter((o) => FOLLOWABLE_CATEGORIES.includes(o.category))))
      .catch(() => setOrgs([]))
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
    <View style={[styles.root, { backgroundColor: R.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: R.header.bg }}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Cuentas seguidas</Text>
              <Text family="noto-sans" size={11} color={R.header.placeholder} style={{ marginTop: 1 }}>
                {followedCount} seleccionada{followedCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text family="noto-sans" weight="bold" size={12.5} color="#0A0A13">Guardar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={17} color={R.header.placeholder} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar medio, organización..."
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
          renderItem={({ item }) => {
            const active = selected.includes(item.id)
            return (
              <TouchableOpacity
                style={[styles.item, active && styles.itemActive]}
                onPress={() => toggle(item.id)}
                activeOpacity={0.85}
              >
                {item.logoUrl ? (
                  <Image source={{ uri: item.logoUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.avatar, active && styles.avatarActive]}>
                    <Ionicons name="radio-outline" size={19} color={active ? Colors.lime : R.mutedForeground} />
                  </View>
                )}
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text family="noto-sans" weight="semibold" size={14} color={R.foreground} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.isVerified && <Ionicons name="checkmark-circle" size={13} color={Colors.lime} />}
                  </View>
                  <Text family="noto-sans" size={12} color={R.mutedForeground} numberOfLines={1}>
                    {categoryLabel(item.category)}
                    {item.description ? ` · ${item.description}` : ''}
                  </Text>
                </View>
                <View style={[styles.check, active && styles.checkActive]}>
                  {active && <Ionicons name="checkmark" size={13} color="#0A0A13" />}
                </View>
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text family="noto-sans" size={13.5} color={R.mutedForeground}>Sin resultados para "{search}"</Text>
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
  saveBtn: { backgroundColor: Colors.lime, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 8 },
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  list: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: R.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: R.border,
    padding: 14,
  },
  itemActive: { borderColor: Colors.lime },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: R.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarActive: { backgroundColor: R.limeSoftBg },
  avatarImage: { width: 40, height: 40, borderRadius: 12 },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: R.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
})
