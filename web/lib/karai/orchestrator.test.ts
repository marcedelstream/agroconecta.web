import { describe, expect, it } from 'vitest'
import { recordLeadIfCommercial } from './orchestrator'

// Requisito explícito del producto (2026-09-01): el admin NUNCA debe poder leer las conversaciones
// privadas de los usuarios — cuando Karai detecta intención comercial, solo se guarda el mensaje
// puntual que la disparó, no el resto del historial. Esta es la regla más sensible de todo Karai;
// si algún día alguien "simplifica" recordLeadIfCommercial para guardar más contexto, este test
// tiene que romperse.
function fakeAdmin() {
  const inserts: { table: string; payload: unknown }[] = []
  return {
    inserts,
    from(table: string) {
      return {
        insert(payload: unknown) {
          inserts.push({ table, payload })
          return Promise.resolve({ error: null })
        },
      }
    },
  } as unknown as Parameters<typeof recordLeadIfCommercial>[0]
}

describe('recordLeadIfCommercial — no debe filtrar más que el mensaje puntual', () => {
  it('guarda el lead con el excerpt EXACTO del mensaje, nada más', async () => {
    const admin = fakeAdmin()
    const message = 'tengo 180 cabezas de ganado para vender'
    await recordLeadIfCommercial(admin, 'profile-1', 'conv-1', message)

    const leadInserts = (admin as unknown as ReturnType<typeof fakeAdmin>).inserts.filter((i) => i.table === 'karai_leads')
    expect(leadInserts).toHaveLength(1)
    expect(leadInserts[0].payload).toEqual({
      profile_id: 'profile-1',
      conversation_id: 'conv-1',
      excerpt: message,
    })
  })

  it('el payload nunca incluye un campo de historial/mensajes completos', async () => {
    const admin = fakeAdmin()
    await recordLeadIfCommercial(admin, 'profile-1', 'conv-1', 'busco comprador para mi soja')
    const payload = (admin as unknown as ReturnType<typeof fakeAdmin>).inserts[0].payload as Record<string, unknown>
    expect(Object.keys(payload).sort()).toEqual(['conversation_id', 'excerpt', 'profile_id'])
  })

  it('no crea ningún lead si el mensaje no tiene intención comercial', async () => {
    const admin = fakeAdmin()
    await recordLeadIfCommercial(admin, 'profile-1', 'conv-1', 'que precio tiene la soja hoy')
    expect((admin as unknown as ReturnType<typeof fakeAdmin>).inserts).toHaveLength(0)
  })
})
