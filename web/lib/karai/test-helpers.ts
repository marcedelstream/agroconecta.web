import type { createSupabaseAdmin } from '@/lib/supabase-admin'

// Cliente de Supabase falso, en memoria, SOLO para tests. Implementa lo justo del query builder que
// usan las rutas y librerías de Karai (select/insert/update/delete + eq/in/or/order/limit/
// maybeSingle/single) y respeta los filtros de verdad: así un test de aislamiento falla si el código
// olvida `.eq('profile_id', …)`, en vez de pasar porque el mock devuelve siempre lo mismo.

type Row = Record<string, unknown>
type Admin = ReturnType<typeof createSupabaseAdmin>
type Tables = Record<string, Row[]>

// Réplica de los `on delete cascade` que importan para los tests (conversations → mensajes).
const CASCADES: Record<string, { child: string; fk: string }[]> = {
  conversations: [{ child: 'conversation_messages', fk: 'conversation_id' }],
}

class FakeQuery implements PromiseLike<{ data: unknown; error: { code?: string; message: string } | null }> {
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private payload: Row | Row[] | null = null
  private filters: ((r: Row) => boolean)[] = []
  private orderCol: string | null = null
  private ascending = true
  private limitN: number | null = null

  constructor(private readonly tables: Tables, private readonly name: string) {}

  select() {
    return this
  }
  insert(payload: Row | Row[]) {
    this.op = 'insert'
    this.payload = payload
    return this
  }
  update(payload: Row) {
    this.op = 'update'
    this.payload = payload
    return this
  }
  delete() {
    this.op = 'delete'
    return this
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val)
    return this
  }
  in(col: string, vals: unknown[]) {
    this.filters.push((r) => vals.includes(r[col]))
    return this
  }
  // `or` con filtros de texto de PostgREST no se interpreta: los tests que lo usan siembran tablas vacías.
  or() {
    return this
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col
    this.ascending = opts?.ascending ?? true
    return this
  }
  limit(n: number) {
    this.limitN = n
    return this
  }
  async maybeSingle() {
    const res = this.run()
    const rows = (res.data as Row[] | null) ?? []
    return { data: rows[0] ?? null, error: res.error }
  }
  async single() {
    const res = await this.maybeSingle()
    return res.data ? res : { data: null, error: { message: 'No rows' } }
  }

  then<T1, T2>(
    onfulfilled?: ((value: { data: unknown; error: { code?: string; message: string } | null }) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
  ): PromiseLike<T1 | T2> {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected)
  }

  private matching(): Row[] {
    const rows = this.tables[this.name] ?? (this.tables[this.name] = [])
    return rows.filter((r) => this.filters.every((f) => f(r)))
  }

  private run(): { data: unknown; error: { code?: string; message: string } | null } {
    const table = this.tables[this.name] ?? (this.tables[this.name] = [])

    if (this.op === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
      for (const item of items) table.push({ id: `${this.name}-${table.length + 1}`, ...item })
      return { data: items, error: null }
    }

    if (this.op === 'update') {
      for (const r of this.matching()) Object.assign(r, this.payload)
      return { data: null, error: null }
    }

    if (this.op === 'delete') {
      const doomed = new Set(this.matching())
      this.tables[this.name] = table.filter((r) => !doomed.has(r))
      for (const { child, fk } of CASCADES[this.name] ?? []) {
        const ids = new Set([...doomed].map((r) => r.id))
        this.tables[child] = (this.tables[child] ?? []).filter((c) => !ids.has(c[fk]))
      }
      return { data: null, error: null }
    }

    let rows = this.matching().map((r) => ({ ...r }))
    if (this.orderCol) {
      const col = this.orderCol
      rows = rows.sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (this.ascending ? 1 : -1))
    }
    if (this.limitN !== null) rows = rows.slice(0, this.limitN)
    return { data: rows, error: null }
  }
}

export function createFakeAdmin(seed: Tables = {}) {
  const tables: Tables = Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, v.map((r) => ({ ...r }))]))
  const admin = { from: (name: string) => new FakeQuery(tables, name) } as unknown as Admin
  return { admin, tables }
}
