import { createSupabaseAdmin } from '@/lib/supabase-admin'
import { createPoll, createQuiz, toggleInteractive } from './actions'
import { EmptyState, FieldLabel, Notice, PageHeader } from '@/components/admin/ui'
import type { FeedbackParams } from '@/lib/admin-feedback'

export const dynamic = 'force-dynamic'

interface PollRow {
  id: string
  question: string
  is_active: boolean
  poll_votes: { count: number }[]
}

interface QuizRow {
  id: string
  title: string
  is_active: boolean
  quiz_questions: { count: number }[]
}

function ToggleForm({ id, kind, active }: { id: string; kind: 'poll' | 'quiz'; active: boolean }) {
  return (
    <form action={toggleInteractive}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="is_active" value={String(active)} />
      <button type="submit" className={active ? 'btn-primary text-xs' : 'btn-ghost text-xs'}>{active ? 'Activa — pausar' : 'Activar'}</button>
    </form>
  )
}

// Encuestas y quiz del feed v2. Dan puntos (los otorga la base, una sola vez por usuario): valores en
// la tabla points_config.
export default async function EncuestasPage({ searchParams }: { searchParams: Promise<FeedbackParams> }) {
  const feedback = await searchParams
  const db = createSupabaseAdmin()
  const [polls, quizzes] = await Promise.all([
    db.from('polls').select('id,question,is_active,poll_votes(count)').order('created_at', { ascending: false }),
    db.from('quizzes').select('id,title,is_active,quiz_questions(count)').order('created_at', { ascending: false }),
  ])
  const error = polls.error ?? quizzes.error

  return (
    <div className="max-w-6xl space-y-8">
      <PageHeader title="Encuestas y quiz" help="Aparecen en el feed de la app (una cada 8 publicaciones) y dan puntos al responder." />
      <Notice {...feedback} />

      {error && <div className="card border-danger/40 text-danger text-sm">No se pudo leer (¿se corrió fix-v2-points.sql?): {error.message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <form action={createPoll} className="card space-y-3">
          <h2 className="font-display font-semibold text-lg text-foreground">Nueva encuesta</h2>
          <div>
            <FieldLabel htmlFor="poll-q">Pregunta</FieldLabel>
            <input id="poll-q" name="question" required className="input" placeholder="¿Cuál es tu mayor desafío esta zafra?" />
          </div>
          <div>
            <FieldLabel htmlFor="poll-o" help="Una opción por línea, entre 2 y 5. Al votar, la persona ve los porcentajes y suma puntos.">Opciones</FieldLabel>
            <textarea id="poll-o" name="options" required className="input min-h-[110px]" placeholder={'Costo de insumos\nClima\nPrecio de venta'} />
          </div>
          <button type="submit" className="btn-primary text-sm w-full">Crear encuesta</button>
        </form>

        <form action={createQuiz} className="card space-y-3">
          <h2 className="font-display font-semibold text-lg text-foreground">Nuevo quiz</h2>
          <div>
            <FieldLabel htmlFor="quiz-t" help="Son 3 preguntas. Cada acierto suma puntos; la respuesta correcta nunca se muestra antes de responder.">Título</FieldLabel>
            <input id="quiz-t" name="title" required className="input" placeholder="Quiz agro de la semana" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 border-t border-white/10 pt-3">
              <input name={`q${i}`} required className="input" placeholder={`Pregunta ${i + 1}`} />
              <textarea name={`o${i}`} required className="input min-h-[80px]" placeholder="Una opción por línea" />
              <FieldLabel help="Contá desde arriba: la primera opción es 1, la segunda es 2…">Número de la opción correcta</FieldLabel>
              <input name={`c${i}`} required type="number" min={1} max={5} className="input" placeholder="1" />
            </div>
          ))}
          <button type="submit" className="btn-primary text-sm w-full">Crear quiz</button>
        </form>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="admin-table">
          <thead><tr><th>Tipo</th><th>Contenido</th><th>Participación</th><th>Estado</th></tr></thead>
          <tbody>
            {((polls.data ?? []) as PollRow[]).map((p) => (
              <tr key={p.id}>
                <td>Encuesta</td>
                <td className="text-foreground">{p.question}</td>
                <td>{p.poll_votes?.[0]?.count ?? 0} votos</td>
                <td><ToggleForm id={p.id} kind="poll" active={p.is_active} /></td>
              </tr>
            ))}
            {((quizzes.data ?? []) as QuizRow[]).map((q) => (
              <tr key={q.id}>
                <td>Quiz</td>
                <td className="text-foreground">{q.title}</td>
                <td>{q.quiz_questions?.[0]?.count ?? 0} preguntas</td>
                <td><ToggleForm id={q.id} kind="quiz" active={q.is_active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
