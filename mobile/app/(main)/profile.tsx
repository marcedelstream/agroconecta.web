import { useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import { router, Href } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { getDepartmentLabel, getProfessionLabel } from '@/lib/mock-data'
import { PreferencesSheet } from '@/components/profile/PreferencesSheet'
import { MediaSheet } from '@/components/profile/MediaSheet'
import { NotificationsSheet } from '@/components/profile/NotificationsSheet'
import { AppearanceSheet } from '@/components/profile/AppearanceSheet'
import { EditProfileSheet } from '@/components/profile/EditProfileSheet'
import type { NewsCategory } from '@/lib/types'

type ActiveSheet = 'preferences' | 'media' | 'notifications' | 'appearance' | 'edit-profile' | null
type IconName = React.ComponentProps<typeof Ionicons>['name']

const SETTINGS: { id: ActiveSheet; icon: IconName; label: string; navigate?: string }[] = [
  { id: 'notifications', icon: 'notifications-outline', label: 'Notificaciones' },
  { id: 'appearance',   icon: 'color-palette-outline', label: 'Apariencia' },
  { id: 'preferences',  icon: 'heart-outline',         label: 'Mis intereses' },
  { id: 'media',        icon: 'radio-outline',         label: 'Cuentas seguidas', navigate: '/(main)/media-subscriptions' },
]

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useApp()
  const C = useColors()
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)

  async function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que querés salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
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

        {/* ── Avatar + identidad (sin barra de título) ── */}
        <SafeAreaView edges={['top']}>
          <View style={styles.identity}>
            {/* Flecha atrás pequeña, arriba a la izquierda */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              style={styles.backFloating}
            >
              <Ionicons name="arrow-back" size={22} color={C.foreground} />
            </TouchableOpacity>

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
        </SafeAreaView>

        {/* ── Stats ── */}
        <View style={[styles.statsRow, { backgroundColor: C.surface, borderColor: C.border }]}>
          <StatItem label="Intereses" value={interestsCount} C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatItem label="Siguiendo" value={followedCount} C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatItem label="Miembro" value={memberYear} C={C} />
        </View>

        {/* ── Mis intereses ── */}
        {interestsCount > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text variant="body" weight="semibold" style={{ color: C.foreground }}>Mis intereses</Text>
              <TouchableOpacity onPress={() => setActiveSheet('preferences')} hitSlop={8}>
                <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chips}>
              {user.preferences.map((pref) => (
                <Badge key={pref} variant={pref}>{categoryLabel(pref)}</Badge>
              ))}
            </View>
          </View>
        )}

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
            onPress={handleLogout}
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
        </View>
      </ScrollView>

      {/* Sheets */}
      {activeSheet === 'preferences' && (
        <PreferencesSheet
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
      {activeSheet === 'appearance' && (
        <AppearanceSheet onClose={() => setActiveSheet(null)} />
      )}
      {activeSheet === 'edit-profile' && (
        <EditProfileSheet
          name={user.name}
          department={user.department}
          onClose={(updated) => { if (updated) updateUser(updated); setActiveSheet(null) }}
        />
      )}
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

  // Identity (sin topBar)
  identity: {
    alignItems: 'center',
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
    paddingHorizontal: Spacing[5],
    gap: Spacing[2],
  },
  backFloating: {
    position: 'absolute',
    top: Spacing[4],
    left: Spacing[5],
    zIndex: 1,
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
