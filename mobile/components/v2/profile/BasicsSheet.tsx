import { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/Text'
import { V2Sheet } from '@/components/v2/V2Sheet'
import { ChoiceChips } from '@/components/v2/onboarding/ChoiceChips'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { BASICS_TEXT as T } from '@/lib/feed-v2/labels'
import { departments, professions } from '@/lib/mock-data'
import type { Department, Profession } from '@/lib/types'

interface Props {
  name: string
  department: Department
  profession: Profession
  onClose: (updated?: { name: string; department: Department; profession: Profession }) => void
}

// Nombre, profesión y departamento con las mismas opciones grandes del onboarding v2.
export function BasicsSheet({ name, department, profession, onClose }: Props) {
  const [localName, setLocalName] = useState(name)
  const [localProfession, setLocalProfession] = useState<Profession>(profession)
  const [localDepartment, setLocalDepartment] = useState<Department>(department)
  const valid = localName.trim().length >= 2

  return (
    <V2Sheet
      title={T.title}
      onClose={() => onClose()}
      footer={
        <TouchableOpacity
          onPress={() => onClose({ name: localName.trim(), profession: localProfession, department: localDepartment })}
          disabled={!valid}
          accessibilityRole="button"
          style={[styles.save, !valid && styles.off]}
        >
          <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.white}>{T.save}</Text>
        </TouchableOpacity>
      }
    >
      <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} style={styles.label}>{T.name}</Text>
      <TextInput
        value={localName}
        onChangeText={setLocalName}
        placeholder={T.namePlaceholder}
        placeholderTextColor={Colors.v2.light.placeholder}
        style={styles.input}
        accessibilityLabel={T.name}
      />
      <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} style={styles.label}>{T.profession}</Text>
      <ChoiceChips options={professions} selected={[localProfession]} onToggle={(v) => setLocalProfession(v as Profession)} />
      <Text family="noto-sans" weight="bold" size={13} color={Colors.v2.muted} style={styles.label}>{T.department}</Text>
      <ChoiceChips options={departments} selected={[localDepartment]} onToggle={(v) => setLocalDepartment(v as Department)} />
    </V2Sheet>
  )
}

const styles = StyleSheet.create({
  label: { letterSpacing: 1, marginBottom: -6 },
  input: {
    height: V2Layout.ctaHeight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    paddingHorizontal: 16,
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    color: Colors.v2.navy,
  },
  save: { height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: Colors.v2.navy, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.4 },
})
