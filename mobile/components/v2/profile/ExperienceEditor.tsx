import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { FormField } from '@/components/v2/form/FormField'
import { Colors } from '@/constants/colors'
import { EDIT_CV_TEXT } from '@/lib/feed-v2/labels'
import type { ExperienceEntry } from '@/lib/profile-cv'

const MAX_ENTRIES = 10
const EMPTY_ENTRY: ExperienceEntry = { role: '', org: '', period: '' }

interface Props {
  value: ExperienceEntry[]
  onChange: (value: ExperienceEntry[]) => void
}

export function ExperienceEditor({ value, onChange }: Props) {
  const set = (i: number, change: Partial<ExperienceEntry>) => onChange(value.map((e, j) => (j === i ? { ...e, ...change } : e)))

  return (
    <View style={styles.wrap}>
      {value.map((e, i) => (
        <View key={i} style={styles.card}>
          <FormField label={EDIT_CV_TEXT.expRole} value={e.role} onChangeText={(role) => set(i, { role })} maxLength={80} />
          <FormField label={EDIT_CV_TEXT.expOrg} value={e.org} onChangeText={(org) => set(i, { org })} maxLength={80} />
          <FormField label={EDIT_CV_TEXT.expPeriod} value={e.period} onChangeText={(period) => set(i, { period })} maxLength={30} />
          <TouchableOpacity onPress={() => onChange(value.filter((_, j) => j !== i))} accessibilityRole="button" style={styles.remove}>
            <Ionicons name="trash-outline" size={16} color={Colors.v2.live} />
            <Text family="noto-sans" weight="semibold" size={14} color={Colors.v2.live}>{EDIT_CV_TEXT.expRemove}</Text>
          </TouchableOpacity>
        </View>
      ))}
      {value.length < MAX_ENTRIES && (
        <TouchableOpacity onPress={() => onChange([...value, EMPTY_ENTRY])} accessibilityRole="button" style={styles.add}>
          <Ionicons name="add" size={20} color={Colors.v2.limeText} />
          <Text family="noto-sans" weight="bold" size={15} color={Colors.v2.limeText}>{EDIT_CV_TEXT.expAdd}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { backgroundColor: Colors.v2.surface, borderRadius: 18, padding: 14, gap: 10 },
  remove: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 36 },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.v2.sheet.border,
  },
})
