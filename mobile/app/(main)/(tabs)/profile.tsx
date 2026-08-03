import { useEffect, useState } from 'react'
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { router, Href } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { BookCardSkeleton } from '@/components/ui/Skeleton'
import { BookCard } from '@/components/library/BookCard'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { getDepartmentLabel, getProfessionLabel } from '@/lib/mock-data'
import { fetchLibraryItems, fetchUserLibrary } from '@/lib/supabase-repositories'
import { MediaSheet } from '@/components/profile/MediaSheet'
import { NotificationsSheet } from '@/components/profile/NotificationsSheet'
import { PersonalizationSheet } from '@/components/profile/PersonalizationSheet'
import { EditProfileSheet } from '@/components/profile/EditProfileSheet'
import type { LibraryItem, NewsCategory } from '@/lib/types'

type ActiveSheet = 'personalization' | 'media' | 'notifications' | 'edit-profile' | null
type IconName = React.ComponentProps<typeof Ionicons>['name']

const SETTINGS: { id: ActiveSheet; icon: IconName; label: string; navigate?: string }[] = [
  { id: 'notifications',   icon: 'notifications-outline', label: 'Notificaciones' },
  { id: 'personalization', icon: 'color-palette-outline',  label: 'Personalización' },
  { id: 'media',           icon: 'radio-outline',          label: 'Cuentas seguidas', navigate: '/(main)/media-subscriptions' },
]

export default function ProfileScreen() {
  const { user, signOut, updateUser, deleteAccount } = useApp()
  const C = useColors()
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [savedBooks, setSavedBooks] = useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    Promise.all([fetchLibraryItems(), fetchUserLibrary(user.id)])
      .then(([items, entries]) => {
        const ids = entries.map((e) => e.itemId)
        setSavedBooks(items.filter((i) => ids.includes(i.id)))
      })
      .catch(() => setSavedBooks([]))
      .finally(() => setLibraryLoading(false))
  }, [user?.id])

  async function confirmLogout() {
    setLogoutModalVisible(false)
    await signOut()
    router.replace('/(auth)/login')
  }

  async function confirmDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    const error = await deleteAccount()
    setDeleting(false)
    if (error) {
      setDeleteError(error)
      return
    }
    setDeleteModalVisible(false)
    router.replace('/(auth)/login')
  }

  if (!user) return null

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')

  const followedCount = user.organizationSubscriptions?.length ?? 0
  const interestsCount = user.preferences?.length ?? 0
  const memberYear = new Date(user.createdAt).getFullYear()

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Avatar + identidad ── */}
        <View style={styles.identity}>
            <View style={[styles.avatarCircle, { backgroundColor: `${Colors.lime}18`, borderColor: `${Colors.lime}50` }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text variant="title" weight="bold" family="poppins">{user.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="briefcase-outline" size={13} color={C.muted} />
              <Text variant="caption" style={{ color: C.muted }}>{getProfessionLabel(user.profession)}</Text>
              <Text variant="caption" style={{ color: C.border }}> · </Text>
              <Ionicons name="location-outline" size={13} color={C.muted} />
              <Text variant="caption" style={{ color: C.muted }}>{getDepartmentLabel(user.department)}</Text>
            </View>
            {user.email ? (
              <Text variant="caption" style={{ color: C.muted }}>{user.email}</Text>
            ) : null}
            {/* Editar perfil — debajo de la info */}
            <TouchableOpacity
              onPress={() => setActiveSheet('edit-profile')}
              style={[styles.editBtn, { borderColor: `${Colors.lime}50`, backgroundColor: `${Colors.lime}10` }]}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={14} color={Colors.lime} />
              <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>Editar perfil</Text>
            </TouchableOpacity>
        </View>

        {/* ── Stats ── */}
        <View style={[styles.statsRow, { backgroundColor: C.surface, borderColor: C.border }]}>
          <StatItem label="Intereses" value={interestsCount} C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatItem label="Siguiendo" value={followedCount} C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatItem label="Miembro" value={memberYear} C={C} />
        </View>

        {/* ── Mis colecciones ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="body" weight="semibold" style={{ color: C.foreground }}>Mis colecciones</Text>
            {!libraryLoading && savedBooks.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(main)/library' as any)} hitSlop={8}>
                <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>Ver más libros</Text>
              </TouchableOpacity>
            )}
          </View>
          {libraryLoading ? (
            <View style={styles.chips}>
              {[0, 1, 2].map((i) => <BookCardSkeleton key={i} />)}
            </View>
          ) : savedBooks.length > 0 ? (
            <View style={styles.bleed}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionsRow}>
                {savedBooks.map((item) => (
                  <BookCard key={item.id} item={item} onPress={() => router.push(`/(main)/book/${item.id}` as any)} />
                ))}
              </ScrollView>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.collectionsCta, { borderColor: C.border, backgroundColor: C.surface }]}
              onPress={() => router.push('/(main)/library' as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.collectionsCtaIcon, { backgroundColor: `${Colors.lime}15` }]}>
                <Ionicons name="book-outline" size={20} color={Colors.lime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold" style={{ color: C.foreground }}>Conocé la biblioteca del agro</Text>
                <Text variant="caption" style={{ color: C.muted }}>Guardá libros y documentos para leer después</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Configuración ── */}
        <View style={styles.section}>
          <Text variant="body" weight="semibold" style={[styles.sectionLabel, { color: C.foreground }]}>
            Configuración
          </Text>
          <View style={[styles.settingsList, { backgroundColor: C.surface, borderColor: C.border }]}>
            {SETTINGS.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.settingRow,
                  { borderTopColor: C.border },
                  idx > 0 && styles.settingRowBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => item.navigate ? router.push(item.navigate as Href) : setActiveSheet(item.id)}
              >
                <Ionicons name={item.icon} size={19} color={C.foreground} />
                <Text variant="body" weight="medium" style={{ flex: 1, color: C.foreground }}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={C.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => setLogoutModalVisible(true)}
            style={[styles.logoutBtn, { borderColor: `${Colors.destructive}35`, backgroundColor: `${Colors.destructive}08` }]}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.destructive} />
            <Text variant="body" weight="semibold" style={{ color: Colors.destructive }}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
          <Text variant="caption" style={{ color: C.muted, textAlign: 'center' }}>
            Agroconecta v1.0.0
          </Text>
          <TouchableOpacity onPress={() => setDeleteModalVisible(true)} hitSlop={8}>
            <Text variant="caption" style={{ color: C.muted, textDecorationLine: 'underline' }}>
              Eliminar cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sheets */}
      {activeSheet === 'personalization' && (
        <PersonalizationSheet
          selected={user.preferences}
          onClose={(updated: NewsCategory[]) => { updateUser({ preferences: updated }); setActiveSheet(null) }}
        />
      )}
      {activeSheet === 'media' && (
        <MediaSheet
          selected={user.mediaPreferences}
          onClose={(updated: string[]) => {
            updateUser({ organizationSubscriptions: updated, mediaPreferences: updated })
            setActiveSheet(null)
          }}
        />
      )}
      {activeSheet === 'notifications' && (
        <NotificationsSheet onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'edit-profile' && (
        <EditProfileSheet
          name={user.name}
          department={user.department}
          profession={user.profession}
          onClose={(updated) => { if (updated) updateUser(updated); setActiveSheet(null) }}
        />
      )}

      <ConfirmModal
        visible={logoutModalVisible}
        icon="log-out-outline"
        title="Cerrar sesión"
        message="¿Seguro que querés salir de tu cuenta?"
        confirmLabel="Salir"
        cancelLabel="Cancelar"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setLogoutModalVisible(false)}
      />

      <ConfirmModal
        visible={deleteModalVisible}
        icon="trash-outline"
        title="Eliminar cuenta"
        message={
          deleteError
            ?? 'Esta acción es permanente: se borran tu perfil, preferencias y suscripciones. No se puede deshacer. ¿Querés continuar?'
        }
        confirmLabel={deleting ? 'Eliminando…' : 'Eliminar cuenta'}
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => { if (!deleting) confirmDeleteAccount() }}
        onCancel={() => { setDeleteModalVisible(false); setDeleteError(null) }}
      />
    </View>
  )
}

function StatItem({ label, value, C }: { label: string; value: number | string; C: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.statItem}>
      <Text
        variant="subtitle"
        weight="bold"
        family="poppins"
        style={{ color: Colors.lime }}
      >
        {value}
      </Text>
      <Text variant="caption" style={{ color: C.muted }}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Spacing[12] },

  // Identity
  identity: {
    alignItems: 'center',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing[1],
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  avatarText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 30,
    lineHeight: 36,
    color: Colors.lime,
    includeFontPadding: false,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing[5],
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing[4],
    marginBottom: Spacing[5],
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, marginVertical: Spacing[1] },

  // Sections
  section: {
    marginHorizontal: Spacing[5],
    marginBottom: Spacing[5],
    gap: Spacing[3],
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: { marginBottom: Spacing[1] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  // Rompe el margen horizontal de `section` para que el carrusel llegue al borde de la pantalla
  bleed: { marginHorizontal: -Spacing[5] },
  collectionsRow: { paddingLeft: Spacing[5], paddingRight: Spacing[2], gap: Spacing[3] },
  collectionsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  collectionsCtaIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Settings list
  settingsList: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  settingRowBorder: { borderTopWidth: 1 },

  // Footer
  footer: {
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
})
