import { memo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Text } from '@/components/ui/Text'
import { InteractiveFrame } from '@/components/v2/interactive/InteractiveFrame'
import { Colors } from '@/constants/colors'
import { V2Layout } from '@/constants/spacing'
import { POINTS_TEXT, QUIZ_TEXT } from '@/lib/feed-v2/labels'
import { answerQuiz } from '@/lib/feed-v2/points'
import { showToast } from '@/lib/feed-v2/toast'
import type { FeedQuizItem, QuizAnswer } from '@/lib/feed-v2/types'

const I = Colors.v2.interactive

function QuizSlideBase({ item, height }: { item: FeedQuizItem; height: number }) {
  const [answers, setAnswers] = useState<QuizAnswer[]>(item.answered)
  // Arranca en la primera pregunta sin responder (el quiz puede haber quedado a medias). Pasar de la
  // última ("Ver resultado") lleva step a total = pantalla de resultado.
  const [step, setStep] = useState(item.answered.length)
  const [sending, setSending] = useState(false)
  const total = item.questions.length
  const done = step >= total
  const current = item.questions[Math.min(step, total - 1)]
  const answer = answers.find((a) => a.questionId === current.id)
  const correctCount = answers.filter((a) => a.correct).length

  async function pick(choice: number) {
    if (answer || sending) return
    setSending(true)
    const r = await answerQuiz(current.id, choice)
    setSending(false)
    if (!r) return showToast(QUIZ_TEXT.error)
    Haptics.notificationAsync(r.correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => null)
    setAnswers((prev) => [...prev, { questionId: current.id, chosenIndex: r.chosenIndex, correct: r.correct, correctIndex: r.correctIndex }])
    showToast(r.awarded > 0 ? POINTS_TEXT.toastEarned(r.awarded) : r.correct ? QUIZ_TEXT.correct : QUIZ_TEXT.toastWrong)
  }

  const stepLabel = done ? QUIZ_TEXT.complete : QUIZ_TEXT.step(step + 1, total)

  return (
    <InteractiveFrame height={height} eyebrow={`${QUIZ_TEXT.label} · ${stepLabel}`} badge={QUIZ_TEXT.perCorrect(item.pointsPerCorrect)}>
      <View style={styles.dots}>
        {item.questions.map((q) => {
          const a = answers.find((x) => x.questionId === q.id)
          return <View key={q.id} style={[styles.dot, { backgroundColor: a ? (a.correct ? Colors.v2.lime : Colors.v2.live) : Colors.v2.light.segTrack }]} />
        })}
      </View>

      {done ? (
        <>
          <View style={styles.result}>
            <Text family="noto-sans" weight="extrabold" size={22} color={Colors.v2.navy}>{QUIZ_TEXT.score(correctCount, total)}</Text>
            <Text family="noto-sans" size={15} color={Colors.v2.muted} style={styles.center}>
              {correctCount > 0 ? QUIZ_TEXT.earned(correctCount * item.pointsPerCorrect) : QUIZ_TEXT.none}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(main)/canjes' as never)} style={[styles.btn, styles.btnLime]} accessibilityRole="button">
            <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.navy}>{QUIZ_TEXT.redeem}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text family="noto-sans" weight="extrabold" size={22} lineHeight={26} color={Colors.v2.navy}>{current.question}</Text>
          <View style={styles.options}>
            {current.options.map((label, i) => {
              const isOk = !!answer && i === answer.correctIndex
              const isMine = !!answer && i === answer.chosenIndex
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => pick(i)}
                  disabled={!!answer || sending}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  style={[styles.option, isOk && styles.optionOk, isMine && !isOk && styles.optionBad, answer && !isOk && !isMine && styles.dim]}
                >
                  <Text family="noto-sans" weight="semibold" size={15} color={Colors.v2.navy} style={styles.flex}>{label}</Text>
                  {(isOk || isMine) && (
                    <Text family="noto-sans" weight="extrabold" size={12} color={isOk ? Colors.v2.limeText : I.badText}>
                      {isOk ? QUIZ_TEXT.correct : QUIZ_TEXT.yours}
                    </Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
          {answer && (
            <TouchableOpacity onPress={() => setStep((s) => s + 1)} style={[styles.btn, styles.btnNavy]} accessibilityRole="button">
              <Text family="noto-sans" weight="bold" size={16} color={Colors.v2.white}>{step === total - 1 ? QUIZ_TEXT.result : QUIZ_TEXT.next}</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </InteractiveFrame>
  )
}

export const QuizSlide = memo(QuizSlideBase)

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2 },
  options: { gap: 8 },
  option: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: I.optionBorder,
    backgroundColor: I.optionBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionOk: { backgroundColor: I.okBg, borderColor: I.okBorder },
  optionBad: { backgroundColor: I.badBg, borderColor: I.badBorder },
  dim: { opacity: 0.55 },
  flex: { flex: 1 },
  btn: { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', minHeight: V2Layout.minTouch },
  btnNavy: { backgroundColor: Colors.v2.navy },
  btnLime: { backgroundColor: Colors.v2.lime },
  result: { alignItems: 'center', gap: 8, paddingTop: 10, paddingBottom: 4 },
  center: { textAlign: 'center' },
})
