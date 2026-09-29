import { useCallback, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/Text'
import { DetailSheet } from '@/components/v2/detail/DetailSheet'
import { useFloatingTabBarSpace } from '@/components/v2/FloatingTabBar'
import { KaraiIntro } from '@/components/v2/karai/KaraiIntro'
import { KaraiHistorySheet } from '@/components/v2/karai/KaraiHistorySheet'
import { KaraiBubble, TypingBubble } from '@/components/v2/karai/KaraiMessages'
import { ToastHost } from '@/components/v2/ToastHost'
import { GuestPrompt } from '@/components/v2/GuestPrompt'
import { useApp } from '@/lib/app-context'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { Fonts } from '@/constants/typography'
import { KARAI_HISTORY_TEXT, KARAI_TEXT } from '@/lib/feed-v2/labels'
import type { FeedContentItem } from '@/lib/feed-v2/types'
import { useItemActions, type ItemUpdater } from '@/lib/feed-v2/use-item-actions'
import { useKarai } from '@/lib/feed-v2/use-karai'
import { useKeyboardVisible } from '@/lib/use-keyboard-visible'

// Karai v2 (README §3.4): chat con la misma IA del web, con tarjetas de contenido de Agroconecta que
// se abren en la misma ficha del feed.
export default function KaraiScreen() {
  const insets = useSafeAreaInsets()
  const bottomSpace = useFloatingTabBarSpace()
  const { messages, typing, quota, send, reset, openConversation, conversationId } = useKarai()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [input, setInput] = useState('')
  const [refItem, setRefItem] = useState<FeedContentItem | null>(null)
  const scroll = useRef<ScrollView>(null)
  const { session, user } = useApp()
  // Con el teclado abierto la barra de tabs queda tapada: el lugar reservado para ella dejaba la caja de
  // texto flotando lejos del teclado.
  const keyboardOpen = useKeyboardVisible()

  const update = useCallback<ItemUpdater>((fn) => setRefItem((i) => (i ? fn(i) : i)), [])
  const { actions } = useItemActions(update)
  const openRef = (item: FeedContentItem) => {
    actions.openDetail(item)
    setRefItem(item)
  }

  function submit(text = input) {
    if (!text.trim() || typing) return
    setInput('')
    void send(text)
  }

  const left = quota ? Math.max(0, quota.limit - quota.used) : null
  const hasMessages = messages.length > 0

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <View style={[styles.head, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headRow}>
          <Text family="noto-sans" weight="extrabold" size={17} color={Colors.v2.navy}>{KARAI_TEXT.name}</Text>
          {left !== null && <Text family="noto-sans" size={13} color={Colors.v2.muted} style={styles.flex}>{KARAI_TEXT.quota(left)}</Text>}
          {/* Esquina: nueva consulta, historial y Mi campo (Karai Campo; sin membresía muestra qué es). */}
          {session && (
            <View style={styles.corner}>
              {hasMessages && (
                <TouchableOpacity onPress={reset} accessibilityRole="button" accessibilityLabel={KARAI_TEXT.newChat} style={styles.iconBtn}>
                  <Ionicons name="create-outline" size={19} color={Colors.v2.navy} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setHistoryOpen(true)} accessibilityRole="button" accessibilityLabel={KARAI_HISTORY_TEXT.history} style={styles.iconBtn}>
                <Ionicons name="time-outline" size={19} color={Colors.v2.navy} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push((user?.isMember ? '/(main)/mi-campo' : '/(main)/karai-campo') as never)}
                accessibilityRole="button"
                accessibilityLabel={KARAI_HISTORY_TEXT.farm}
                style={[styles.iconBtn, styles.farmBtn]}
              >
                <Ionicons name="leaf" size={18} color={Colors.v2.navy} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {!hasMessages && (
          <Text family="noto-sans" weight="extrabold" size={34} lineHeight={38} color={Colors.v2.navy} style={styles.h1}>{KARAI_TEXT.title}</Text>
        )}
      </View>

      <ScrollView
        ref={scroll}
        style={styles.flex}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => hasMessages && scroll.current?.scrollToEnd({ animated: true })}
      >
        {hasMessages ? (
          <>
            {messages.map((m) => <KaraiBubble key={m.id} message={m} onOpenRef={openRef} />)}
            {typing && <TypingBubble />}
          </>
        ) : session ? (
          <KaraiIntro onAsk={submit} />
        ) : (
          <GuestPrompt icon="sparkles" title={KARAI_TEXT.guestTitle} body={KARAI_TEXT.guestBody} />
        )}
      </ScrollView>

      {session && <View style={[styles.inputRow, { paddingBottom: keyboardOpen ? 8 : bottomSpace + 8 }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={KARAI_TEXT.placeholder}
          placeholderTextColor={Colors.v2.light.placeholder}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={() => submit()}
          editable={!typing}
          accessibilityLabel={KARAI_TEXT.placeholder}
        />
        <TouchableOpacity onPress={() => submit()} disabled={!input.trim() || typing} accessibilityRole="button" accessibilityLabel={KARAI_TEXT.send} style={[styles.send, (!input.trim() || typing) && styles.sendOff]}>
          <Ionicons name="arrow-up" size={22} color={Colors.v2.navy} />
        </TouchableOpacity>
      </View>}

      <ToastHost />
      {historyOpen && (
        <KaraiHistorySheet
          activeId={conversationId.current}
          onClose={() => setHistoryOpen(false)}
          onOpen={(id) => {
            setHistoryOpen(false)
            void openConversation(id)
          }}
        />
      )}
      <DetailSheet item={refItem} actions={actions} onClose={() => setRefItem(null)} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.v2.ground },
  flex: { flex: 1 },
  head: { paddingHorizontal: 20, paddingBottom: 12, gap: 6 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  corner: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.v2.sheet.border, backgroundColor: Colors.v2.surface, alignItems: 'center', justifyContent: 'center' },
  farmBtn: { backgroundColor: Colors.v2.lime, borderColor: Colors.v2.lime },
  h1: { marginTop: 18, letterSpacing: -0.8 },
  body: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  input: {
    flex: 1,
    height: V2Layout.ctaHeight,
    borderRadius: V2Layout.ctaRadius,
    borderWidth: 1,
    borderColor: Colors.v2.sheet.border,
    backgroundColor: Colors.v2.surface,
    paddingHorizontal: 20,
    fontFamily: Fonts.dmSans,
    fontSize: 16,
    color: Colors.v2.navy,
  },
  send: { width: V2Layout.ctaHeight, height: V2Layout.ctaHeight, borderRadius: V2Layout.ctaRadius, backgroundColor: Colors.v2.lime, alignItems: 'center', justifyContent: 'center' },
  sendOff: { opacity: 0.4 },
})
