import { useEffect, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Href } from 'expo-router'
import { goBack } from '@/lib/navigation'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { DeleteAccountModal } from '@/components/ui/DeleteAccountModal'
import { BookCardSkeleton } from '@/components/ui/Skeleton'
import { BookCard } from '@/components/library/BookCard'
import { Colors } from '@/constants/colors'
import { useApp } from '@/lib/app-context'
import { getDepartmentLabel, getProfessionLabel } from '@/lib/mock-data'
import { fetchLibraryItems, fetchUserLibrary } from '@/lib/supabase-repositories'
import { getLocalAvatarUri, pickAndSaveLocalAvatar, removeLocalAvatar } from '@/lib/local-avatar'
import { MediaSheet } from '@/components/profile/MediaSheet'
import { NotificationsSheet } from '@/components/profile/NotificationsSheet'
import { EditProfileSheet } from '@/components/profile/EditProfileSheet'
import type { LibraryItem } from '@/lib/types'

const R = Colors.redesign

type ActiveSheet = 'media' | 'notifications' | 'edit-profile' | null
type IconName = React.ComponentProps<typeof Ionicons>['name']

const SETTINGS: { id: ActiveSheet; icon: IconName; label: string; navigate?: string }[] = [
  { id: 'notifications', icon: 'notifications-outline', label: 'Notificaciones' },
  { id: 'media', icon: 'radio-outline', label: 'Cuentas seguidas', navigate: '/(main)/media-subscriptions' },
]

export default function ProfileScreen() {
  const { user, signOut, updateUser, deleteAccount } = useApp()
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [savedBooks, setSavedBooks] = useState<LibraryItem[]>([])
  const [libraryLoading, setLibraryLoading] = useState(true)
  const [avatarUri, setAvatarUri] = useState<string | null>(null)

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

  useEffect(() => {
    getLocalAvatarUri().then(setAvatarUri)
  }, [])

  async function handlePickAvatar() {
    const uri = await pickAndSaveLocalAvatar()
    if (uri) setAvatarUri(uri)
  }

  async function handleRemoveAvatar() {
    await removeLocalAvatar()
    setAvatarUri(null)
  }

  function handleAvatarPress() {
    if (avatarUri) {
      Alert.alert('Foto de perfil', 'Se guarda solo en este dispositivo.', [
        { text: 'Cambiar foto', onPress: handlePickAvatar },
        { text: 'Quitar foto', style: 'destructive', onPress: handleRemoveAvatar },
        { text: 'Cancelar', style: 'cancel' },
      ])
    } else {
      handlePickAvatar()
    }
  }

  async function confirmLogout() {
    setLogoutModalVisible(false)
    await signOut()
    router.replace('/(auth)/login')
  }

  async function confirmDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const error = await deleteAccount()
      if (error) {
        setDeleteError(error)
        return
      }
      setDeleteModalVisible(false)
      router.replace('/(auth)/login')
    } catch (err) {
      // Nunca debería llegar acá (deleteAccount ya captura sus propios errores), pero si
      // algo inesperado se escapa, no puede dejar el botón trabado en "Eliminando...".
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta.')
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return null

  const initial = user.name.trim().charAt(0).toUpperCase() || '?'
  const followedCount = user.organizationSubscriptions?.length ?? 0
  const interestsCount = user.preferences?.length ?? 0
  const memberYear = new Date(user.createdAt).getFullYear()

  return (
    <View style={[styles.root, { backgroundColor: R.background }]}>
      {/* Cabecera estática — no se scrollea con el resto, evita toda la complejidad (y los
          bugs) de un header oscuro que se mezcla con el contenido claro durante el
          pull-to-refresh en iOS. */}
      <SafeAreaView edges={['top']} style={[styles.headerWrap, { backgroundColor: R.header.bg }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text family="noto-sans" weight="semibold" size={13} color={R.header.mutedText}>Perfil</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.identityCard}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.85} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={13} color="#0A0A13" />
            </View>
          </TouchableOpacity>
          <Text family="noto-sans" weight="bold" size={19} color="#FFFFFF" style={styles.nameText}>{user.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="briefcase-outline" size={12} color={R.header.mutedText} />
            <Text family="noto-sans" size={12} color={R.header.mutedText}>{getProfessionLabel(user.profession)}</Text>
            <Text family="noto-sans" size={12} color={R.header.mutedText}> · </Text>
            <Ionicons name="location-outline" size={12} color={R.header.mutedText} />
            <Text family="noto-sans" size={12} color={R.header.mutedText}>{getDepartmentLabel(user.department)}</Text>
          </View>
          {user.email ? (
            <Text family="noto-sans" size={12} color={R.header.mutedText}>{user.email}</Text>
          ) : null}
          <TouchableOpacity onPress={() => setActiveSheet('edit-profile')} style={styles.editBtn} hitSlop={8}>
            <Ionicons name="create-outline" size={13} color="#C9C9D2" />
            <Text family="noto-sans" weight="semibold" size={11.5} color="#C9C9D2">Editar perfil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroller}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem label="Intereses" value={interestsCount} />
          <View style={styles.statDivider} />
          <StatItem label="Siguiendo" value={followedCount} />
          <View style={styles.statDivider} />
          <StatItem label="Miembro" value={memberYear} />
        </View>

        {/* Mis colecciones */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text family="noto-sans" weight="bold" size={15} color={R.foreground}>Mis colecciones</Text>
            {!libraryLoading && savedBooks.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(main)/library' as any)} hitSlop={8}>
                <Text family="noto-sans" weight="semibold" size={12} color={R.foreground} style={styles.underline}>
                  Ver más libros
                </Text>
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
            <TouchableOpacity style={styles.collectionsCta} onPress={() => router.push('/(main)/library' as any)} activeOpacity={0.8}>
              <View style={styles.collectionsCtaIcon}>
                <Ionicons name="book-outline" size={20} color={Colors.lime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text family="noto-sans" weight="semibold" size={13.5} color={R.foreground}>Conocé la biblioteca del agro</Text>
                <Text family="noto-sans" size={12} color={R.mutedForeground}>Guardá libros y documentos para leer después</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#A8A8B2" />
            </TouchableOpacity>
          )}
        </View>

        {/* Configuración */}
        <View style={styles.section}>
          <Text family="noto-sans" weight="bold" size={15} color={R.foreground} style={styles.sectionLabel}>
            Configuración
          </Text>
          <View style={styles.settingsList}>
            {SETTINGS.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.settingRow, idx > 0 && styles.settingRowBorder]}
                activeOpacity={0.7}
                onPress={() => item.navigate ? router.push(item.navigate as Href) : setActiveSheet(item.id)}
              >
                <Ionicons name={item.icon} size={19} color={R.foreground} />
                <Text family="noto-sans" weight="medium" size={14} color={R.foreground} style={{ flex: 1 }}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#A8A8B2" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setLogoutModalVisible(true)} style={styles.logoutBtn} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={Colors.destructive} />
            <Text family="noto-sans" weight="semibold" size={14} color={Colors.destructive}>Cerrar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDeleteModalVisible(true)} hitSlop={8}>
            <Text family="noto-sans" size={12} color={R.mutedForeground} style={styles.deleteLink}>
              Eliminar cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sheets */}
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

      <DeleteAccountModal
        visible={deleteModalVisible}
        deleting={deleting}
        error={deleteError}
        onConfirm={() => { if (!deleting) confirmDeleteAccount() }}
        onCancel={() => { setDeleteModalVisible(false); setDeleteError(null) }}
      />
    </View>
  )
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statItem}>
      <Text family="noto-sans" weight="extrabold" size={18} color={R.foreground}>{value}</Text>
      <Text family="noto-sans" size={11.5} color={R.mutedForeground}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // El redondeo va acá afuera (no en identityCard) — así el corte se nota contra el fondo
  // claro del scroll de abajo. Puesto adentro, oscuro sobre oscuro, no se veía nada.
  headerWrap: { borderBottomLeftRadius: 22, borderBottomRightRadius: 22, overflow: 'hidden' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scroller: { flex: 1, backgroundColor: R.background },
  scroll: { paddingTop: 20, paddingBottom: 40 },
  identityCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 4,
  },
  avatarWrap: { position: 'relative', marginBottom: 6 },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: R.header.chip,
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, borderColor: R.header.chipBorder },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.lime },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.lime,
    borderWidth: 2,
    borderColor: R.header.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: { marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: R.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, backgroundColor: R.divider, marginVertical: 4 },
  section: { marginHorizontal: 20, marginTop: 24, gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  underline: { textDecorationLine: 'underline' },
  sectionLabel: {},
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bleed: { marginHorizontal: -20 },
  collectionsRow: { paddingLeft: 20, paddingRight: 8, gap: 12 },
  collectionsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: R.surface,
  },
  collectionsCtaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: R.limeSoftBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsList: { backgroundColor: R.surface, borderRadius: 16, paddingHorizontal: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  settingRowBorder: { borderTopWidth: 1, borderTopColor: R.divider },
  footer: { alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 30 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: `${Colors.destructive}35`,
    backgroundColor: `${Colors.destructive}08`,
  },
  deleteLink: { textDecorationLine: 'underline' },
})
