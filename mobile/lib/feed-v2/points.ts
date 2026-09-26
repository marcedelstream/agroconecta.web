import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { QuizAnswer } from './types'

// Puntos (BACKEND-Y-DATOS.md §5). Todo pasa por funciones del servidor (supabase/fix-v2-points.sql):
// la app solo muestra el saldo y manda la respuesta; nunca suma puntos por su cuenta.

export interface PointsMovement {
  delta: number
  description: string
  created_at: string
}

export interface PointsSummary {
  balance: number
  history: PointsMovement[]
}

const EMPTY: PointsSummary = { balance: 0, history: [] }

// Aviso de "cambió el saldo" para que la píldora del feed y la tarjeta del perfil se actualicen solas.
const listeners = new Set<() => void>()
export function notifyPointsChanged() {
  listeners.forEach((l) => l())
}

export async function fetchPointsSummary(): Promise<PointsSummary> {
  const { data, error } = await supabase.rpc('get_points_summary')
  if (error || !data) return EMPTY
  return data as PointsSummary
}

export function usePoints() {
  const [summary, setSummary] = useState<PointsSummary>(EMPTY)
  const refresh = useCallback(() => {
    fetchPointsSummary().then(setSummary).catch(() => null)
  }, [])
  useEffect(() => {
    refresh()
    listeners.add(refresh)
    return () => {
      listeners.delete(refresh)
    }
  }, [refresh])
  return { ...summary, refresh }
}

export interface PollVoteResult {
  myVote: string
  results: Record<string, number>
  awarded: number
}

export async function votePoll(pollId: string, optionId: string): Promise<PollVoteResult | null> {
  const { data, error } = await supabase.rpc('vote_poll', { p_poll: pollId, p_option: optionId })
  if (error || !data) return null
  if ((data as PollVoteResult).awarded > 0) notifyPointsChanged()
  return data as PollVoteResult
}

export type QuizAnswerResult = Omit<QuizAnswer, 'questionId'> & { awarded: number }

export async function answerQuiz(questionId: string, choice: number): Promise<QuizAnswerResult | null> {
  const { data, error } = await supabase.rpc('answer_quiz', { p_question: questionId, p_choice: choice })
  if (error || !data) return null
  if ((data as QuizAnswerResult).awarded > 0) notifyPointsChanged()
  return data as QuizAnswerResult
}

/** Puntos de bienvenida configurados (para mostrarlos en la tarjeta de invitado). */
export async function fetchWelcomePoints(): Promise<number | null> {
  const { data } = await supabase.from('points_config').select('value').eq('key', 'welcome').maybeSingle()
  const value = (data as { value: number | null } | null)?.value
  return value ? Number(value) : null
}

/** Bienvenida al terminar el onboarding. Idempotente en el servidor: llamarla dos veces no suma dos veces. */
export async function claimWelcomePoints(): Promise<number> {
  const { data, error } = await supabase.rpc('claim_welcome_points')
  if (error) return 0
  const awarded = Number(data ?? 0)
  if (awarded > 0) notifyPointsChanged()
  return awarded
}
