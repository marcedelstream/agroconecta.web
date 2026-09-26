import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { PROFILE_TEXT } from '@/lib/feed-v2/labels'
import { pickAndSaveLocalAvatar, removeLocalAvatar } from '@/lib/local-avatar'
import { useLocalAvatar } from '@/lib/local-avatar-context'

export const COVER_HEIGHT = 170
const AVATAR = 96
const RING = 150

interface Props {
  name: string
  headline: string
  subline: string
  tags: string[]
  topInset: number
  onEdit: () => void
  onMore: () => void
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'
}

// Portada oscura con el arco verde del isologo, avatar, nombre, cargo, formación e intereses.
export function ProfileHeader({ name, headline, subline, tags, topInset, onEdit, onMore }: Props) {
  const { avatarUri, setAvatarUri } = useLocalAvatar()

  async function pick() {
    const uri = await pickAndSaveLocalAvatar()
    if (uri) setAvatarUri(uri)
  }

  function onAvatar() {
    if (!avatarUri) return void pick()
    Alert.alert(PROFILE_TEXT.avatarTitle, PROFILE_TEXT.avatarBody, [
      { text: PROFILE_TEXT.avatarChange, onPress: pick },
      { text: PROFILE_TEXT.avatarRemove, style: 'destructive', onPress: async () => { await removeLocalAvatar(); setAvatarUri(null) } },
      { text: PROFILE_TEXT.cancel, style: 'cancel' },
    ])
  }

  return (
    <View>
      <View style={[styles.cover, { height: COVER_HEIGHT + topInset }]}>
        <View style={styles.ring} />
        <View style={[styles.coverActions, { top: topInset + 8 }]}>
          <TouchableOpacity onPress={onMore} accessibilityRole="button" accessibilityLabel={PROFILE_TEXT.more} style={styles.coverBtn}>
            <Ionicons name="menu" size={22} color={Colors.v2.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={onAvatar} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={PROFILE_TEXT.avatarTitle} style={styles.avatar}>
            {avatarUri ? (
              <Image source={avatarUri} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <Text family="noto-sans" weight="extrabold" size={34} color={Colors.v2.navy}>{initials(name)}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel={PROFILE_TEXT.edit} style={styles.editBtn}>
            <Ionicons name="pencil" size={18} color={Colors.v2.navy} />
          </TouchableOpacity>
        </View>
        <Text family="noto-sans" weight="extrabold" size={28} lineHeight={32} color={Colors.v2.navy} style={styles.name}>{name}</Text>
        {headline ? <Text family="noto-sans" weight="semibold" size={16} color={Colors.v2.navy}>{headline}</Text> : null}
        <Text family="noto-sans" size={15} color={Colors.v2.muted}>{subline}</Text>
        {tags.length > 0 && (
          <View style={styles.tags}>
            {tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text family="noto-sans" weight="semibold" size={13} color={Colors.v2.limeTintText}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cover: { backgroundColor: Colors.v2.navy, overflow: 'hidden' },
  ring: { position: 'absolute', right: 36, bottom: -32, width: RING, height: RING, borderRadius: RING / 2, borderWidth: 20, borderColor: Colors.v2.lime },
  coverActions: { position: 'absolute', left: 18 },
  coverBtn: { width: V2Layout.minTouch, height: V2Layout.minTouch, borderRadius: V2Layout.minTouch / 2, backgroundColor: Colors.v2.glass.bg, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 18, marginTop: -AVATAR / 2, gap: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: Colors.v2.lime,
    borderWidth: 4,
    borderColor: Colors.v2.ground,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  editBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.v2.sheet.border,
    backgroundColor: Colors.v2.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { letterSpacing: -0.6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: Colors.v2.limeTint, justifyContent: 'center' },
})
