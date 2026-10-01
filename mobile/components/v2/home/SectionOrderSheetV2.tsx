import { useState } from 'react'
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import DraggableFlatList, { ScaleDecorator, type RenderItemParams } from 'react-native-draggable-flatlist'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { Colors } from '@/constants/colors'
import { HOME_BLOCKS, normalizeHomeOrder, type HomeBlockKey } from '@/lib/feed-v2/home-sections'
import { HOME_TEXT as T } from '@/lib/feed-v2/labels'

const V = Colors.v2

interface Props {
  order: string[] | undefined
  onChange: (order: HomeBlockKey[]) => void
  onClose: () => void
}

// "Ordenar intereses": mantener apretado un bloque y deslizarlo a su lugar (como el "Ajustar interés" de
// la v1). Un Modal es otra ventana nativa: los gestos necesitan su propia GestureHandlerRootView.
export function SectionOrderSheetV2({ order, onChange, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [items, setItems] = useState<HomeBlockKey[]>(() => normalizeHomeOrder(order))

  function renderItem({ item, drag, isActive }: RenderItemParams<HomeBlockKey>) {
    const meta = HOME_BLOCKS.find((b) => b.key === item)!
    return (
      <ScaleDecorator activeScale={1.03}>
        <TouchableOpacity
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null)
            drag()
          }}
          delayLongPress={180}
          disabled={isActive}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityHint={T.orderBody}
          style={[styles.row, isActive && styles.rowActive]}
        >
          <View style={styles.icon}>
            <Ionicons name={meta.icon} size={18} color={V.limeText} />
          </View>
          <Text family="noto-sans" weight="semibold" size={15} color={V.navy} style={styles.flex}>{meta.label}</Text>
          <Ionicons name="reorder-three" size={24} color={V.muted} />
        </TouchableOpacity>
      </ScaleDecorator>
    )
  }

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.fill}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <View style={styles.flex}>
              <Text family="noto-sans" weight="extrabold" size={22} color={V.navy}>{T.orderTitle}</Text>
              <Text family="noto-sans" size={14} lineHeight={20} color={V.muted}>{T.orderBody}</Text>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.close}>
              <Ionicons name="close" size={20} color={V.navy} />
            </TouchableOpacity>
          </View>
          <DraggableFlatList
            data={items}
            keyExtractor={(k) => k}
            renderItem={renderItem}
            containerStyle={styles.list}
            contentContainerStyle={styles.listContent}
            onDragEnd={({ data }) => {
              setItems(data)
              onChange(data)
            }}
          />
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, gap: 4 },
  backdrop: { flex: 1, backgroundColor: V.sheet.backdrop },
  sheet: { maxHeight: '88%', backgroundColor: V.ground, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: V.sheet.border, marginBottom: 8 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: V.surface, alignItems: 'center', justifyContent: 'center' },
  list: { flexGrow: 0 },
  listContent: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 14, borderRadius: 16, backgroundColor: V.surface },
  rowActive: { shadowColor: V.navy, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  icon: { width: 34, height: 34, borderRadius: 17, backgroundColor: V.limeTint, alignItems: 'center', justifyContent: 'center' },
})
