import { useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { useColors, useTheme } from '@/lib/theme-context'
import { useApp } from '@/lib/app-context'
import { getDepartmentLabel, getProfessionLabel, newsCategories } from '@/lib/mock-data'
import { PreferencesSheet } from '@/components/profile/PreferencesSheet'
import { MediaSheet } from '@/components/profile/MediaSheet'
import { NotificationsSheet } from '@/components/profile/NotificationsSheet'
import { AppearanceSheet } from '@/components/profile/AppearanceSheet'
import { EditProfileSheet } from '@/components/profile/EditProfileSheet'
import type { NewsCategory } from '@/lib/types'

type ActiveSheet = 'preferences' | 'media' | 'notifications' | 'appearance' | 'edit-profile' | null
type IconName = React.ComponentProps<typeof Ionicons>['name']

const SETTINGS: { id: ActiveSheet; icon: IconName; label: string; subtitle: string }[] = [
  { id: 'notifications', icon: 'notifications-outline', label: 'Notificaciones', subtitle: 'Alertas y avisos de la app' },
  { id: 'appearance',   icon: 'color-palette-outline', label: 'Apariencia',      subtitle: 'Tema claro u oscuro' },
  { id: 'preferences',  icon: 'heart-outline',         label: 'Mis intereses',   subtitle: 'Categorías de noticias' },
  { id: 'media',        icon: 'radio-outline',         label: 'Cuentas seguidas', subtitle: 'Medios y organizaciones' },
]

function categoryLabel(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

export default function ProfileScreen() {
  const { user, resetOnboarding, updateUser } = useApp()
  const C = useColors()
  const { isDark } = useTheme()
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
            await resetOnboarding()
            router.replace('/(onboarding)')
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
      <ScrollView showsVerticalScrollIndicator={false} bounces contentContainerStyle={styles.scroll}>

        {/* ── Cover + avatar ── */}
        <View style={styles.coverSection}>
          <LinearGradient
            colors={isDark ? ['#1A2B0A', '#0A0A13'] : ['#D6EF9A', '#FAFAFA']}
            style={styles.cover}
          />
          {/* Back */}
          <SafeAreaView edges={['top']} style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color={C.foreground} />
            </TouchableOpacity>
            <Text variant="body" weight="semibold" family="poppins">Perfil</Text>
            <TouchableOpacity
              onPress={() => setActiveSheet('edit-profile')}
              style={[styles.editTopBtn, { backgroundColor: `${Colors.lime}20`, borderColor: `${Colors.lime}40` }]}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={16} color={Colors.lime} />
              <Text variant="caption" weight="semibold" style={{ color: Colors.lime }}>Editar</Text>
            </TouchableOpacity>
          </SafeAreaView>

          {/* Avatar — anillo separado del contenido para que la inicial no quede cortada */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <View style={[styles.avatarInner, { backgroundColor: isDark ? '#1A2B0A' : '#D6EF9A' }]}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Identidad ── */}
        <View style={styles.identitySection}>
          <Text variant="title" weight="bold" family="poppins" style={{ textAlign: 'center' }}>
            {user.name}
          </Text>
          <View style={styles.profRow}>
            <Ionicons name="briefcase-outline" size={14} color={Colors.lime} />
            <Text variant="body" color={C.muted}>{getProfessionLabel(user.profession)}</Text>
          </View>
          <View style={styles.profRow}>
            <Ionicons name="location-outline" size={14} color={C.muted} />
            <Text variant="body" color={C.muted}>{getDepartmentLabel(user.department)}</Text>
          </View>
          {user.email ? (
            <View style={styles.profRow}>
              <Ionicons name="mail-outline" size={14} color={C.muted} />
              <Text variant="body" color={C.muted}>{user.email}</Text>
            </View>
          ) : null}
          {user.phone ? (
            <View style={styles.profRow}>
              <Ionicons name="call-outline" size={14} color={C.muted} />
              <Text variant="body" color={C.muted}>{user.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Stats ── */}
        <View style={[styles.statsRow, { backgroundColor: C.surface, borderColor: C.border }]}>
          <StatItem label="Intereses" value={interestsCount} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatItem label="Siguiendo" value={followedCount} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatItem label="Miembro desde" value={memberYear} />
        </View>

        {/* ── Mis intereses ── */}
        {interestsCount > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={16} color={Colors.lime} />
              <Text variant="body" weight="semibold">Mis intereses</Text>
              <TouchableOpacity onPress={() => setActiveSheet('preferences')} style={styles.sectionAction} hitSlop={8}>
                <Text variant="caption" style={{ color: Colors.lime }}>Editar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chips}>
              {user.preferences.map((pref) => (
                <Badge key={pref} variant={pref}>
                  {categoryLabel(pref)}
                </Badge>
              ))}
            </View>
          </View>
        )}

        {/* ── Cuentas que sigo ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="radio" size={16} color={Colors.lime} />
            <Text variant="body" weight="semibold">Cuentas seguidas</Text>
            <TouchableOpacity onPress={() => setActiveSheet('media')} style={styles.sectionAction} hitSlop={8}>
              <Text variant="caption" style={{ color: Colors.lime }}>Editar</Text>
            </TouchableOpacity>
          </View>
          {followedCount === 0 ? (
            <Text variant="body" color={C.muted} style={styles.emptyHint}>
              No seguís ninguna cuenta todavía.
            </Text>
          ) : (
            <Text variant="body" color={C.muted}>
              {followedCount} cuenta{followedCount > 1 ? 's' : ''} seguida{followedCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* ── Configuración ── */}
        <View style={styles.section}>
          <Text variant="body" weight="semibold" style={styles.sectionTitleStandalone}>Configuración</Text>
          <Card padding={0}>
            {SETTINGS.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.settingRow,
                  idx < SETTINGS.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border },
                ]}
                activeOpacity={0.7}
                onPress={() => setActiveSheet(item.id)}
              >
                <View style={[styles.settingIconBox, { backgroundColor: `${Colors.lime}15` }]}>
                  <Ionicons name={item.icon} size={18} color={Colors.lime} />
                </View>
                <View style={styles.settingText}>
                  <Text variant="body" weight="medium">{item.label}</Text>
                  <Text variant="caption" color={C.muted}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.muted} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: `${Colors.destructive}40` }]}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.destructive} />
            <Text variant="body" weight="semibold" style={{ color: Colors.destructive }}>Cerrar sesión</Text>
          </TouchableOpacity>
          <Text variant="caption" color={C.muted} style={{ textAlign: 'center' }}>
            Agroconecta v1.0.0 · Ecosistema Digital Agropecuario
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
          onClose={(updated: string[]) => { updateUser({ organizationSubscriptions: updated, mediaPreferences: updated }); setActiveSheet(null) }}
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

function StatItem({ label, value }: { label: string; value: number | string }) {
  const C = useColors()
  return (
    <View style={styles.statItem}>
      <Text variant="subtitle" weight="bold" family="poppins" style={{ color: Colors.lime }}>
        {value}
      </Text>
      <Text variant="caption" color={C.muted}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Spacing[10] },

  // Cover
  coverSection: { height: 156, position: 'relative', marginBottom: 44 },
  cover: { ...StyleSheet.absoluteFillObject },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    gap: Spacing[2],
  },
  backBtn: { padding: Spacing[1] },
  editTopBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -44,
    alignSelf: 'center',
  },
  // Anillo exterior — solo el borde lime
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Círculo interior — fondo + texto, separado del borde para no cortar la inicial
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    lineHeight: 34,
    color: Colors.lime,
    includeFontPadding: false,
  },

  // Identity
  identitySection: {
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    gap: Spacing[1],
    marginBottom: Spacing[3],
  },
  profRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing[4],
    borderRadius: Radius.base,
    borderWidth: 1,
    padding: Spacing[3],
    marginBottom: Spacing[4],
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, marginVertical: Spacing[1] },

  // Sections
  section: {
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    gap: Spacing[2],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  sectionAction: { marginLeft: 'auto' },
  sectionTitleStandalone: { marginBottom: Spacing[1] },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  emptyHint: { fontStyle: 'italic' },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1, gap: 1 },

  // Footer
  footer: {
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[6],
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2.5],
    paddingHorizontal: Spacing[6],
    borderRadius: Radius.base,
    borderWidth: 1,
  },
})
