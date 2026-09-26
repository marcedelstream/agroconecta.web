import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { Fonts } from '@/constants/typography'

interface Props extends Pick<TextInputProps, 'autoCapitalize' | 'keyboardType' | 'maxLength'> {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  multiline?: boolean
}

// Campo de texto de los formularios claros v2 (Editar perfil, y los que vengan: onboarding, leads).
export function FormField({ label, value, onChangeText, placeholder, multiline, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text family="noto-sans" weight="semibold" size={13} color={Colors.v2.muted}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.v2.light.placeholder}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        accessibilityLabel={label}
        style={[styles.input, multiline && styles.multiline]}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.v2.light.inputBorder,
    backgroundColor: Colors.v2.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    color: Colors.v2.navy,
  },
  multiline: { minHeight: 110 },
})
