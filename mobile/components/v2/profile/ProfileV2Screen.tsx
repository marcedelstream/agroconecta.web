import { useCallback, useState } from 'react'
import { ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Text } from '@/components/ui/Text'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { DeleteAccountModal } from '@/components/ui/DeleteAccountModal'
import { NotificationsSheet } from '@/components/profile/NotificationsSheet'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { CvSections } from '@/components/v2/profile/CvSections'
import { ProfileHeader } from '@/components/v2/profile/ProfileHeader'
import { ProfileMoreSheet } from '@/components/v2/profile/ProfileMoreSheet'
import { PointsCard } from '@/components/v2/profile/PointsCard'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { useApp } from '@/lib/app-context'
import { MORE_TEXT, PROFILE_TEXT } from '@/lib/feed-v2/labels'
import { getCategoryLabel, getDepartmentLabel, getProfessionLabel } from '@/lib/mock-data'
import { EMPTY_CV, fetchProfileCV, PUBLIC_PROFILE_BASE, type ProfileCV } from '@/lib/profile-cv'
import { useAccountActions } from '@/lib/use-account-actions'

function Guest() {
  return (
    <View style={[styles.root, styles.guest]}>
      <Text family="noto-sans" weight="extrabold" size={26} color={Colors.v2.navy}>{PROFILE_TEXT.guestTitle}</Text>
      <Text family="noto-sans" size={15} lineHeight={21} color={Colors.v2.muted} style={styles.center}>{PROFILE_TEXT.guestBody}</Text>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.primary} accessibilityRole="button">
        <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.white}>{PROFILE_TEXT.guestCta}</Text>
      </TouchableOpacity>
    </View>
  )
}

// Perfil v2 tipo CV profesional (README §3.6). "Compartir perfil" aparece cuando el usuario activa su
// perfil público (Editar perfil → Perfil público).
export function ProfileV2Screen() {
  const insets = useSafeAreaInsets()
  const bottomSpace = useFloatingTabBarSpace()
  const { user } = useApp()
  const [cv, setCv] = useState<ProfileCV>(EMPTY_CV)
  const [moreOpen, setMoreOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const account = useAccountActions()

  // Se relee al volver de "Editar perfil".
  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchProfileCV(user.id).then(setCv).catch(() => null)
    }, [user?.id]),
  )

  if (!user) return <Guest />

  const edit = () => router.push('/(main)/perfil-editar' as never)
  const headline = [cv.headline, cv.currentOrg].filter(Boolean).join(' — ') || getProfessionLabel(user.profession)
  const subline = [cv.education, getDepartmentLabel(user.department), cv.country].filter(Boolean).join(' · ')
  const cvEmpty = !cv.headline && !cv.bio && cv.experience.length === 0 && cv.specialties.length === 0

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: bottomSpace + 24 }} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          name={user.name}
          headline={headline}
          subline={subline}
          tags={(user.preferences ?? []).map(getCategoryLabel)}
          topInset={insets.top}
          onEdit={edit}
          onMore={() => setMoreOpen(true)}
        />
        <View style={styles.content}>
          {cv.profilePublic && cv.slug ? (
            <TouchableOpacity
              onPress={() => void Share.share({ message: PROFILE_TEXT.shareMessage(user.name, PUBLIC_PROFILE_BASE + cv.slug) })}
              accessibilityRole="button"
              style={styles.share}
            >
              <Ionicons name="paper-plane-outline" size={18} color={Colors.v2.white} />
              <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.white}>{PROFILE_TEXT.share}</Text>
            </TouchableOpacity>
          ) : null}
          <PointsCard />
          {cvEmpty && (
            <View style={styles.complete}>
              <Text family="noto-sans" weight="bold" size={17} color={Colors.v2.white}>{PROFILE_TEXT.completeCv}</Text>
              <Text family="noto-sans" size={14} lineHeight={20} color={Colors.v2.feed.textSoft}>{PROFILE_TEXT.completeCvBody}</Text>
              <TouchableOpacity onPress={edit} style={styles.completeBtn} accessibilityRole="button">
                <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy}>{PROFILE_TEXT.completeCvCta}</Text>
              </TouchableOpacity>
            </View>
          )}
          <CvSections cv={cv} followedCount={user.organizationSubscriptions?.length ?? 0} />
        </View>
      </ScrollView>

      <ProfileMoreSheet
        visible={moreOpen}
        isMember={!!user.isMember}
        onClose={() => setMoreOpen(false)}
        onNotifications={() => setNotificationsOpen(true)}
        onLogout={account.openLogout}
        onDelete={account.openDelete}
      />
      {notificationsOpen && <NotificationsSheet onClose={() => setNotificationsOpen(false)} />}
      <ConfirmModal
        visible={account.logoutVisible}
        icon="log-out-outline"
        title={MORE_TEXT.logoutTitle}
        message={MORE_TEXT.logoutBody}
        confirmLabel={MORE_TEXT.logoutConfirm}
        cancelLabel={MORE_TEXT.cancel}
        destructive
        onConfirm={account.confirmLogout}
        onCancel={account.cancelLogout}
      />
      <DeleteAccountModal
        visible={account.deleteVisible}
        deleting={account.deleting}
        error={account.deleteError}
        onConfirm={account.confirmDelete}
        onCancel={account.cancelDelete}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  guest: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  center: { textAlign: 'center' },
  primary: { height: 50, paddingHorizontal: 28, borderRadius: 25, backgroundColor: Colors.v2.navy, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  content: { paddingHorizontal: 18, paddingTop: 18, gap: 12 },
  share: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 25, backgroundColor: Colors.v2.navy },
  complete: { backgroundColor: Colors.v2.navy, borderRadius: 20, padding: 18, gap: 8 },
  completeBtn: {
    alignSelf: 'flex-start',
    height: V2Layout.minTouch,
    paddingHorizontal: 18,
    borderRadius: V2Layout.minTouch / 2,
    backgroundColor: Colors.v2.lime,
    justifyContent: 'center',
    marginTop: 4,
  },
})
