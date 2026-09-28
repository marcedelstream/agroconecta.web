import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { SearchField } from '@/components/v2/SearchField'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { FOLLOWING_TEXT as T } from '@/lib/feed-v2/labels'
import { fetchOrganizations } from '@/lib/supabase-repositories'
import type { Organization } from '@/lib/types'

const FOLLOWABLE_CATEGORIES = ['media', 'asociacion', 'institucion', 'gremio', 'rematadora']

// Cuentas seguidas v2: seguir / dejar de seguir se guarda al toque (sin botón "Guardar"), igual que el
// botón "Seguir" de la ficha del feed.
export default function MediaSubscriptionsScreen() {
  const { user, updateUser } = useApp()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const following = user?.organizationSubscriptions ?? []

  useEffect(() => {
    fetchOrganizations()
      .then((remote) => setOrgs(remote.filter((o) => FOLLOWABLE_CATEGORIES.includes(o.category))))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false))
  }, [])

  // Las que ya sigue van primero.
  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = q ? orgs.filter((o) => o.name.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)) : orgs
    return [...matches].sort((a, b) => Number(following.includes(b.id)) - Number(following.includes(a.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el orden se fija al buscar, no en cada toque
  }, [orgs, search])

  function toggle(id: string) {
    Haptics.selectionAsync().catch(() => null)
    const next = following.includes(id) ? following.filter((x) => x !== id) : [...following, id]
    void updateUser({ organizationSubscriptions: next, mediaPreferences: next })
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <FlatList
        data={loading ? [] : list}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.head}>
            <V2ScreenHeader title={T.title} subtitle={T.count(following.length)} />
            <View style={styles.search}>
              <SearchField value={search} onChangeText={setSearch} placeholder={T.search} clearLabel={T.clear} />
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={Colors.v2.limeText} style={styles.empty} />
          ) : (
            <Text family="noto-sans" size={15} color={Colors.v2.muted} style={styles.empty}>{T.empty}</Text>
          )
        }
        renderItem={({ item }) => {
          const on = following.includes(item.id)
          return (
            <View style={styles.card}>
              {item.logoUrl ? (
                <Image source={item.logoUrl} style={styles.logo} contentFit="cover" />
              ) : (
                <View style={[styles.logo, styles.logoEmpty]}>
                  <Ionicons name="business-outline" size={20} color={Colors.v2.muted} />
                </View>
              )}
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy} numberOfLines={1} style={styles.shrink}>{item.name}</Text>
                  {item.isVerified && <Ionicons name="checkmark-circle" size={15} color={Colors.v2.limeText} />}
                </View>
                <Text family="noto-sans" size={13} color={Colors.v2.muted} numberOfLines={1}>
                  {T.category[item.category as keyof typeof T.category] ?? item.category}
                  {item.description ? ` · ${item.description}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggle(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.follow, on ? styles.followOn : styles.followOff]}
              >
                <Text family="noto-sans" weight="bold" size={13} color={on ? Colors.v2.navy : Colors.v2.white}>{on ? T.following : T.follow}</Text>
              </TouchableOpacity>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  content: { paddingBottom: 40, gap: 10 },
  head: { marginBottom: 4 },
  search: { paddingHorizontal: 18 },
  empty: { marginTop: 32, textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, backgroundColor: Colors.v2.surface, marginHorizontal: 18 },
  logo: { width: 46, height: 46, borderRadius: 23 },
  logoEmpty: { backgroundColor: Colors.v2.ground, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shrink: { flexShrink: 1 },
  follow: { height: 36, paddingHorizontal: 14, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  followOff: { backgroundColor: Colors.v2.navy },
  followOn: { backgroundColor: Colors.v2.limeTint },
})
