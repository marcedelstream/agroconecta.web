'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { getAuthContext } from '@/lib/auth-roles'
import { backWithError, backWithOk } from '@/lib/admin-feedback'

const PATH = '/admin/encuestas'

const QUIZ_QUESTIONS = 3
const MIN_OPTIONS = 2
const MAX_OPTIONS = 5

async function requireAdmin() {
  if (!(await getAuthContext())) throw new Error('No tenés permiso para administrar encuestas.')
}

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
}

export async function createPoll(formData: FormData) {
  await requireAdmin()
  const question = String(formData.get('question') ?? '').trim()
  const options = lines(formData.get('options'))
  if (!question || options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
    backWithError(PATH, `La encuesta necesita una pregunta y entre ${MIN_OPTIONS} y ${MAX_OPTIONS} opciones (una por línea).`)
  }
  const db = createSupabaseAdmin()
  const { data, error } = await db.from('polls').insert({ question }).select('id').single()
  if (error || !data) backWithError(PATH, `No se pudo crear la encuesta: ${error?.message ?? 'error desconocido'}`)
  await db.from('poll_options').insert(options.map((label, i) => ({ poll_id: data.id, label, position: i + 1 })))
  revalidatePath(PATH)
  backWithOk(PATH, 'Encuesta creada. Ya aparece en el feed de la app.')
}

// La respuesta correcta va a quiz_answer_keys (sin policies): la app nunca la ve antes de responder.
export async function createQuiz(formData: FormData) {
  await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  if (!title) backWithError(PATH, 'El quiz necesita un título.')
  const questions = Array.from({ length: QUIZ_QUESTIONS }, (_, i) => ({
    question: String(formData.get(`q${i}`) ?? '').trim(),
    options: lines(formData.get(`o${i}`)),
    correct: Number(formData.get(`c${i}`)) - 1,
  }))
  for (const q of questions) {
    if (!q.question || q.options.length < MIN_OPTIONS || q.options.length > MAX_OPTIONS || !(q.correct >= 0 && q.correct < q.options.length)) {
      backWithError(PATH, 'Revisá el quiz: cada pregunta necesita texto, de 2 a 5 opciones y el número de la correcta.')
    }
  }
  const db = createSupabaseAdmin()
  const { data: quiz, error } = await db.from('quizzes').insert({ title }).select('id').single()
  if (error || !quiz) backWithError(PATH, `No se pudo crear el quiz: ${error?.message ?? 'error desconocido'}`)
  for (const [i, q] of questions.entries()) {
    const { data: row } = await db
      .from('quiz_questions')
      .insert({ quiz_id: quiz.id, position: i + 1, question: q.question, options: q.options })
      .select('id')
      .single()
    if (row) await db.from('quiz_answer_keys').insert({ question_id: row.id, correct_index: q.correct })
  }
  revalidatePath(PATH)
  backWithOk(PATH, 'Quiz creado. Ya aparece en el feed de la app.')
}

export async function toggleInteractive(formData: FormData) {
  await requireAdmin()
  const table = formData.get('kind') === 'quiz' ? 'quizzes' : 'polls'
  await createSupabaseAdmin()
    .from(table)
    .update({ is_active: formData.get('is_active') !== 'true' })
    .eq('id', String(formData.get('id') ?? ''))
  revalidatePath(PATH)
  backWithOk(PATH, formData.get('is_active') === 'true' ? 'Pausado: ya no aparece en la app.' : 'Activado: aparece en el feed.')
}
