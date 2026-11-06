import type { NextRequest } from 'next/server'

/**
 * Tareas programadas (vercel.json). CRON_SECRET: Vercel lo manda solo como "Bearer" en cada corrida.
 * SYNDICATION_RUN_TOKEN: para correrlas a mano. Sin ninguno configurado, solo se permite fuera de producción.
 */
export function isCronAuthorized(request: NextRequest): boolean {
  const tokens = [process.env.SYNDICATION_RUN_TOKEN, process.env.CRON_SECRET].filter((t): t is string => !!t)
  if (tokens.length === 0) return process.env.NODE_ENV !== 'production'
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const queryToken = request.nextUrl.searchParams.get('token')
  return tokens.some((t) => bearer === t || queryToken === t)
}
