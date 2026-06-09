import { useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/card'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
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
const settingsItems: { id: ActiveSheet; icon: IconName; label: string }[] = [
  { id: 'notifications', icon: 'notifications-outline',  label: 'Notificaciones' },
  { id: 'appearance',    icon: 'color-palette-outline',  label: 'Apariencia' },
  { id: 'preferences',  icon: 'options-outline',         label: 'Mis intereses' },
  { id: 'media',         icon: 'radio-outline',          label: 'Cuentas seguidas' },
  { id: null,            icon: 'shield-outline',         label: 'Privacidad' },
  { id: null,            icon: 'help-circle-outline',    label: 'Ayuda y Soporte' },
]

export default function ProfileScreen() {
  const { user, resetOnboarding, updateUser } = useApp()
  const C = useColors()
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)

  async function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que querés salir y reiniciar tu perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: async () => { await resetOnboarding(); router.replace('/(onboarding)') } },
      ]
    )
  }

  if (!user) return null

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text variant="subtitle" weight="bold" family="poppins" style={styles.pageTitle}>Perfil</Text>

        {/* User card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text variant="title" weight="bold" family="poppins" color={Colors.lime}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text variant="subtitle" weight="semibold">{user.name}</Text>
              <Text variant="body" style={{ color: C.muted }}>{getProfessionLabel(user.profession)}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={C.muted} />
                <Text variant="caption" style={{ color: C.muted }}>{getDepartmentLabel(user.department)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => setActiveSheet('edit-profile')}>
              <Ionicons name="create-outline" size={20} color={Colors.lime} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Settings */}
        <View style={styles.section}>
          <Text variant="body" weight="semibold" style={styles.sectionTitle}>Configuración</Text>
          <Card padding={0}>
            {settingsItems.map((item, idx) => {
              const isDisabled = item.id === null
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.settingRow, idx < settingsItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  onPress={() => !isDisabled && setActiveSheet(item.id)}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIconBox, { backgroundColor: isDisabled ? `${C.muted}15` : `${Colors.lime}15` }]}>
                      <Ionicons name={item.icon} size={18} color={isDisabled ? C.muted : Colors.lime} />
                    </View>
                    <Text variant="body" weight="medium" style={{ color: isDisabled ? C.muted : C.foreground }}>
                      {item.label}
                    </Text>
                  </View>
                  {!isDisabled && <Ionicons name="chevron-forward" size={18} color={C.muted} />}
                </TouchableOpacity>
              )
            })}
          </Card>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.logoRow}>
            <Text variant="caption" weight="semibold" color={Colors.lime} family="poppins">Agroconecta</Text>
            <Text variant="caption" style={{ color: C.muted }}> v1.0.0</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { borderColor: `${Colors.destructive}40` }]}>
            <Ionicons name="log-out-outline" size={18} color={Colors.destructive} />
            <Text variant="body" style={{ color: Colors.destructive }}>Cerrar sesión</Text>
          </TouchableOpacity>
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
          onClose={(updated) => {
            if (updated) updateUser(updated)
            setActiveSheet(null)
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing[5], gap: Spacing[5], paddingBottom: Spacing[8] },
  pageTitle: { paddingVertical: Spacing[1] },
  userCard: { padding: Spacing[4] },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.lime}20`, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.lime },
  userInfo: { flex: 1, gap: Spacing[1] },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1], marginTop: Spacing[0.5] },
  editBtn: { padding: Spacing[1] },
  section: { gap: Spacing[3] },
  sectionTitle: {},
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3.5] },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  settingIconBox: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  footer: { alignItems: 'center', gap: Spacing[4], paddingTop: Spacing[4] },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingVertical: Spacing[2], paddingHorizontal: Spacing[4], borderRadius: Radius.base, borderWidth: 1 },
})
