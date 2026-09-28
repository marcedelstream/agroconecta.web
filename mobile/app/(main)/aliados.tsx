import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ContactCard } from '@/components/v2/ContactCard'
import { SearchField } from '@/components/v2/SearchField'
import { V2ScreenHeader } from '@/components/v2/V2ScreenHeader'
import { Colors } from '@/constants/colors'
import { ALLIES_TEXT as T } from '@/lib/feed-v2/labels'
import { fetchAllyDirectory } from '@/lib/supabase-repositories'
import { ALLY_CATEGORY_LABELS, type AllyCategory, type Organization } from '@/lib/types'

const V = Colors.v2

const CATEGORIES = (Object.entries(ALLY_CATEGORY_LABELS) as [AllyCategory, string][]).map(([value, label]) => ({ value, label }))

function whatsappUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

// Directorio de Aliados v2. "Fundador" se distingue solo por el color de la tarjeta (sin nombres de plan).
export default function AliadosScreen() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AllyCategory | null>(null)

  const load = useCallback(async () => {
    try {
      setOrgs(await fetchAllyDirectory())
    } catch {
      setOrgs([])
    }
  }, [])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orgs.filter(
      (o) => (!category || o.allyCategory === category) && (!q || o.name.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)),
    )
  }, [orgs, category, search])

  const chips = [{ value: null, label: T.all }, ...CATEGORIES]

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.head}>
            <V2ScreenHeader title={T.title} subtitle={T.subtitle} />
            <View style={styles.pad}>
              <SearchField value={search} onChangeText={setSearch} placeholder={T.search} clearLabel={T.clear} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {chips.map((c) => {
                const on = category === c.value
                return (
                  <TouchableOpacity
                    key={c.label}
                    onPress={() => setCategory(c.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text family="noto-sans" weight="semibold" size={14} color={on ? V.white : V.navy}>{c.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={V.limeText} style={styles.empty} />
          ) : (
            <Text family="noto-sans" size={15} color={V.muted} style={styles.empty}>{orgs.length === 0 ? T.none : T.noResults(search)}</Text>
          )
        }
        ListFooterComponent={<View style={styles.pad}><ContactCard /></View>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/publisher/${item.id}` as never)}
            activeOpacity={0.85}
            accessibilityRole="button"
            style={[styles.card, item.allyFounder && styles.founder]}
          >
            {item.logoUrl ? (
              <Image source={item.logoUrl} style={styles.logo} contentFit="cover" />
            ) : (
              <View style={[styles.logo, styles.logoEmpty]}>
                <Text family="noto-sans" weight="bold" size={15} color={V.limeText}>{item.name.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Text family="noto-sans" weight="bold" size={15} color={V.navy} numberOfLines={1} style={styles.shrink}>{item.name}</Text>
                {item.isVerified && <Ionicons name="checkmark-circle" size={15} color={V.limeText} />}
              </View>
              {item.allyCategory ? (
                <Text family="noto-sans" weight="semibold" size={12} color={V.limeText}>{ALLY_CATEGORY_LABELS[item.allyCategory]}</Text>
              ) : null}
              {item.description ? <Text family="noto-sans" size={13} color={V.muted} numberOfLines={2}>{item.description}</Text> : null}
            </View>
            {item.contactPhone ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(whatsappUrl(item.contactPhone!)).catch(() => null)}
                accessibilityRole="link"
                accessibilityLabel={T.whatsapp(item.name)}
                style={styles.whatsapp}
              >
                <Ionicons name="logo-whatsapp" size={20} color={V.white} />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.ground },
  content: { paddingBottom: 40, gap: 10 },
  head: { gap: 12, marginBottom: 4 },
  pad: { paddingHorizontal: 18, marginTop: 8 },
  chips: { paddingHorizontal: 18, gap: 8 },
  chip: { height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: V.surface, justifyContent: 'center' },
  chipOn: { backgroundColor: V.navy },
  empty: { marginTop: 32, textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: V.surface, marginHorizontal: 18, borderWidth: 1.5, borderColor: 'transparent' },
  founder: { borderColor: V.sponsor },
  logo: { width: 52, height: 52, borderRadius: 16 },
  logoEmpty: { backgroundColor: V.limeTint, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shrink: { flexShrink: 1 },
  whatsapp: { width: 40, height: 40, borderRadius: 20, backgroundColor: V.whatsapp, alignItems: 'center', justifyContent: 'center' },
})
