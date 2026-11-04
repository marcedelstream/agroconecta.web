import { CreateDrawer } from '@/components/admin/CreateDrawer'
import { FieldLabel } from '@/components/admin/ui'
import { updatePoll, updateQuiz } from './actions'

export interface EditablePoll {
  id: string
  question: string
  poll_options: { label: string; position: number }[]
}

export interface EditableQuiz {
  id: string
  title: string
  quiz_questions: { id: string; position: number; question: string; options: string[] }[]
}

// Editar encuestas y quiz ya creados (pedido 2026-11-04), con el mismo panel lateral que el alta.
export function EditPoll({ poll }: { poll: EditablePoll }) {
  const options = [...poll.poll_options].sort((a, b) => a.position - b.position).map((o) => o.label).join('\n')
  return (
    <CreateDrawer variant="edit" label="Editar" title="Editar encuesta" description="Los votos ya hechos se mantienen. Una opción con votos se puede reescribir pero no borrar.">
      <form action={updatePoll} className="space-y-3">
        <input type="hidden" name="id" value={poll.id} />
        <div>
          <FieldLabel htmlFor={`pq-${poll.id}`}>Pregunta</FieldLabel>
          <input id={`pq-${poll.id}`} name="question" required defaultValue={poll.question} className="input" />
        </div>
        <div>
          <FieldLabel htmlFor={`po-${poll.id}`} help="Una opción por línea, entre 2 y 5.">Opciones</FieldLabel>
          <textarea id={`po-${poll.id}`} name="options" required defaultValue={options} className="input min-h-[110px]" />
        </div>
        <button type="submit" className="btn-primary text-sm w-full">Guardar cambios</button>
      </form>
    </CreateDrawer>
  )
}

export function EditQuiz({ quiz, correct }: { quiz: EditableQuiz; correct: Map<string, number> }) {
  const questions = [...quiz.quiz_questions].sort((a, b) => a.position - b.position)
  return (
    <CreateDrawer variant="edit" label="Editar" title="Editar quiz" description="Los puntos que ya ganó la gente no cambian.">
      <form action={updateQuiz} className="space-y-3">
        <input type="hidden" name="id" value={quiz.id} />
        <div>
          <FieldLabel htmlFor={`qt-${quiz.id}`}>Título</FieldLabel>
          <input id={`qt-${quiz.id}`} name="title" required defaultValue={quiz.title} className="input" />
        </div>
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-2 border-t border-white/10 pt-3">
            <input name={`q${i}`} required defaultValue={q.question} className="input" placeholder={`Pregunta ${i + 1}`} />
            <textarea name={`o${i}`} required defaultValue={q.options.join('\n')} className="input min-h-[80px]" placeholder="Una opción por línea" />
            <FieldLabel help="Contá desde arriba: la primera opción es 1, la segunda es 2…">Número de la opción correcta</FieldLabel>
            <input name={`c${i}`} required type="number" min={1} max={5} defaultValue={(correct.get(q.id) ?? 0) + 1} className="input" />
          </div>
        ))}
        <button type="submit" className="btn-primary text-sm w-full">Guardar cambios</button>
      </form>
    </CreateDrawer>
  )
}
