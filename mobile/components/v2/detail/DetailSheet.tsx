import { useCallback, useEffect } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DetailActions } from '@/components/v2/detail/DetailActions'
import { DetailContent } from '@/components/v2/detail/DetailContent'
import { DetailHero } from '@/components/v2/detail/DetailHero'
import { ToastHost } from '@/components/v2/ToastHost'
import { Colors } from '@/constants/colors'
import { DETAIL_TEXT } from '@/lib/feed-v2/labels'
import { useFeedDetail } from '@/lib/feed-v2/use-detail'
import type { FeedContentItem } from '@/lib/feed-v2/types'
import type { FeedActions } from '@/lib/feed-v2/use-feed'

const OPEN_MS = 280
const CLOSE_MS = 220
// Bajar la cabecera más que esto (o con velocidad) cierra la ficha.
const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 900
// Espacio arriba para que se vea el feed detrás (48 px en el prototipo, más el área segura).
const TOP_GAP = 48

interface Props {
  item: FeedContentItem | null
  actions: FeedActions
  onClose: () => void
}

// Ficha "Ver …" (README §3.2): hoja inferior casi a pantalla completa sobre el feed.
export function DetailSheet({ item, actions, onClose }: Props) {
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { detail, reminderOn, toggleReminder } = useFeedDetail(item)
  const translateY = useSharedValue(height)

  useEffect(() => {
    if (!item) return
    translateY.value = height
    translateY.value = withTiming(0, { duration: OPEN_MS })
    // Solo al abrir otro item, no cuando cambia su estado (me gusta, guardado…).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.key])

  const close = useCallback(() => {
    translateY.value = withTiming(height, { duration: CLOSE_MS }, (done) => {
      if (done) runOnJS(onClose)()
    })
  }, [height, onClose, translateY])

  // Solo la cabecera arrastra: el cuerpo es un ScrollView y tiene que poder desplazarse.
  const drag = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY)
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(height, { duration: CLOSE_MS }, (done) => {
          if (done) runOnJS(onClose)()
        })
      } else {
        translateY.value = withTiming(0, { duration: OPEN_MS })
      }
    })

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }))
  const backdropStyle = useAnimatedStyle(() => ({ opacity: 1 - Math.min(1, translateY.value / height) }))

  if (!item) return null

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      {/* Un Modal es otra ventana nativa: los gestos necesitan su propia raíz. */}
      <GestureHandlerRootView style={styles.fill}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={styles.fill} onPress={close} accessibilityLabel={DETAIL_TEXT.close} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { top: insets.top + TOP_GAP }, sheetStyle]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
            <GestureDetector gesture={drag}>
              <View>
                <DetailHero item={item} onClose={close} />
              </View>
            </GestureDetector>
            <View style={styles.body}>
              <DetailContent item={item} detail={detail} onToggleFollow={() => actions.toggleFollow(item)} />
              <DetailActions
                item={item}
                detail={detail}
                reminderOn={reminderOn}
                onToggleReminder={toggleReminder}
                onToggleSave={() => actions.toggleSaveWithToast(item)}
                onShare={() => actions.share(item)}
                onNavigate={onClose}
              />
            </View>
          </ScrollView>
        </Animated.View>
        <ToastHost />
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { backgroundColor: Colors.v2.sheet.backdrop },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.v2.ground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  body: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
})
