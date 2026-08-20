import { useRef, useEffect, useState } from 'react'
import { View, Animated, Pressable, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DraggableFlatList, { ScaleDecorator, type RenderItemParams } from 'react-native-draggable-flatlist'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

const { height: SCREEN_H } = Dimensions.get('window')
const SHEET_H = SCREEN_H * 0.74
const R = Colors.redesign

interface SectionMeta {
  key: string
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
}

interface Props {
  title?: string
  sections: SectionMeta[]
  order: string[] | undefined
  normalize: (order: string[] | undefined) => string[]
  onChange: (order: string[]) => void
  onClose: () => void
}

export function SectionOrderSheet({ title = 'Ajustar interés', sections, order, normalize, onChange, onClose }: Props) {
  const [items, setItems] = useState<string[]>(() => normalize(order))
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 0 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_H, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(onClose)
  }

  function handleDragEnd(data: string[]) {
    setItems(data)
    onChange(data)
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { height: SHEET_H, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text family="noto-sans" weight="bold" size={17} color={R.foreground}>{title}</Text>
            <Text family="noto-sans" size={12} color={R.mutedForeground} style={styles.subtitle}>
              Mantené presionado y arrastrá para reordenar
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={R.mutedForeground} />
          </TouchableOpacity>
        </View>

        <DraggableFlatList
          data={items}
          style={styles.listFlex}
          keyExtractor={(key) => key}
          contentContainerStyle={styles.list}
          onDragEnd={({ data }) => handleDragEnd(data)}
          renderItem={({ item, drag, isActive }: RenderItemParams<string>) => {
            const meta = sections.find((s) => s.key === item)!
            return (
              <ScaleDecorator>
                <TouchableOpacity
                  style={[styles.row, isActive && styles.rowActive]}
                  onLongPress={drag}
                  delayLongPress={150}
                  activeOpacity={0.85}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name={meta.icon} size={18} color={R.foreground} />
                  </View>
                  <Text family="noto-sans" weight="semibold" size={14} color={R.foreground} style={styles.rowLabel}>
                    {meta.label}
                  </Text>
                  <Ionicons name="reorder-three-outline" size={22} color="#A8A8B2" />
                </TouchableOpacity>
              </ScaleDecorator>
            )
          }}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: R.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, backgroundColor: R.border },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: R.divider,
  },
  subtitle: { marginTop: 3 },
  listFlex: { flex: 1 },
  list: { padding: 20, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: R.surface,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  rowActive: { backgroundColor: R.limeSoftBg },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: R.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1 },
})
