import { useState } from 'react'
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { SettingsSheet } from './SettingsSheet'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { departments } from '@/lib/mock-data'
import { useColors } from '@/lib/theme-context'
import { Colors } from '@/constants/colors'
import { Radius, Spacing } from '@/constants/spacing'
import type { Department } from '@/lib/types'

interface Props {
  name: string
  department: Department
  onClose: (updated?: { name: string; department: Department }) => void
}

export function EditProfileSheet({ name, department, onClose }: Props) {
  const C = useColors()
  const [localName, setLocalName] = useState(name)
  const [localDepartment, setLocalDepartment] = useState<Department>(department)

  return (
    <SettingsSheet title="Editar perfil" onClose={() => onClose()} heightRatio={0.74}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TextInput
          value={localName}
          onChangeText={setLocalName}
          placeholder="Nombre"
          placeholderTextColor={C.muted}
          style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.foreground }]}
        />

        <Text variant="body" weight="semibold">Departamento</Text>
        <View style={styles.grid}>
          {departments.map((item) => {
            const active = item.value === localDepartment
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setLocalDepartment(item.value)}
                style={[styles.department, { backgroundColor: C.surface, borderColor: C.border }, active && styles.departmentActive]}
              >
                <Text variant="caption" weight="medium" style={{ color: active ? '#0A0A13' : C.foreground }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Button
          fullWidth
          size="lg"
          disabled={localName.trim().length < 2}
          onPress={() => onClose({ name: localName.trim(), department: localDepartment })}
        >
          Guardar cambios
        </Button>
      </ScrollView>
    </SettingsSheet>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing[5], gap: Spacing[4], paddingBottom: Spacing[10] },
  input: {
    borderWidth: 1,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    fontSize: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  department: {
    width: '31%',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[2],
  },
  departmentActive: { backgroundColor: Colors.lime, borderColor: Colors.lime },
})
