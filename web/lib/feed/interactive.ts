import type { SupabaseClient } from '@supabase/supabase-js'
import type { FeedInteractiveItem, FeedPollItem, FeedQuizItem, QuizAnswer } from './types'

// Encuestas y quiz dentro del feed (README §3.1, BACKEND §3.3: máximo 1 cada 8 items).

export const INTERACTIVE_FIRST_POSITION = 4
export const INTERACTIVE_EVERY = 8

/**
 * Intercala `extra` en posiciones fijas (first, first+every, …) de la lista ya ordenada. Posiciones
 * fijas y no por puntaje: así la paginación por offset no se corre entre páginas.
 */
export function interleaveEvery<T, I>(items: T[], extra: I[], first: number, every: number): (T | I)[] {
  const out: (T | I)[] = []
  let next = 0
  for (const item of items) {
    if (next < extra.length && out.length === first + next * every) out.push(extra[next++])
    out.push(item)
  }
  return out
}

export function interleaveInteractive<T, I>(items: T[], interactive: I[]): (T | I)[] {
  return interleaveEvery(items, interactive, INTERACTIVE_FIRST_POSITION, INTERACTIVE_EVERY)
}

interface PollRow {
  id: string
  question: string
  poll_options: { id: string; label: string; position: number }[]
}

interface QuizRow {
  id: string
  title: string
  quiz_questions: { id: string; question: string; options: string[]; position: number }[]
}

interface AnswerRow {
  question_id: string
  chosen_index: number
  is_correct: boolean
}

async function pointsConfig(db: SupabaseClient): Promise<{ poll: number; quiz: number }> {
  const { data } = await db.from('points_config').select('key,value').in('key', ['poll_vote', 'quiz_correct'])
  const map = new Map(((data ?? []) as { key: string; value: number | null }[]).map((r) => [r.key, Number(r.value ?? 0)]))
  return { poll: map.get('poll_vote') ?? 0, quiz: map.get('quiz_correct') ?? 0 }
}

/** Encuestas sin votar y quizzes sin terminar del usuario. Best-effort: sin migración, lista vacía. */
export async function loadInteractive(db: SupabaseClient, userId: string, now: Date): Promise<FeedInteractiveItem[]> {
  const nowIso = now.toISOString()
  const active = `ends_at.is.null,ends_at.gt.${nowIso}`
  const [polls, votes, quizzes, points] = await Promise.all([
    db.from('polls').select('id,question,poll_options(id,label,position)').eq('is_active', true).lte('starts_at', nowIso).or(active),
    db.from('poll_votes').select('poll_id').eq('user_id', userId),
    db.from('quizzes').select('id,title,quiz_questions(id,question,options,position)').eq('is_active', true).lte('starts_at', nowIso).or(active),
    pointsConfig(db),
  ])
  if (polls.error && quizzes.error) return []

  const voted = new Set(((votes.data ?? []) as { poll_id: string }[]).map((v) => v.poll_id))
  const pollItems: FeedPollItem[] = ((polls.data ?? []) as PollRow[])
    .filter((p) => !voted.has(p.id))
    .map((p) => ({
      kind: 'poll',
      key: `poll:${p.id}`,
      id: p.id,
      question: p.question,
      points: points.poll,
      options: [...p.poll_options].sort((a, b) => a.position - b.position).map(({ id, label }) => ({ id, label })),
    }))

  const quizRows = (quizzes.data ?? []) as QuizRow[]
  const questionIds = quizRows.flatMap((q) => q.quiz_questions.map((x) => x.id))
  const { data: answerData } = questionIds.length
    ? await db.from('quiz_answers').select('question_id,chosen_index,is_correct').eq('user_id', userId).in('question_id', questionIds)
    : { data: [] }
  const answers = new Map(((answerData ?? []) as AnswerRow[]).map((a) => [a.question_id, a]))
  // La respuesta correcta se lee (con service role) solo de lo que el usuario ya respondió.
  const answeredIds = [...answers.keys()]
  const { data: keyData } = answeredIds.length
    ? await db.from('quiz_answer_keys').select('question_id,correct_index').in('question_id', answeredIds)
    : { data: [] }
  const keys = new Map(((keyData ?? []) as { question_id: string; correct_index: number }[]).map((k) => [k.question_id, k.correct_index]))

  const quizItems: FeedQuizItem[] = quizRows.flatMap((q) => {
    const questions = [...q.quiz_questions].sort((a, b) => a.position - b.position)
    const answered: QuizAnswer[] = questions.flatMap((x) => {
      const a = answers.get(x.id)
      return a ? [{ questionId: x.id, chosenIndex: a.chosen_index, correct: a.is_correct, correctIndex: keys.get(x.id) ?? -1 }] : []
    })
    if (questions.length === 0 || answered.length === questions.length) return []
    return [{
      kind: 'quiz' as const,
      key: `quiz:${q.id}`,
      id: q.id,
      title: q.title,
      pointsPerCorrect: points.quiz,
      questions: questions.map(({ id, question, options }) => ({ id, question, options })),
      answered,
    }]
  })

  // Alterna encuesta / quiz para que no salgan dos del mismo tipo seguidos.
  const out: FeedInteractiveItem[] = []
  for (let i = 0; i < Math.max(pollItems.length, quizItems.length); i++) {
    if (pollItems[i]) out.push(pollItems[i])
    if (quizItems[i]) out.push(quizItems[i])
  }
  return out
}
