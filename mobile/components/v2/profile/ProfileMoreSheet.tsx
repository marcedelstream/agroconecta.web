import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { MORE_TEXT } from '@/lib/feed-v2/labels'

type IconName = React.ComponentProps<typeof Ionicons>['name']

interface Item {
  label: string
  icon: IconName
  /** Ruta a abrir, o acción propia. */
  href?: string
  onPress?: () => void
  destructive?: boolean
}

interface Props {
  visible: boolean
  isMember: boolean
  onClose: () => void
  onNotifications: () => void
  onLogout: () => void
  onDelete: () => void
}

// Menú secundario del Perfil v2 (README §2): lo que en la v1 estaba en el drawer y en Perfil.
export function ProfileMoreSheet({ visible, isMember, onClose, onNotifications, onLogout, onDelete }: Props) {
  const insets = useSafeAreaInsets()

  const sections: { title: string; items: Item[] }[] = [
    {
      title: MORE_TEXT.account,
      items: [
        { label: MORE_TEXT.editCv, icon: 'create-outline', href: '/(main)/perfil-editar' },
        { label: MORE_TEXT.notifications, icon: 'notifications-outline', onPress: onNotifications },
        { label: MORE_TEXT.following, icon: 'people-outline', href: '/(main)/media-subscriptions' },
        { label: MORE_TEXT.library, icon: 'library-outline', href: '/(main)/library' },
        // Mismo criterio que el botón "+" de la v1: miembros publican, el resto ve cómo sumarse.
        isMember
          ? { label: MORE_TEXT.publish, icon: 'add-circle-outline', href: '/(main)/publish-form' }
          : { label: MORE_TEXT.join, icon: 'add-circle-outline', href: '/(main)/sumate' },
      ],
    },
    {
      title: MORE_TEXT.agroconecta,
      items: [
        { label: MORE_TEXT.allies, icon: 'ribbon-outline', href: '/(main)/aliados' },
        { label: MORE_TEXT.about, icon: 'information-circle-outline', href: '/(main)/nosotros' },
        { label: MORE_TEXT.contact, icon: 'chatbubbles-outline', href: '/(main)/contacto' },
      ],
    },
    {
      title: MORE_TEXT.legal,
      items: [
        { label: MORE_TEXT.terms, icon: 'document-text-outline', href: '/legal/terms' },
        { label: MORE_TEXT.privacy, icon: 'shield-checkmark-outline', href: '/legal/privacy' },
        { label: MORE_TEXT.logout, icon: 'log-out-outline', onPress: onLogout },
        { label: MORE_TEXT.deleteAccount, icon: 'trash-outline', onPress: onDelete, destructive: true },
      ],
    },
  ]

  function press(item: Item) {
    onClose()
    if (item.href) router.push(item.href as never)
    else item.onPress?.()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16, maxHeight: '85%' }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {sections.map((s) => (
            <View key={s.title} style={styles.section}>
              <Text family="noto-sans" weight="bold" size={12} color={Colors.v2.muted} style={styles.sectionTitle}>{s.title}</Text>
              <View style={styles.card}>
                {s.items.map((item, i) => {
                  const color = item.destructive ? Colors.v2.live : Colors.v2.navy
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => press(item)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      style={[styles.row, i < s.items.length - 1 && styles.divider]}
                    >
                      <Ionicons name={item.icon} size={20} color={color} />
                      <Text family="noto-sans" weight="semibold" size={15} color={color} style={styles.label}>{item.label}</Text>
                      {!item.destructive && <Ionicons name="chevron-forward" size={18} color={Colors.v2.muted} />}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.v2.sheet.backdrop },
  sheet: { backgroundColor: Colors.v2.ground, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: Colors.v2.sheet.border, marginBottom: 8 },
  content: { paddingHorizontal: 18, gap: 18, paddingTop: 8 },
  section: { gap: 8 },
  sectionTitle: { letterSpacing: 1 },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, minHeight: 52 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.v2.light.inputBorder },
  label: { flex: 1 },
})
