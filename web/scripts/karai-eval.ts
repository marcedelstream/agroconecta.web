// Mide la calidad de Karai con el banco de preguntas (lib/karai/eval/bank.ts). Uso, desde web/:
//   npm run karai:eval                 → todas las preguntas
//   npm run karai:eval -- sanidad      → solo un área
// Necesita en .env.local: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (y las de eventos).
// Opcional KARAI_EVAL_PROFILE=<uuid> para probar con los datos de Mi campo de una cuenta de prueba.
// Deja el informe en docs/karai-evals/<fecha>.md. Cada corrida gasta créditos de OpenAI (unas 60 consultas).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
}

const NO_PROFILE = '00000000-0000-0000-0000-000000000000'

interface Row {
  id: string
  area: string
  question: string
  answer: string
  ruleFails: string[]
  score: number | null
  reason: string
}

const JUDGE_PROMPT = `Sos un evaluador exigente de un asistente agropecuario para Paraguay. Recibís la pregunta, lo que se espera de una buena respuesta, el contexto de datos que tenía el asistente y su respuesta.
Puntuá de 1 a 5:
5 = precisa, usa los datos del contexto con su fecha, no inventa nada, formato claro y voseo.
4 = buena con un detalle menor.
3 = aceptable pero le falta algo importante de lo esperado.
2 = imprecisa, desactualizada o mal formateada.
1 = inventa datos, es peligrosa o no responde.
Respondé SOLO con JSON: {"puntaje": <1-5>, "motivo": "<una frase>"}`

async function main() {
  const { createSupabaseAdmin } = await import('@/lib/supabase-admin')
  const { buildContext } = await import('@/lib/karai/context')
  const { getAIProvider } = await import('@/lib/karai/ai-provider')
  const { classifyMessage, OUT_OF_SCOPE_REPLY, UNSAFE_REPLY } = await import('@/lib/karai/classifier')
  const { SYSTEM_PROMPT } = await import('@/lib/karai/orchestrator')
  const { BLOCKED_CATEGORIES } = await import('@/lib/karai/types')
  const { EVAL_BANK } = await import('@/lib/karai/eval/bank')

  const provider = getAIProvider()
  if (!provider) throw new Error('Falta OPENAI_API_KEY en .env.local')
  const admin = createSupabaseAdmin()
  const profileId = process.env.KARAI_EVAL_PROFILE || NO_PROFILE
  const area = process.argv[2]
  const cases = area ? EVAL_BANK.filter((c) => c.area === area) : EVAL_BANK

  const rows: Row[] = []
  for (const c of cases) {
    const category = classifyMessage(c.question)
    let answer: string
    let context = ''
    if (BLOCKED_CATEGORIES.includes(category)) {
      answer = category === 'unsafe_or_abusive' ? UNSAFE_REPLY : OUT_OF_SCOPE_REPLY
    } else {
      context = await buildContext(admin, profileId, c.question)
      const res = await provider.generate({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: `Contexto de Agroconecta:\n${context}` },
          { role: 'user', content: c.question },
        ],
      })
      answer = res.text
    }

    const ruleFails = [
      ...(c.must ?? []).filter((r) => !r.test(answer)).map((r) => `falta ${r}`),
      ...(c.mustNot ?? []).filter((r) => r.test(answer)).map((r) => `no debería tener ${r}`),
    ]

    let score: number | null = null
    let reason = ''
    try {
      const judged = await provider.generate({
        messages: [
          { role: 'system', content: JUDGE_PROMPT },
          { role: 'user', content: `Pregunta: ${c.question}\nSe espera: ${c.expectation}\n\nContexto del asistente:\n${context.slice(0, 6000)}\n\nRespuesta:\n${answer}` },
        ],
        maxOutputTokens: 800,
      })
      const parsed = JSON.parse(/\{[\s\S]*\}/.exec(judged.text)?.[0] ?? '{}') as { puntaje?: number; motivo?: string }
      score = typeof parsed.puntaje === 'number' ? parsed.puntaje : null
      reason = parsed.motivo ?? ''
    } catch (err) {
      reason = `el juez falló: ${(err as Error).message}`
    }

    rows.push({ id: c.id, area: c.area, question: c.question, answer, ruleFails, score, reason })
    console.log(`${score ?? '?'}/5 ${ruleFails.length ? '✗' : '✓'} ${c.id} — ${reason}`)
  }

  const scored = rows.filter((r) => r.score !== null)
  const avg = scored.reduce((s, r) => s + (r.score ?? 0), 0) / Math.max(1, scored.length)
  const failedRules = rows.filter((r) => r.ruleFails.length).length
  const date = new Date().toLocaleString('sv-SE', { timeZone: 'America/Asuncion' }).replace(/[: ]/g, '-').slice(0, 16)

  const report = [
    `# Evaluación de Karai — ${date}`,
    '',
    `Promedio: **${avg.toFixed(2)} / 5** en ${scored.length} preguntas · reglas incumplidas en ${failedRules}.`,
    '',
    '| Puntaje | Reglas | Pregunta | Motivo |',
    '|---|---|---|---|',
    ...rows.map((r) => `| ${r.score ?? '?'} | ${r.ruleFails.length ? r.ruleFails.join('; ') : 'ok'} | ${r.question} | ${r.reason} |`),
    '',
    '## Respuestas',
    ...rows.flatMap((r) => ['', `### ${r.id} (${r.score ?? '?'}/5)`, `**${r.question}**`, '', r.answer]),
  ].join('\n')

  mkdirSync('../docs/karai-evals', { recursive: true })
  writeFileSync(`../docs/karai-evals/${date}.md`, report)
  console.log(`\nPromedio ${avg.toFixed(2)}/5 · informe en docs/karai-evals/${date}.md`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
