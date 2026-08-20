import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { Spacing } from '@/constants/spacing'

const logo = require('@/assets/images/logo-dark.png')
const R = Colors.redesign

interface Props {
  onMenuPress: () => void
}

export function HomeTopBar({ onMenuPress }: Props) {
  return (
    <View style={styles.bar}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} activeOpacity={0.8} hitSlop={8}>
        <Ionicons name="menu-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: R.header.bg,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { height: 26, width: 118 },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: R.header.chip,
    borderWidth: 1,
    borderColor: R.header.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
