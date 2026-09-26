import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { PROFILE_TEXT } from '@/lib/feed-v2/labels'
import { SOCIAL_KEYS, socialUrl, type ProfileCV, type SocialKey } from '@/lib/profile-cv'

type IconName = React.ComponentProps<typeof Ionicons>['name']

const SOCIAL_ICON: Record<SocialKey, IconName> = {
  linkedin: 'logo-linkedin',
  instagram: 'logo-instagram',
  facebook: 'logo-facebook',
  x: 'logo-twitter',
  youtube: 'logo-youtube',
  website: 'globe-outline',
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text family="noto-sans" weight="bold" size={17} color={Colors.v2.navy}>{title}</Text>
        {action}
      </View>
      {children}
    </View>
  )
}

const Body = ({ children }: { children: React.ReactNode }) => (
  <Text family="noto-sans" size={15} lineHeight={22} color={Colors.v2.sheet.body}>{children}</Text>
)

interface Props {
  cv: ProfileCV
  followedCount: number
}

// Secciones del perfil CV (README §3.6). Las vacías no se muestran (la tarjeta "Completá tu perfil"
// invita a cargarlas); Organizaciones siempre aparece porque viene de lo que el usuario sigue.
export function CvSections({ cv, followedCount }: Props) {
  const socials = SOCIAL_KEYS.filter((k) => cv.socials[k])
  return (
    <View style={styles.wrap}>
      {cv.bio ? <Card title={PROFILE_TEXT.about}><Body>{cv.bio}</Body></Card> : null}

      {cv.experience.length > 0 && (
        <Card title={PROFILE_TEXT.experience}>
          {cv.experience.map((e, i) => (
            <View key={`${e.role}-${i}`} style={styles.exp}>
              <View style={styles.expDot} />
              <View style={styles.expTexts}>
                <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.navy}>{e.role}</Text>
                <Text family="noto-sans" size={14} color={Colors.v2.muted}>{[e.org, e.period].filter(Boolean).join(' · ')}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {cv.specialties.length > 0 && (
        <Card title={PROFILE_TEXT.specialties}>
          <View style={styles.chips}>
            {cv.specialties.map((s) => (
              <View key={s} style={styles.chip}>
                <Text family="noto-sans" weight="semibold" size={13} color={Colors.v2.limeTintText}>{s}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {cv.education ? <Card title={PROFILE_TEXT.education}><Body>{cv.education}</Body></Card> : null}

      <Card
        title={PROFILE_TEXT.organizations}
        action={
          <TouchableOpacity onPress={() => router.push('/(main)/media-subscriptions' as never)} hitSlop={8} accessibilityRole="button">
            <Text family="noto-sans" weight="bold" size={14} color={Colors.v2.limeText}>{PROFILE_TEXT.manageOrgs}</Text>
          </TouchableOpacity>
        }
      >
        <Body>{followedCount > 0 ? PROFILE_TEXT.followingCount(followedCount) : PROFILE_TEXT.noOrgs}</Body>
      </Card>

      {socials.length > 0 && (
        <Card title={PROFILE_TEXT.socials}>
          <View style={styles.chips}>
            {socials.map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => void Linking.openURL(socialUrl(k, cv.socials[k] ?? ''))}
                accessibilityRole="link"
                accessibilityLabel={PROFILE_TEXT.socialLabel[k]}
                style={styles.social}
              >
                <Ionicons name={SOCIAL_ICON[k]} size={20} color={Colors.v2.navy} />
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.v2.light.cardBorder, padding: 18, gap: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exp: { flexDirection: 'row', gap: 12 },
  expDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.v2.lime, marginTop: 6 },
  expTexts: { flex: 1, gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: Colors.v2.limeTint, justifyContent: 'center' },
  social: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.v2.sheet.border, alignItems: 'center', justifyContent: 'center' },
})
