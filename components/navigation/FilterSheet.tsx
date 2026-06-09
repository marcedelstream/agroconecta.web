import { useRef, useEffect } from 'react'
import {
  View,
  Animated,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { useColors } from '@/lib/theme-context'
import { Radius, Spacing } from '@/constants/spacing'
import { newsCategories } from '@/lib/mock-data'
import type { NewsCategory } from '@/lib/types'

const { height: SCREEN_H } = Dimensions.get('window')
const SHEET_H = SCREEN_H * 0.52

interface Props {
  selected: NewsCategory | null
  onSelect: (cat: NewsCategory | null) => void
  onClose: () => void
}

export function FilterSheet({ selected, onSelect, onClose }: Props) {
  const C = useColors()
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
  }, [])

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_H, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose)
  }

  function handleSelect(cat: NewsCategory | null) {
    onSelect(cat)
    handleClose()
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { backgroundColor: C.surface, borderColor: C.border, transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: C.border }]} />

        <View style={[styles.sheetHeader, { borderBottomColor: C.border }]}>
          <Text variant="subtitle" weight="semibold" family="poppins">Filtrar por categoría</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={C.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.options}>
          {/* All option */}
          <TouchableOpacity
            style={[styles.option, { backgroundColor: C.secondary, borderColor: C.border }, selected === null && styles.optionActive]}
            onPress={() => handleSelect(null)}
            activeOpacity={0.75}
          >
            <View style={[styles.optionIcon, selected === null && styles.optionIconActive]}>
              <Ionicons name="apps-outline" size={20} color={selected === null ? '#0A0A13' : C.muted} />
            </View>
            <Text variant="body" weight="medium" style={selected === null ? { color: '#0A0A13' } : { color: C.foreground }}>
              Todas las categorías
            </Text>
            {selected === null && (
              <Ionicons name="checkmark" size={18} color="#0A0A13" style={styles.check} />
            )}
          </TouchableOpacity>

          {newsCategories.map((cat) => {
            const isActive = selected === cat.value
            const catColor = Colors.category[cat.value as keyof typeof Colors.category]
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.option, { backgroundColor: C.secondary, borderColor: C.border }, isActive && { backgroundColor: `${catColor}15`, borderColor: catColor }]}
                onPress={() => handleSelect(cat.value)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${catColor}20` }]}>
                  <Ionicons name="pricetag-outline" size={20} color={catColor} />
                </View>
                <Text variant="body" weight="medium" style={isActive ? { color: catColor } : { color: C.foreground }}>
                  {cat.label}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark" size={18} color={catColor} style={styles.check} />
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing[3],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
  },
  options: {
    padding: Spacing[4],
    gap: Spacing[2],
    paddingBottom: Spacing[8],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: Radius.base,
    borderWidth: 1,
  },
  optionActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconActive: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  check: { marginLeft: 'auto' },
})
